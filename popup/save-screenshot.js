// Enregistrement de la capture affichée dans la popup via l'API de
// téléchargements du navigateur.
//
// La popup conserve la capture sous forme d'« adresse de données » (data URL)
// exactement identique à celle affichée : cette adresse est convertie en une
// URL interne (blob URL) dont le contenu est octet pour octet celui de la
// capture consultée. Le fichier produit par le navigateur correspond donc à
// l'image affichée, sans modification de son contenu.
//
// Compatibilité navigateurs : Firefox expose cette API uniquement sous
// `browser.downloads` alors que Chrome l'expose sous `chrome.downloads` (et,
// depuis Chrome 148, également sous `browser.downloads`). Le module utilise
// la première forme disponible, les deux étant basées sur des promesses.
//
// Le téléchargement est lancé dans le dossier de téléchargement par défaut,
// sous un nom horodaté « captio-xxxxxx.png » ; le navigateur désambiguïse
// automatiquement un nom déjà présent pour ne jamais écraser un fichier
// existant. L'URL interne est libérée dès la fin du téléchargement.
//
// Le module n'embarque que l'opération d'enregistrement ; le rendu de
// l'interface (bouton « Enregistrer », retours visuels) appartient à
// screenshot-display.js.

import { dataUrlToBlob, isPngDataUrl } from "./capture-data.js";

const FILENAME_PREFIX = "captio-";
const FILENAME_EXTENSION = ".png";
const CONFLICT_ACTION_UNIQUIFY = "uniquify";
const DOWNLOAD_TIMEOUT_MS = 60_000;

const STATE_COMPLETE = "complete";
const TERMINAL_STATES = new Set(["complete", "interrupted", "cancelled"]);

const MESSAGES = {
  invalidData: "Aucune capture valide à enregistrer.",
  unavailable:
    "L'enregistrement est indisponible. Vérifiez que la permission « downloads » est accordée, puis réessayez.",
  startFailed: "L'enregistrement n'a pas pu être lancé. Réessayez.",
  interrupted:
    "L'enregistrement de la capture n'a pas pu être effectué. Réessayez.",
  timeout: "L'enregistrement a pris trop de temps. Réessayez.",
};

function padStartTwo(value) {
  return String(value).padStart(2, "0");
}

// Nom du fichier enregistré : « captio-xxxxxx.png », où xxxxxx est l'heure
// locale (HHMMSS) au moment de l'enregistrement. Un nouveau fichier peut
// être créé chaque seconde ; en cas de collision, le navigateur ajoute un
// suffixe entre parenthèses (unicité, jamais d'écrasement).
export function buildScreenshotFilename(date = new Date()) {
  const timeSuffix = [
    padStartTwo(date.getHours()),
    padStartTwo(date.getMinutes()),
    padStartTwo(date.getSeconds()),
  ].join("");
  return `${FILENAME_PREFIX}${timeSuffix}${FILENAME_EXTENSION}`;
}

function wait(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

// Renvoie l'objet API « downloads » du navigateur (browser.downloads en
// premier lieu pour Firefox, chrome.downloads ensuite pour Chrome), ou null
// si aucun des deux n'est disponible.
function getDownloadsApi() {
  if (typeof globalThis.browser?.downloads?.download === "function") {
    return globalThis.browser.downloads;
  }
  if (typeof chrome.downloads?.download === "function") {
    return chrome.downloads;
  }
  return null;
}

// Convertit la data URL de la capture en URL interne (blob URL), de contenu
// identique : un téléchargement à partir d'une URL blob est plus fiable d'un
// navigateur à l'autre qu'un envoi direct d'une data URL.
async function toBlobUrl(dataUrl) {
  try {
    const blob = await dataUrlToBlob(dataUrl);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(
      "[Captio] Conversion de la capture en URL interne impossible :",
      error,
    );
    throw new Error(MESSAGES.startFailed);
  }
}

// Attend qu'un téléchargement atteigne un état final (terminé, interrompu ou
// annulé). L'écouteur d'événements est complété par une interrogation de
// l'état courant : un téléchargement peut en effet déjà être terminé avant
// que l'écouteur soit posé.
async function waitForTerminalState(downloadsApi, downloadId) {
  let terminalState = null;
  let signal;
  const reachedTerminalState = new Promise((resolve) => {
    signal = resolve;
  });

  const onChanged = (delta) => {
    const state = delta && delta.state && delta.state.current;
    if (delta && delta.id === downloadId && TERMINAL_STATES.has(state)) {
      terminalState = state;
      signal();
    }
  };

  downloadsApi.onChanged.addListener(onChanged);
  try {
    try {
      const [item] = await downloadsApi.search({ id: downloadId });
      if (item && TERMINAL_STATES.has(item.state)) {
        terminalState = item.state;
      } else {
        await Promise.race([reachedTerminalState, wait(DOWNLOAD_TIMEOUT_MS)]);
      }
    } catch (error) {
      console.error("[Captio] Suivi de l'enregistrement impossible :", error);
      throw new Error(MESSAGES.startFailed);
    }
  } finally {
    downloadsApi.onChanged.removeListener(onChanged);
  }

  // null signifie que le délai d'attente a été dépassé.
  return terminalState;
}

export async function saveScreenshot(dataUrl) {
  if (!isPngDataUrl(dataUrl)) {
    throw new Error(MESSAGES.invalidData);
  }

  const downloadsApi = getDownloadsApi();
  if (!downloadsApi) {
    throw new Error(MESSAGES.unavailable);
  }

  const filename = buildScreenshotFilename();

  let downloadUrl = null;
  try {
    downloadUrl = await toBlobUrl(dataUrl);

    let downloadId;
    try {
      downloadId = await downloadsApi.download({
        url: downloadUrl,
        filename,
        conflictAction: CONFLICT_ACTION_UNIQUIFY,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error("[Captio] Démarrage de l'enregistrement impossible :", detail);
      if (/permission|not allow/i.test(detail)) {
        throw new Error(MESSAGES.unavailable);
      }
      throw new Error(MESSAGES.startFailed);
    }

    const terminalState = await waitForTerminalState(downloadsApi, downloadId);

    if (terminalState === STATE_COMPLETE) {
      return { filename };
    }
    if (terminalState === null) {
      throw new Error(MESSAGES.timeout);
    }
    console.error(`[Captio] Enregistrement interrompu (état : ${terminalState}).`);
    throw new Error(MESSAGES.interrupted);
  } finally {
    // L'URL interne n'est plus nécessaire une fois le téléchargement terminé
    // (ou en échec) : on libère immédiatement sa mémoire.
    if (downloadUrl !== null) {
      URL.revokeObjectURL(downloadUrl);
    }
  }
}
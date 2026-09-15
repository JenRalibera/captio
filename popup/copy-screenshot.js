// Copie de la capture affichée dans la popup vers le presse-papiers du
// système, via l'API asynchrone du presse-papiers (navigator.clipboard).
//
// La popup conserve la capture sous forme de data URL PNG. Cette adresse est
// convertie en un objet Blob octet pour octet identique à la capture
// affichée, puis déposée dans le presse-papiers en tant qu'image PNG : le
// contenu collé dans une autre application correspond donc exactement à la
// capture consultée.
//
// L'API navigator.clipboard.write nécessite que le document soit focalisé
// (c'est le cas de la popup lorsque l'utilisateur clique sur « Copier ») et
// la permission « clipboardWrite » déclarée dans le manifeste. Le module ne
// gère que l'opération de copie ; le rendu de l'interface (bouton « Copier »,
// retours visuels) appartient à screenshot-display.js.
//
// Périmètre : la capture est copiée dans le presse-papiers local de
// l'utilisateur et n'est jamais transmise hors de l'appareil.

import { dataUrlToBlob, isPngDataUrl } from "./capture-data.js";

const CLIPBOARD_ITEM_TYPE = "image/png";

const MESSAGES = {
  invalidData: "Aucune capture valide à copier.",
  unavailable:
    "La copie est indisponible. Vérifiez que la permission « clipboardWrite » est accordée, puis réessayez.",
  copyFailed:
    "La capture n'a pas pu être copiée dans le presse-papiers. Réessayez.",
};

// La copie d'une image repose sur navigator.clipboard.write et sur
// ClipboardItem, qui ne sont pas disponibles dans tous les navigateurs.
function isClipboardWriteAvailable() {
  return (
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyScreenshotToClipboard(dataUrl) {
  if (!isPngDataUrl(dataUrl)) {
    throw new Error(MESSAGES.invalidData);
  }

  if (!isClipboardWriteAvailable()) {
    throw new Error(MESSAGES.unavailable);
  }

  let blob;
  try {
    blob = await dataUrlToBlob(dataUrl);
  } catch (error) {
    console.error(
      "[Captio] Préparation de la capture pour la copie impossible :",
      error,
    );
    throw new Error(MESSAGES.copyFailed);
  }

  try {
    const item = new ClipboardItem({ [CLIPBOARD_ITEM_TYPE]: blob });
    await navigator.clipboard.write([item]);
  } catch (error) {
    console.error(
      "[Captio] Échec de la copie de la capture dans le presse-papiers :",
      error,
    );
    throw new Error(MESSAGES.copyFailed);
  }
}

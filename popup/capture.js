// Déclenchement d'une capture de l'onglet actif via
// chrome.tabs.captureVisibleTab.
//
// La permission `activeTab`, accordée lorsque l'utilisateur clique sur
// l'icône de l'extension pour ouvrir la popup, autorise la capture de la
// partie actuellement visible de l'onglet actif de la fenêtre de la popup.
// Le contenu accessible uniquement après défilement n'est pas inclus.
//
// Périmètre de la fonctionnalité : la capture n'est ni affichée, ni
// enregistrée par l'extension. La donnée renvoyée est aussitôt abandonnée.

const CAPTURE_OPTIONS = { format: "png" };

const MESSAGES = {
  restrictedPage:
    "Cette page ne peut pas être capturée. Certaines pages du navigateur sont interdites de capture.",
  tabUnavailable:
    "L'onglet actif est momentanément indisponible. Réessayez dans un instant.",
  unexpected:
    "La capture a échoué pour une raison inattendue. Ouvrez chrome://extensions, puis la console du service worker pour plus de détails.",
};

function describeLastError(lastErrorMessage) {
  if (/cannot access|permission|activeTab|not granted/i.test(lastErrorMessage)) {
    return MESSAGES.restrictedPage;
  }
  if (/cannot be edited right now|dragging|tabs cannot be accessed/i.test(lastErrorMessage)) {
    return MESSAGES.tabUnavailable;
  }
  return MESSAGES.unexpected;
}

export function captureActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(CAPTURE_OPTIONS, (dataUrl) => {
      if (chrome.runtime.lastError) {
        const detail = chrome.runtime.lastError.message;
        console.error("[Captio] Échec de la capture de l'onglet actif :", detail);
        reject(new Error(describeLastError(detail)));
        return;
      }

      if (!dataUrl) {
        console.error("[Captio] Capture de l'onglet actif : aucune donnée renvoyée.");
        reject(new Error(MESSAGES.unexpected));
        return;
      }

      resolve(dataUrl);
    });
  });
}
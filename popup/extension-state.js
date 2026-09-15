// Accès à l'état actif de l'extension via chrome.storage.local.
//
// L'état est persisté car la popup est détruite à chaque fermeture : un
// simple état en mémoire ne survivrait pas entre deux ouvertures, et
// l'utilisateur devrait réactiver l'extension avant chaque capture.

const STORAGE_KEY = "extensionActive";

export async function loadActiveState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return stored[STORAGE_KEY] === true;
}

export async function saveActiveState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: true });
}

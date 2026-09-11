// Affiche la version de l'extension lue depuis le manifest.
// Conservé volontairement minimal : la capture d'écran arrive dans une
// prochaine fonctionnalité.

const VERSION_ID = "extension-version";

function displayExtensionVersion() {
  const versionElement = document.getElementById(VERSION_ID);
  if (!versionElement) {
    return;
  }

  const { version } = chrome.runtime.getManifest();
  versionElement.textContent = version;
}

displayExtensionVersion();
// Gère l'état actif de l'extension.
//
// L'état est persisté via chrome.storage.local : la popup est détruite à
// chaque fermeture, un simple état en mémoire ne survivrait donc pas entre
// deux ouvertures et l'utilisateur devrait réactiver l'extension avant
// chaque capture.
//
// La réalisation et l'affichage de la capture ne font pas partie de ce
// périmètre : seule la mise à disposition de son accès est traitée ici.

const STORAGE_KEY = "extensionActive";

const STATUS_SECTION_ID = "status-section";
const STATUS_BADGE_ID = "status-badge";
const STATUS_DETAIL_ID = "status-detail";
const ACTIVATION_PANEL_ID = "activation-panel";
const CAPTURE_PANEL_ID = "capture-panel";
const CAPTURE_HEADING_ID = "capture-heading";
const ACTIVATE_BUTTON_ID = "activate-button";
const VERSION_ID = "extension-version";

const STATUS_INACTIVE = "panel__status--inactive";
const STATUS_ACTIVE = "panel__status--active";
const STATUS_ERROR = "panel__status--error";
const STATUS_MODIFIERS = [STATUS_INACTIVE, STATUS_ACTIVE, STATUS_ERROR];

const MESSAGES = {
  inactiveBadge: "Extension inactive",
  inactiveDetail:
    "Activez l'extension pour rendre la fonctionnalité de capture disponible.",
  activeBadge: "✓ Extension active",
  activeDetail:
    "La fonctionnalité de capture est maintenant accessible.",
  readErrorBadge: "État indisponible",
  readErrorDetail:
    "Impossible de lire l'état de l'extension. Vous pouvez tenter l'activation pour réessayer.",
  writeErrorBadge: "Activation impossible",
  writeErrorDetail:
    "L'état n'a pas pu être enregistré. Vérifiez que la permission « storage » est accordée, puis réessayez.",
};

function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Élément introuvable dans la popup : #${id}`);
  }
  return element;
}

const statusSection = getElement(STATUS_SECTION_ID);
const statusBadge = getElement(STATUS_BADGE_ID);
const statusDetail = getElement(STATUS_DETAIL_ID);
const activationPanel = getElement(ACTIVATION_PANEL_ID);
const capturePanel = getElement(CAPTURE_PANEL_ID);
const captureHeading = getElement(CAPTURE_HEADING_ID);
const activateButton = getElement(ACTIVATE_BUTTON_ID);

function setStatus(modifier, badgeText, detailText) {
  statusSection.classList.remove(...STATUS_MODIFIERS);
  statusSection.classList.add(modifier);
  statusBadge.textContent = badgeText;
  statusDetail.textContent = detailText;
}

function renderInactive() {
  setStatus(STATUS_INACTIVE, MESSAGES.inactiveBadge, MESSAGES.inactiveDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

function renderActive() {
  setStatus(STATUS_ACTIVE, MESSAGES.activeBadge, MESSAGES.activeDetail);
  activationPanel.hidden = true;
  capturePanel.hidden = false;
}

function renderReadError() {
  setStatus(STATUS_ERROR, MESSAGES.readErrorBadge, MESSAGES.readErrorDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

function renderWriteError() {
  setStatus(STATUS_ERROR, MESSAGES.writeErrorBadge, MESSAGES.writeErrorDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

async function activateExtension() {
  activateButton.disabled = true;
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: true });
    renderActive();
    captureHeading.focus();
  } catch (error) {
    console.error("[Captio] Impossible d'enregistrer l'activation :", error);
    renderWriteError();
    activateButton.disabled = false;
  }
}

async function loadActiveState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return stored[STORAGE_KEY] === true;
}

function displayExtensionVersion() {
  const versionElement = getElement(VERSION_ID);
  const { version } = chrome.runtime.getManifest();
  versionElement.textContent = version;
}

async function initialize() {
  displayExtensionVersion();

  try {
    const isActive = await loadActiveState();
    if (isActive) {
      renderActive();
    } else {
      renderInactive();
    }
  } catch (error) {
    console.error("[Captio] Impossible de lire l'état de l'extension :", error);
    renderReadError();
  }
}

activateButton.addEventListener("click", activateExtension);

initialize();

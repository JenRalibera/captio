// Rendu de l'interface de la popup : badge d'état, panneau d'activation et
// accès à la fonctionnalité de capture. Toute manipulation du DOM de la
// popup passe par ce module.

const STATUS_SECTION_ID = "status-section";
const STATUS_BADGE_ID = "status-badge";
const STATUS_DETAIL_ID = "status-detail";
const ACTIVATION_PANEL_ID = "activation-panel";
const ACTIVATE_BUTTON_ID = "activate-button";
const CAPTURE_PANEL_ID = "capture-panel";
const CAPTURE_HEADING_ID = "capture-heading";
const CAPTURE_BUTTON_ID = "capture-button";
const CAPTURE_FEEDBACK_ID = "capture-feedback";
const VERSION_ID = "extension-version";

const STATUS_INACTIVE = "panel__status--inactive";
const STATUS_ACTIVE = "panel__status--active";
const STATUS_ERROR = "panel__status--error";
const STATUS_MODIFIERS = [STATUS_INACTIVE, STATUS_ACTIVE, STATUS_ERROR];

const CAPTURE_FEEDBACK_ERROR = "panel__capture-feedback--error";
const CAPTURE_FEEDBACK_SUCCESS = "panel__capture-feedback--success";

const MESSAGES = {
  inactiveBadge: "Extension inactive",
  inactiveDetail:
    "Activez l'extension pour rendre la fonctionnalité de capture disponible.",
  activeBadge: "✓ Extension active",
  activeDetail: "La fonctionnalité de capture est maintenant accessible.",
  readErrorBadge: "État indisponible",
  readErrorDetail:
    "Impossible de lire l'état de l'extension. Vous pouvez tenter l'activation pour réessayer.",
  writeErrorBadge: "Activation impossible",
  writeErrorDetail:
    "L'état n'a pas pu être enregistré. Vérifiez que la permission « storage » est accordée, puis réessayez.",
  capturePending: "Capture en cours…",
  captureSuccess: "✓ Capture réalisée.",
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
const activateButton = getElement(ACTIVATE_BUTTON_ID);
const capturePanel = getElement(CAPTURE_PANEL_ID);
const captureHeading = getElement(CAPTURE_HEADING_ID);
const captureButton = getElement(CAPTURE_BUTTON_ID);
const captureFeedback = getElement(CAPTURE_FEEDBACK_ID);

function setStatus(modifier, badgeText, detailText) {
  statusSection.classList.remove(...STATUS_MODIFIERS);
  statusSection.classList.add(modifier);
  statusBadge.textContent = badgeText;
  statusDetail.textContent = detailText;
}

export function renderInactive() {
  setStatus(STATUS_INACTIVE, MESSAGES.inactiveBadge, MESSAGES.inactiveDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

export function renderActive() {
  setStatus(STATUS_ACTIVE, MESSAGES.activeBadge, MESSAGES.activeDetail);
  activationPanel.hidden = true;
  capturePanel.hidden = false;
  captureButton.disabled = false;
  resetCaptureFeedback();
}

function resetCaptureFeedback() {
  captureFeedback.classList.remove(CAPTURE_FEEDBACK_ERROR, CAPTURE_FEEDBACK_SUCCESS);
  captureFeedback.textContent = "";
}

export function renderReadError() {
  setStatus(STATUS_ERROR, MESSAGES.readErrorBadge, MESSAGES.readErrorDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

export function renderWriteError() {
  setStatus(STATUS_ERROR, MESSAGES.writeErrorBadge, MESSAGES.writeErrorDetail);
  activationPanel.hidden = false;
  capturePanel.hidden = true;
}

export function setActivationPending(isPending) {
  activateButton.disabled = isPending;
}

export function focusCaptureHeading() {
  captureHeading.focus();
}

export function bindActivateButton(handler) {
  activateButton.addEventListener("click", handler);
}

export function setCapturePending(isPending) {
  captureButton.disabled = isPending;
}

export function renderCapturePending() {
  captureButton.disabled = true;
  captureFeedback.classList.remove(CAPTURE_FEEDBACK_ERROR, CAPTURE_FEEDBACK_SUCCESS);
  captureFeedback.textContent = MESSAGES.capturePending;
}

export function renderCaptureSuccess() {
  captureFeedback.classList.remove(CAPTURE_FEEDBACK_ERROR);
  captureFeedback.classList.add(CAPTURE_FEEDBACK_SUCCESS);
  captureFeedback.textContent = MESSAGES.captureSuccess;
}

export function renderCaptureError(detail) {
  captureFeedback.classList.remove(CAPTURE_FEEDBACK_SUCCESS);
  captureFeedback.classList.add(CAPTURE_FEEDBACK_ERROR);
  captureFeedback.textContent = detail;
}

export function bindCaptureButton(handler) {
  captureButton.addEventListener("click", handler);
}

export function displayExtensionVersion() {
  const versionElement = getElement(VERSION_ID);
  const { version } = chrome.runtime.getManifest();
  versionElement.textContent = version;
}

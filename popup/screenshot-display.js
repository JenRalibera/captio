// Rendu de l'espace d'affichage de la capture dans la popup.
//
// Cet espace présente la capture réalisée, ou un état approprié lorsqu'aucune
// capture n'est disponible ou qu'elle ne peut pas être affichée. Il héberge
// également les actions « Copier » et « Enregistrer » et leurs retours
// visuels : ces actions ne sont proposées que lorsqu'une capture est
// effectivement affichée. Toute manipulation du DOM de la popup liée à
// l'affichage de la capture, à sa copie et à son enregistrement passe par ce
// module.

const SCREENSHOT_IMAGE_WRAPPER_ID = "screenshot-image-wrapper";
const SCREENSHOT_IMAGE_ID = "screenshot-image";
const SCREENSHOT_EMPTY_ID = "screenshot-empty";
const SCREENSHOT_ERROR_ID = "screenshot-error";
const SCREENSHOT_ACTIONS_ID = "screenshot-actions";
const COPY_BUTTON_ID = "copy-button";
const COPY_FEEDBACK_ID = "copy-feedback";
const SAVE_BUTTON_ID = "save-button";
const SAVE_FEEDBACK_ID = "save-feedback";

const COPY_FEEDBACK_SUCCESS = "panel__copy-feedback--success";
const COPY_FEEDBACK_ERROR = "panel__copy-feedback--error";
const SAVE_FEEDBACK_SUCCESS = "panel__save-feedback--success";
const SAVE_FEEDBACK_ERROR = "panel__save-feedback--error";

const MESSAGES = {
  copyPending: "Copie en cours…",
  savePending: "Enregistrement en cours…",
};

function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Élément introuvable dans la popup : #${id}`);
  }
  return element;
}

const screenshotImageWrapper = getElement(SCREENSHOT_IMAGE_WRAPPER_ID);
const screenshotImage = getElement(SCREENSHOT_IMAGE_ID);
const screenshotEmpty = getElement(SCREENSHOT_EMPTY_ID);
const screenshotError = getElement(SCREENSHOT_ERROR_ID);
const screenshotActions = getElement(SCREENSHOT_ACTIONS_ID);
const copyButton = getElement(COPY_BUTTON_ID);
const copyFeedback = getElement(COPY_FEEDBACK_ID);
const saveButton = getElement(SAVE_BUTTON_ID);
const saveFeedback = getElement(SAVE_FEEDBACK_ID);

// Ne laisse visible que l'élément passé en argument parmi les trois états
// possibles de l'espace d'affichage (vide, image, erreur).
function displayOnly(elementToDisplay) {
  [screenshotEmpty, screenshotImageWrapper, screenshotError].forEach((element) => {
    element.hidden = element !== elementToDisplay;
  });
}

// Libère l'image précédemment affichée pour ne pas conserver en mémoire la
// capture écrasée ou devenue obsolète.
function resetScreenshotImage() {
  screenshotImage.removeAttribute("src");
}

export function renderScreenshotEmpty() {
  resetScreenshotImage();
  displayOnly(screenshotEmpty);
  hideScreenshotActions();
}

export async function showScreenshot(dataUrl) {
  if (typeof dataUrl !== "string" || dataUrl.length === 0) {
    throw new Error("Aucune donnée de capture à afficher.");
  }

  screenshotImage.src = dataUrl;
  try {
    await screenshotImage.decode();
  } catch (error) {
    console.error("[Captio] Impossible de décoder l'image de la capture :", error);
    resetScreenshotImage();
    throw new Error("L'image de la capture n'a pas pu être décodée.");
  }

  displayOnly(screenshotImageWrapper);
  resetCopyFeedback();
  resetSaveFeedback();
  screenshotActions.hidden = false;
}

export function renderScreenshotError() {
  resetScreenshotImage();
  displayOnly(screenshotError);
  hideScreenshotActions();
}

export function bindCopyButton(handler) {
  copyButton.addEventListener("click", handler);
}

export function setCopyPending(isPending) {
  copyButton.disabled = isPending;
}

// Réinitialise le retour visuel de la copie sans toucher à l'état du bouton :
// utilisé dès qu'une nouvelle capture est affichée ou que l'espace
// d'affichage change d'état.
function resetCopyFeedback() {
  copyFeedback.classList.remove(COPY_FEEDBACK_SUCCESS, COPY_FEEDBACK_ERROR);
  copyFeedback.textContent = "";
}

export function renderCopyPending() {
  resetCopyFeedback();
  copyFeedback.textContent = MESSAGES.copyPending;
}

export function renderCopySuccess() {
  copyFeedback.classList.remove(COPY_FEEDBACK_ERROR);
  copyFeedback.classList.add(COPY_FEEDBACK_SUCCESS);
  copyFeedback.textContent = "✓ Capture copiée dans le presse-papiers.";
}

export function renderCopyError(detail) {
  copyFeedback.classList.remove(COPY_FEEDBACK_SUCCESS);
  copyFeedback.classList.add(COPY_FEEDBACK_ERROR);
  copyFeedback.textContent = detail;
}

export function bindSaveButton(handler) {
  saveButton.addEventListener("click", handler);
}

export function focusSaveButton() {
  saveButton.focus();
}

export function setSavePending(isPending) {
  saveButton.disabled = isPending;
}

// Réinitialise le retour visuel de l'enregistrement sans toucher à l'état du
// bouton : utilisé dès qu'une nouvelle capture est affichée ou que l'espace
// d'affichage change d'état.
function resetSaveFeedback() {
  saveFeedback.classList.remove(SAVE_FEEDBACK_SUCCESS, SAVE_FEEDBACK_ERROR);
  saveFeedback.textContent = "";
}

function hideScreenshotActions() {
  screenshotActions.hidden = true;
  resetCopyFeedback();
  resetSaveFeedback();
}

export function renderSavePending() {
  resetSaveFeedback();
  saveFeedback.textContent = MESSAGES.savePending;
}

export function renderSaveSuccess(filename) {
  saveFeedback.classList.remove(SAVE_FEEDBACK_ERROR);
  saveFeedback.classList.add(SAVE_FEEDBACK_SUCCESS);
  saveFeedback.textContent = `✓ Capture enregistrée sous « ${filename} ».`;
}

export function renderSaveError(detail) {
  saveFeedback.classList.remove(SAVE_FEEDBACK_SUCCESS);
  saveFeedback.classList.add(SAVE_FEEDBACK_ERROR);
  saveFeedback.textContent = detail;
}
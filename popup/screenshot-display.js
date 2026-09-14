// Rendu de l'espace d'affichage de la capture dans la popup.
//
// Cet espace présente la capture réalisée, ou un état approprié lorsqu'aucune
// capture n'est disponible ou qu'elle ne peut pas être affichée. Il héberge
// également l'action « Enregistrer » et ses retours visuels : l'enregistrement
// n'est proposé que lorsqu'une capture est effectivement affichée. Toute
// manipulation du DOM de la popup liée à l'affichage de la capture et à son
// enregistrement passe par ce module.

const SCREENSHOT_IMAGE_WRAPPER_ID = "screenshot-image-wrapper";
const SCREENSHOT_IMAGE_ID = "screenshot-image";
const SCREENSHOT_EMPTY_ID = "screenshot-empty";
const SCREENSHOT_ERROR_ID = "screenshot-error";
const SAVE_ACTIONS_ID = "save-actions";
const SAVE_BUTTON_ID = "save-button";
const SAVE_FEEDBACK_ID = "save-feedback";

const SAVE_FEEDBACK_SUCCESS = "panel__save-feedback--success";
const SAVE_FEEDBACK_ERROR = "panel__save-feedback--error";

const MESSAGES = {
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
const saveActions = getElement(SAVE_ACTIONS_ID);
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
  hideSaveActions();
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
  resetSaveFeedback();
  saveActions.hidden = false;
}

export function renderScreenshotError() {
  resetScreenshotImage();
  displayOnly(screenshotError);
  hideSaveActions();
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

function hideSaveActions() {
  saveActions.hidden = true;
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
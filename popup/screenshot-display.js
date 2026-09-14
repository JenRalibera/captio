// Rendu de l'espace d'affichage de la capture dans la popup.
//
// Cet espace présente la capture réalisée, ou un état approprié lorsqu'aucune
// capture n'est disponible ou qu'elle ne peut pas être affichée. Toute
// manipulation du DOM de la popup liée à l'affichage de la capture passe par
// ce module.

const SCREENSHOT_IMAGE_WRAPPER_ID = "screenshot-image-wrapper";
const SCREENSHOT_IMAGE_ID = "screenshot-image";
const SCREENSHOT_EMPTY_ID = "screenshot-empty";
const SCREENSHOT_ERROR_ID = "screenshot-error";

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
}

export function renderScreenshotError() {
  resetScreenshotImage();
  displayOnly(screenshotError);
}
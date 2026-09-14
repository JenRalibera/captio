// Point d'entrée de la popup : coordonne l'état persisté (extension-state),
// le rendu de l'interface (status-panel), le déclenchement de la capture de
// l'onglet actif (capture), l'affichage de la capture réalisée
// (screenshot-display) et son enregistrement sur l'ordinateur
// (save-screenshot).
//
// Périmètre : la capture est réalisée puis affichée dans l'extension, puis
// peut être enregistrée localement sur l'ordinateur de l'utilisateur. La
// capture n'est jamais transmise hors de l'appareil.

import {
  loadActiveState,
  saveActiveState,
} from "./extension-state.js";
import { captureActiveTab } from "./capture.js";
import {
  bindActivateButton,
  bindCaptureButton,
  displayExtensionVersion,
  focusCaptureHeading,
  renderActive,
  renderCaptureError,
  renderCapturePending,
  renderCaptureSuccess,
  renderInactive,
  renderReadError,
  renderWriteError,
  setActivationPending,
  setCapturePending,
} from "./status-panel.js";
import {
  bindSaveButton,
  focusSaveButton,
  renderSaveError,
  renderSavePending,
  renderSaveSuccess,
  renderScreenshotEmpty,
  renderScreenshotError,
  setSavePending,
  showScreenshot,
} from "./screenshot-display.js";
import { saveScreenshot } from "./save-screenshot.js";

// Données de la capture actuellement affichée : c'est exactement ce contenu
// (et lui seul) qui peut être enregistré, afin que le fichier produit
// corresponde à l'image consultée.
let displayedScreenshotDataUrl = null;

async function activateExtension() {
  setActivationPending(true);
  try {
    await saveActiveState();
    renderActive();
    renderScreenshotEmpty();
    focusCaptureHeading();
  } catch (error) {
    console.error("[Captio] Impossible d'enregistrer l'activation :", error);
    renderWriteError();
    setActivationPending(false);
  }
}

async function performCapture() {
  // Le bouton de capture n'est visible que lorsque l'extension est active :
  // ce périmètre garantit que la capture n'est déclenchée que dans cet état.
  renderCapturePending();
  try {
    const dataUrl = await captureActiveTab();
    displayedScreenshotDataUrl = dataUrl;
    renderCaptureSuccess();
    try {
      await showScreenshot(dataUrl);
      focusSaveButton();
    } catch (error) {
      // La capture a réussi mais son affichage a échoué : on présente un
      // message compréhensible sans laisser la capture sembler inexistante.
      console.error("[Captio] Impossible d'afficher la capture :", error);
      displayedScreenshotDataUrl = null;
      renderScreenshotError();
    }
  } catch (error) {
    // L'erreur technique détaillée est déjà journalisée par capture.js ;
    // seul le message compréhensible est remonté à l'utilisateur.
    renderCaptureError(error.message);
  } finally {
    setCapturePending(false);
  }
}

async function performSave() {
  // L'enregistrement n'est proposé que lorsqu'une capture est affichée : on
  // ne peut pas enregistrer une capture inexistante.
  if (displayedScreenshotDataUrl === null) {
    return;
  }

  setSavePending(true);
  renderSavePending();
  try {
    const { filename } = await saveScreenshot(displayedScreenshotDataUrl);
    renderSaveSuccess(filename);
  } catch (error) {
    // L'erreur technique détaillée est journalisée par save-screenshot.js ;
    // seul le message compréhensible est remonté à l'utilisateur.
    console.error("[Captio] Échec de l'enregistrement de la capture :", error);
    renderSaveError(error.message);
  } finally {
    setSavePending(false);
  }
}

async function initialize() {
  displayExtensionVersion();

  try {
    const isActive = await loadActiveState();
    if (isActive) {
      renderActive();
      renderScreenshotEmpty();
    } else {
      renderInactive();
    }
  } catch (error) {
    console.error("[Captio] Impossible de lire l'état de l'extension :", error);
    renderReadError();
  }
}

bindActivateButton(activateExtension);
bindCaptureButton(performCapture);
bindSaveButton(performSave);

initialize();


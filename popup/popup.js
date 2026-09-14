// Point d'entrée de la popup : coordonne l'état persisté (extension-state),
// le rendu de l'interface (status-panel), le déclenchement de la capture de
// l'onglet actif (capture) et l'affichage de la capture réalisée
// (screenshot-display).
//
// Périmètre : la capture est réalisée puis affichée dans l'extension ; elle
// n'est ni enregistrée, ni téléchargée.

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
  renderScreenshotEmpty,
  renderScreenshotError,
  showScreenshot,
} from "./screenshot-display.js";

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
    renderCaptureSuccess();
    try {
      await showScreenshot(dataUrl);
    } catch (error) {
      // La capture a réussi mais son affichage a échoué : on présente un
      // message compréhensible sans laisser la capture sembler inexistante.
      console.error("[Captio] Impossible d'afficher la capture :", error);
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

initialize();


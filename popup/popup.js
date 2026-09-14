// Point d'entrée de la popup : coordonne l'état persisté (extension-state),
// le rendu de l'interface (status-panel) et le déclenchement de la capture
// de l'onglet actif (capture).
//
// Périmètre : la capture est déclenchée mais n'est ni affichée, ni
// enregistrée par l'extension.

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

async function activateExtension() {
  setActivationPending(true);
  try {
    await saveActiveState();
    renderActive();
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
    await captureActiveTab();
    // La donnée de capture est volontairement ignorée : la fonctionnalité
    // n'affiche ni n'enregistre la capture (voir le fichier de tâches).
    renderCaptureSuccess();
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


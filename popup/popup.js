// Point d'entrée de la popup : coordonne l'état persisté (extension-state)
// et le rendu de l'interface (status-panel).
//
// La réalisation et l'affichage de la capture ne font pas partie de ce
// périmètre : seule la mise à disposition de son accès est traitée ici.

import {
  loadActiveState,
  saveActiveState,
} from "./extension-state.js";
import {
  bindActivateButton,
  displayExtensionVersion,
  focusCaptureHeading,
  renderActive,
  renderInactive,
  renderReadError,
  renderWriteError,
  setActivationPending,
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

initialize();


// Utilitaires partagés de manipulation des données d'une capture affichée
// dans la popup.
//
// La capture est conservée sous forme d'« adresse de données » (data URL) PNG.
// Les deux opérations qui exploitent cette capture — l'enregistrement sur
// l'ordinateur (save-screenshot.js) et la copie dans le presse-papiers
// (copy-screenshot.js) — ont besoin d'un objet Blob octet pour octet
// identique au contenu de la data URL. La validation du format et la
// conversion sont donc mutualisées ici plutôt que dupliquées, afin qu'une
// éventuelle évolution du format de capture ne soit à maintenir qu'à un seul
// endroit.

const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

export function isPngDataUrl(dataUrl) {
  return typeof dataUrl === "string" && dataUrl.startsWith(PNG_DATA_URL_PREFIX);
}

export async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

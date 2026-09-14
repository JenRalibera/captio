# captio
Browser extension for taking screenshots

# Hello, everyone !

I try to create random browser extensions, so if you want to add something, send me a little message ! ;)

## Installer l'extension en développement

1. Ouvrir `chrome://extensions` dans Chrome.
2. Activer le **Mode développeur** (en haut à droite).
3. Cliquer sur **Charger l'extension non empaquetée**.
4. Sélectionner le dossier du projet (contenant `manifest.json`).

L'icône **Captio** apparaît alors dans la barre d'outils ; un clic dessus ouvre l'interface de l'extension.

## Structure

- `manifest.json` — manifeste Manifest V3 de l'extension
- `popup/` — interface de l'extension (popup de la barre d'outils)
- `public/` — ressources publiques (icône de l'extension)

## Permissions

- `storage` — mémorise l'état actif de l'extension (activation de la capture)
  afin que l'utilisateur n'ait pas à la réactiver avant chaque capture.

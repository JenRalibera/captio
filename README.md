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

### Navigateur Firefox

L'extension se charge également dans Firefox : ouvrir
`about:debugging#/runtime/this-firefox`, cliquer sur **Charger un module
temporaire…** et sélectionner le `manifest.json` du projet.

## Fonctionnalité

1. Activer l'extension (la première fois).
2. Cliquer sur **Capture d'écran** : la partie visible de l'onglet actif est capturée puis affichée dans l'extension.
3. Cliquer sur **Copier** : la capture affichée est copiée dans le presse-papiers du système, prête à être collée dans une autre application.
4. Cliquer sur **Enregistrer** : la capture affichée est enregistrée dans le dossier de téléchargement du navigateur sous le nom `captio-xxxxxx.png` (le suffixe est l'heure de l'enregistrement ; un nom déjà utilisé n'est jamais écrasé).

## Structure

- `manifest.json` — manifeste Manifest V3 de l'extension
- `popup/` — interface de l'extension (popup de la barre d'outils)
- `public/` — ressources publiques (icône de l'extension)

## Permissions

- `activeTab` — autorise la capture de la partie visible de l'onglet actif,
  uniquement lorsque l'utilisateur ouvre l'extension (clic sur l'icône de la
  barre d'outils), sans accès permanent aux sites visités.
- `storage` — mémorise l'état actif de l'extension (activation de la capture)
  afin que l'utilisateur n'ait pas à la réactiver avant chaque capture.
- `downloads` — permet d'enregistrer la capture affichée dans le dossier de
  téléchargement du navigateur via `chrome.downloads` (Chrome) ou
  `browser.downloads` (Firefox), et de suivre la fin du téléchargement pour
  informer l'utilisateur du succès ou de l'échec.
- `clipboardWrite` — permet de copier la capture affichée dans le
  presse-papiers du système via `navigator.clipboard.write`, afin que
  l'utilisateur puisse la coller directement dans une autre application.

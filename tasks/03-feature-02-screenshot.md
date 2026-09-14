# Feature 3 - Déclencher la capture

# User Story
En tant qu’utilisateur de l’extension,
je veux déclencher une capture de l’écran de navigation courant,
afin de pouvoir capturer rapidement ce que j’ai actuellement à l’écran.

# Critères d'acceptation

- Étant donné que l’extension est activée, quand l’utilisateur déclenche l’action de capture, alors l’extension lance une capture de l’écran de navigation courant.

- Étant donné que l’utilisateur se trouve sur une page web, quand il déclenche une capture, alors la capture contient uniquement la partie actuellement visible à l’écran et elle ne contient pas les éléments accessibles uniquement après défilement vertical.

- Étant donné que l’utilisateur a plusieurs onglets ouverts, quand il déclenche une capture depuis l’extension, alors la capture correspond à l’onglet actuellement actif.

- Quand la capture est réalisée, alors cette US ne prévoit pas l’affichage de la capture à l’utilisateur.

- Quand la capture est réalisée, alors cette US ne prévoit pas la sauvegarde de la capture sur le poste de l’utilisateur.

# Hors périmètre

- Affichage de la capture à l’utilisateur

- Sauvegarde/téléchargement de la capture

- Capture d'une zone sélectionnée par l'utilisateur

- Capture de la page entière, y compris le contenu nécessitant un défilement

- Édition ou annotation de la capture
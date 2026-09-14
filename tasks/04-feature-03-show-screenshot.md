# Feature 2 - Afficher la capture

# User Story

En tant qu’utilisateur de l’extension,
je veux visualiser la capture d’écran après sa réalisation,
afin de vérifier immédiatement le contenu capturé.

# Critères d’acceptation

- Étant donné qu’une capture d’écran a été réalisée avec succès, quand la capture est disponible, alors l’extension affiche la capture à l’utilisateur.

- Étant donné qu’une capture a été réalisée, quand elle est affichée, alors l’utilisateur peut visualiser l’intégralité de la zone capturée et aucun élément de la capture ne doit être volontairement masqué ou tronqué.

- Étant donné qu’une capture a été réalisée avec succès, quand elle est affichée, alors son contenu correspond à l’écran capturé au moment du déclenchement.

- Étant donné qu’aucune capture n’est disponible, quand l’utilisateur ouvre l’espace d’affichage de la capture, alors l’extension n’affiche pas une capture inexistante et un état approprié est présenté à l’utilisateur.

- Étant donné qu’une capture a été réalisée, quand l’extension ne parvient pas à l’afficher alors un message d’erreur compréhensible est présenté à l’utilisateur.

# Hors périmètre

- Sauvegarde de la capture sur le poste

- Téléchargement de la capture

- Partage de la capture

- Modification ou annotation de la capture

- Nouvelle capture depuis l'écran d'affichage
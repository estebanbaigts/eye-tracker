### Projet de suivi oculaire
Introduction
Ce référentiel contient un eye-tracker de validation de principe qui fonctionne via une webcam et un processus d'étalonnage. Il comprend également un jeu de test et enregistre les données de prédiction dans un fichier JSON.

### Caractéristiques
Calibrage avec 9 ou 17 points
Aucun matériel spécial requis, seulement une webcam
Composants échangeables pour la détection oculaire
Plusieurs modèles de prédiction du regard
Enregistrement des données d'estimation du regard dans un fichier JSON
Installation et configuration
Exigences
Node.js (testé sur v16 et v18)
Version Unity WebGL pour le jeu
Instructions de construction

### Clonez le dépôt :
git clone https://github.com/OpenMindInnovation/backpack/tree/eye_tracking_poc
cd notebooks
cd eye-tracker

### Installer les dépendances :
rm -rf node_modules package-lock.json
npm cache clean --force
npm install 

### Construisez le projet :
npm run build

### Installez un serveur local pour servir les fichiers :
Copier le code
npm install --global servir
servir www

### Si la commande serve échoue :
npm install -g serveur http
echo 'start: serveur http' >> package.json
npm start

### Ajout d'un jeu
Copiez le dossier de build Unity WebGL dans le répertoire Game/.
Modifiez game.js à la section 31 pour utiliser le nouveau nom de version du jeu.
Problèmes connus et améliorations potentielles

### Problèmes
Redimensionnement de la fenêtre : la modification de la taille de la fenêtre du navigateur pendant ou après l'étalonnage rend les prédictions inexactes.
Dérive de prédiction : tendance des prédictions à dériver vers la droite pendant les points de fixation.
Latence : des temps de calcul élevés entraînent une latence accrue et une diminution des FPS.
Densité d'étalonnage : un positionnement ou une densité incorrecte des points d'étalonnage peut entraîner une mauvaise précision de la prédiction.


### Améliorations
Précision de l'horodatage : utilisez les horodatages d'image plus proches pour capturer le temps afin de réduire les effets de latence.
Modèle Facemesh : évaluez d’autres modèles de détection de facemesh.
Alignement de l'étalonnage : ajustez les points d'étalonnage pour qu'ils correspondent précisément à la zone d'affichage du jeu.
Lissage des prédictions : implémentez des algorithmes pour lisser les oscillations des prédictions.
Détection des clignements : excluez les prédictions faites pendant les clignements pour améliorer la précision.
Nettoyage du code : supprimez le code inutile pour améliorer l’efficacité et la maintenabilité.
Modèle de régression : étudiez et affinez le modèle de régression pour de meilleures performances.
Programmation asynchrone : améliorez le code JavaScript pour gérer efficacement les opérations asynchrones.
Interaction dans le jeu : rendez le jeu réactif au suivi d'événements tels qu'un mauvais éclairage ou une perte de visage.

### TODO LIST
Faire en sorte de refaire l'ux.
Faire des explications plus simples et plus claires.
Enlever le dot pour ne pas déconcentrer les gens pendant les jeux.
Melanger les images pour le jeu des émotions (des images générés pas IA et d'autres réel).
Faire un formulaire avant de commencer pour se renseigner sur les maladies éventuelles telles que TDAH, Borgne d'un œil, etc.
Gamifier la calibration.

### Idées futures
Modèles de régression améliorés : explorez des modèles de régression plus avancés pour de meilleures prédictions.
Couplage automatique de session : automatisez le couplage de fichiers JSON pour l'analyse de session.
Suivi de session : mettez en œuvre un meilleur suivi de session pour l’analyse des données.
Précision statique ou dynamique : développer des méthodes pour différencier et analyser les points de prédiction statiques et dynamiques.

### Prise en charge du navigateur
Google Chrome
Microsoft Bord
Mozilla Firefox
Opéra
Safari

### Contribuant
Les contributions sont les bienvenues. Veuillez soumettre des demandes d'extraction pour toute amélioration ou correction de bugs.

### Licence
Ce projet est sous licence selon les termes spécifiés dans le fichier LICENSE.
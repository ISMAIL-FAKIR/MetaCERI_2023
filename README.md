# CERISoNet - Application Web de Réseau Social

## Description
CERISoNet est une application web de réseau social développée avec Angular (front-end) et NodeJS (back-end) utilisant MongoDB comme base de données. 
L'interface utilisateur est créée en utilisant le framework Angular Material, Bootstrap, CSS pour garantir une expérience utilisateur adaptative.

## Fonctionnalités Principales

### Connexion et Authentification
- Page de connexion avec formulaire Bootstrap.
- Authentification des utilisateurs en vérifiant les données dans une base de données PostgreSQL.
- Gestion des sessions avec le middleware MongoDBSession pour stocker les informations de connexion côté serveur.
- Notification à l'utilisateur de l'état de la connexion (acceptée ou refusée).
- Affichage de la date et de l'heure de la dernière connexion.
- Utilisation du Local Storage pour stocker et récupérer les informations de la dernière connexion côté client.

### Mur d'Accueil
- Affichage d'un mur d'accueil après la connexion, montrant tous les messages postés dans le réseau social.
- Utilisation de WebSockets pour la communication en temps réel entre le client et le serveur.

### Gestion des Messages
- Affichage des messages avec pagination.
- Possibilité de liker, commenter et partager un message.
- Tri des messages par propriétaire, date de post et popularité (nombre de likes).
- Filtrage des messages par propriétaire et hashtag.

### Internautes Connectés
- Affichage en temps réel de la liste des internautes connectés grâce à WebSockets.

### Bandeau de Notifications
- Affichage de notifications pour informer l'utilisateur sur divers événements (connexion réussie, commentaire posté, partage réussi, etc.).

## Comment Faire Fonctionner le Projet

### Prérequis
- NodeJS installé
- MongoDB installé
- Angular CLI installé

### Installation
1. Cloner le dépôt : `git clone https://github.com/ISMAIL-FAKIR/MetaCERI_2023.git`
2. Accéder au répertoire du projet : `cd CERISoNet`

#### Back-End (NodeJS)
3. Accéder au répertoire Backend : `cd frontend`
4. Installer les dépendances : `npm install`
5. Exécuter le serveur NodeJS : `node monserver.js`

#### Front-End (Angular)
6. Accéder au répertoire Frontend : `cd frontend`
7. Installer les dépendances : `npm install`
8. Construire l'application Angular : `ng build`

9. Ouvrir le navigateur et accéder à l'URL : `https://pedago.univ-avignon.fr:3xxx/` (remplacez `3xxx` par votre port attribué)

Note: Assurez-vous que MongoDB est en cours d'exécution localement ou mettez à jour la configuration de connexion dans le fichier `monserver.js`.


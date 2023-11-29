# HomeGarden API REST

HomeGarden est une API REST conçue pour gérer des jardins et des plantes, intégrant des données météorologiques en temps réel et des fonctionnalités de notification via WebSocket.

## Fonctionnalités

- Gestion des utilisateurs : inscription, connexion et gestion des profils.
- Gestion des jardins : création, mise à jour, suppression, et recherche géospatiale.
- Gestion des plantes : ajout, mise à jour, et suppression dans les jardins.
- Intégration de données météorologiques pour chaque jardin.
- Notifications WebSocket pour des mises à jour météorologiques et des rappels de jardinage.
- Filtrage avancé et pagination des données.
- Authentification JWT pour sécuriser l'accès aux endpoints.

## Technologies Utilisées

- Node.js
- Express.js
- MongoDB
- WebSocket
- Axios
- Mocha et Chai pour les tests

## Installation

Clonez le dépôt et installez les dépendances :

```bash
git clone [URL du dépôt]
cd archioweb-api
npm install
```

## Configuration

Créez un fichier .env à la racine du projet et ajoutez-y les configurations nécessaires :
```env
PORT=3000
DB_URI=mongodb://localhost:27017/mydb
JWT_SECRET=monsecretjwt
```

## Démarrage
Lancez l'API en mode développement :
```bash
npm run dev
```
Lancez l'API en mode production :
```bash
npm run start
```

## Utilisation

Pour commencer à utiliser :

Pour les commandes Postman à venir veuillez-vous référer au lien suivant -> https://homegarden.onrender.com/api-docs/

Vous devrez maintenant créer un utilisateur. La commande à entrer dans Postman se trouve sous "Users" -> "POST - Enregistre un nouvel utilisateur" et utiliser précisement l'identifier et le mot de passe suivant :
{
  "identifier": "user@example.com",
  "lastName": "VotreNom",
  "firstName": "VotrePrenom",
  "password": "yourSecurePassword"
}

Pour se loguer :

Toujours dans le même site, vous trouverez les infos de la commande Postman pour s'authentifier dans "Users" Utiliser l'identifiant et le mot de passe du point précédent cela vous retournera : "Authentifie un utilisateur et retourne un token".

Dans votre postman, créer dans votre Envrionment une variable authToken du type que vous voulez et dans currentValue mettez votre token sans les guillements.

Vous êtes maintenant authentifié et pouvez créer des jardins.

Créer un jardin :

Pour créer le jardin, utilisez la commande "POST - Créer un jardin", mettez votre identifiant sous user et votre localisation est de type point et ressemblera à ça -> {
  "name": "string",
  "location": { "type": "Point", "coordinates": [ 41.40338, 2.17403 ]},
  "user": "65674e770705a2f373b4ae13"
}

```

## Tests
Exécutez les tests unitaires et d'intégration :
```bash
npm run test
```
Exécuter les tests unitaires et d'intégration avec coverage :
```bash
npm run coverage
```

## Lint
Exécutez le lint esLint
```bash
npm run lint
```

## Sécurité
Exécutez les tests de sécurité
```bash
npm run lint
```

## WebSockets
Utilisez WebSocket pour recevoir des notifications en temps réel sur la météo des jardins et des alertes de jardinage.

Le WebSocket nécessite l'existence et la création du compte identifier: 'user@example.com' et password: 'yourSecurePassword'.

Vous pouvez désormais lancer la commande 'npm run clientWS'. Vous devriez recevoir la réponse : 
Connected to the server
Message from server: []
[]



## Documentation API
Consultez la documentation Swagger pour une liste complète des endpoints et modèles de données : [Swagger](https://homegarden.onrender.com/api-docs/)

## Déploiement
Suivez ces instructions pour déployer l'API sur votre serveur ou plateforme cloud de choix.

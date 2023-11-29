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

Pour commencer vous devrez créer un utilisateur.

La commande à entrer dans Postman se trouve dans ce doc au lien suivant https://homegarden.onrender.com/api-docs/ et voir sous "Users" -> "POST - Enregistre un nouvel utilisateur"

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

## Documentation API
Consultez la documentation Swagger pour une liste complète des endpoints et modèles de données : [Swagger](https://homegarden.onrender.com/api-docs/)

## Déploiement
Suivez ces instructions pour déployer l'API sur votre serveur ou plateforme cloud de choix.

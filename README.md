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

Lancez un codespaces depuis le repo ou utilisez docker afin de ne pas à avoir à installer mongodb et les dépendances npm ou clonez le dépôt et installez les dépendances et les variables d'environements:

```bash
git clone [URL du dépôt]
cd archioweb-api
npm install
```

## Configuration

Si vous n'utilisez pas codespace ou docker, créez les variables d'environement suivantes :
```env
SERVER_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/mydb
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

### Pour commencer à utiliser :

Pour les commandes à venir veuillez-vous référer au lien suivant -> https://homegarden.onrender.com/api-docs/

Vous devrez maintenant créer un utilisateur. La commande à entrer se trouve sous "Users" -> "POST - Enregistre un nouvel utilisateur" et utiliser précisement l'identifier et le mot de passe suivant :
```
{
  "identifier": "user@example.com",
  "lastName": "VotreNom",
  "firstName": "VotrePrenom",
  "password": "yourSecurePassword"
}
```
### Pour se loguer :

Toujours dans le même site, vous trouverez les infos de la commande pour s'authentifier dans "Users" Utiliser l'identifiant et le mot de passe du point précédent cela vous retournera : "Authentifie un utilisateur et retourne un token".

Vous êtes maintenant authentifié et pouvez créer des jardins.

### Créer un jardin :

Pour créer le jardin, utilisez la commande "POST - Créer un jardin", votre localisation est de type point et ressemblera à ça -> 
```
{
  "name": "string",
  "location": { "type": "Point", "coordinates": [ 48.8565, 2.3525 ]}
}
```

Maintenant, que vous avez un jardin, vous pouvez les listés où y ajouté des plantes.

Vous pouvez également utiliser efficacement les websockets pour avoir la météo de votre jardin et des informations sur les jardins proches des vôtres. (Voir chapitre WebSockets)

### Créer une plante dans un jardin

Pour créer une plante, vous pouvez utiliser le JSON suivant, mais vous devez y ajouter l'id de votre jardin.
```
{
  "commonName": "Margueritte",
  "scientificName": "Marguerittus",
  "family": "Margue",
  "exposure": "Full Sun",
  "garden": "idDeVotreJardin"
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
npm run security-check
```

## WebSockets
Utilisez WebSocket pour recevoir des notifications en temps réel sur la météo des jardins et des alertes de jardinage.

Le WebSocket nécessite l'existence et la création du compte identifier: 'user@example.com' et password: 'yourSecurePassword'.

Il vous faudra également un jardin. Vous recevrez la météo, mais pour recevoir les jardins environnants des vôtres, nous vous conseillons d'utiliser des coordonnées proches de [48.8565, 2.3525].

Vous pouvez désormais lancer la commande 
```
npm run clientWS
```
Vous devriez recevoir la réponse : 
```
Connected to the server
Message from server: [{"location":{"type":"Point","coordinates":[48.8566,2.3522]},"_id":"656858370b4ee586c78255c2","name":"Big Havana","plants":[],"user":"65674e770705a2f373b4ae13","createdAt":"2023-11-30T09:39:03.529Z","updatedAt":"2023-11-30T09:39:03.529Z","__v":0}]
[
  {
    location: { type: 'Point', coordinates: [Array] },
    _id: '656858370b4ee586c78255c2',
    name: 'Big Havana',
    plants: [],
    user: '65674e770705a2f373b4ae13',
    createdAt: '2023-11-30T09:39:03.529Z',
    updatedAt: '2023-11-30T09:39:03.529Z',
    __v: 0
  }
]
Message from server: {"gardenId":"65684fdb0b4ee586c7825570","weather":{"temperature":-0.6,"skyCondition":"Très nuageux","precipitationNext48h":13.3}}
{
  gardenId: '65684fdb0b4ee586c7825570',
  weather: {
    temperature: -0.6,
    skyCondition: 'Très nuageux',
    precipitationNext48h: 13.3
  }
}
```
Ce texte correspond à la météo de la localisation de votre jardin et vous en recevez autant que vous avez de jardin.


## Documentation API
Consultez la documentation Swagger pour une liste complète des endpoints et modèles de données : [Swagger](https://homegarden.onrender.com/api-docs/)

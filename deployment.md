# 🚀 Déploiement avec Portainer & MongoDB Atlas

Ce document explique comment configurer votre instance Portainer pour le déploiement automatisé de l'API avec une base de données Cloud.

## Prérequis

1.  Un serveur avec **Docker** et **Portainer** installés.
2.  Un compte GitHub avec un **Personal Access Token (PAT)** (droits `read:packages`).
3.  Un cluster **MongoDB Atlas** configuré.

## Étape 0 : MongoDB Atlas

1.  Créez un Cluster sur [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Créez un utilisateur de base de données (Database Access).
3.  Autorisez les IPs (Network Access) : `0.0.0.0/0` (pour permettre à votre NAS de s'y connecter).
4.  Récupérez la chaîne de connexion (Connect > Drivers > Node.js).
    *   Format : `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`

## Étape 1 : Configurer le Registry dans Portainer

1.  Allez dans **Registries** > **Add registry** > **Custom registry**.
2.  **Name** : `GitHub Container Registry`.
3.  **Registry URL** : `ghcr.io`
4.  **Username** : Votre nom d'utilisateur GitHub.
5.  **Password** : Votre Personal Access Token (PAT).

## Étape 2 : Créer la Stack

1.  Allez dans **Stacks** > **Add stack**.
2.  **Name** : `archioweb-api`.
3.  **Build method** : `Web editor`.
4.  Copiez-collez le contenu de votre fichier `docker-compose.yml` simplifié.
5.  **Environment variables** :
    *   `JWT_SECRET` : `votre_secret_ultra_securise_ici`
    *   `DATABASE_URL` : Collez votre chaîne de connexion MongoDB Atlas (étape 0).
6.  Cliquez sur **Deploy the stack**.

## Étape 3 : Configurer le Webhook Portainer

1.  Une fois la stack déployée, cliquez sur le service `api`.
2.  Activez **Service webhook**.
3.  Copiez l'URL générée.

## Étape 4 : Configurer GitHub Secrets

1.  Allez sur votre repository GitHub > **Settings** > **Secrets** > **Actions**.
2.  Ajoutez `PORTAINER_WEBHOOK_URL` avec l'URL copiée.

## ✅ Terminé !

Votre API tourne sur votre NAS mais stocke ses données de manière sécurisée et gérée sur le Cloud MongoDB Atlas. Plus de souci de version CPU !

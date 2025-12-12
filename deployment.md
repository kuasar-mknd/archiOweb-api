# 🚀 Déploiement avec Portainer

Ce document explique comment configurer votre instance Portainer pour le déploiement automatisé de l'API.

## Prérequis

1.  Un serveur avec **Docker** et **Portainer** installés.
2.  Un compte GitHub.
3.  Un **Personal Access Token (PAT)** GitHub avec les droits `read:packages` (pour que Portainer puisse tirer l'image depuis GHCR).

## Étape 1 : Configurer le Registry dans Portainer

1.  Allez dans **Registries** > **Add registry** > **Custom registry**.
2.  **Name** : `GitHub Container Registry` (ou ce que vous voulez).
3.  **Registry URL** : `ghcr.io`
4.  **Username** : Votre nom d'utilisateur GitHub.
5.  **Password** : Votre Personal Access Token (PAT).
6.  Cliquez sur **Add registry**.

## Étape 2 : Créer la Stack

1.  Allez dans **Stacks** > **Add stack**.
2.  **Name** : `archioweb-api` (par exemple).
3.  **Build method** : `Web editor`.
4.  Copiez-collez le contenu de votre fichier `docker-compose.yml`.
5.  **Environment variables** :
    *   Cliquez sur **Add an environment variable**.
    *   Name: `JWT_SECRET`
    *   Value: `votre_secret_ultra_securise_ici`
6.  Cliquez sur **Deploy the stack**.

## Étape 3 : Configurer le Webhook

1.  Une fois la stack déployée, cliquez sur le service `api` (dans la liste des services de la stack).
2.  Cherchez la section **Service webhook** (souvent en bas).
3.  Activez l'option **Webhook**.
4.  Copiez l'URL générée (ex: `https://votre-portainer.com/api/webhooks/xxxx-xxxx`).

## Étape 4 : Configurer GitHub

1.  Allez sur votre repository GitHub > **Settings** > **Secrets and variables** > **Actions**.
2.  Cliquez sur **New repository secret**.
3.  **Name** : `PORTAINER_WEBHOOK_URL`
4.  **Value** : Collez l'URL du webhook copiée à l'étape 3.
5.  Cliquez sur **Add secret**.

## ✅ Terminé !

Désormais, à chaque push sur la branche `main` :
1.  GitHub Actions va construire la nouvelle image Docker.
2.  L'image sera envoyée sur GitHub Container Registry.
3.  GitHub appellera votre Portainer.
4.  Portainer téléchargera la nouvelle image et redémarrera le service API automatiquement sans interruption (si possible).

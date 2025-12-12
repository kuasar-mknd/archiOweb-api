# 🚀 Déploiement avec Portainer & MongoDB Atlas

Ce document explique comment configurer votre instance Portainer pour le déploiement automatisé de l'API avec une base de données Cloud.

*Note : La mise à jour automatique est gérée par votre instance **Watchtower** existante grâce au label ajouté.*

## Prérequis

1.  Cluster **MongoDB Atlas** prêt.
2.  **Watchtower** tournant déjà sur votre serveur.
    *   *Attention : Assurez-vous que votre Watchtower a les droits pour puller depuis `ghcr.io` (si l'image est privée).*

## Étape 0 : MongoDB Atlas

1.  Récupérez votre chaîne de connexion sur Atlas.

## Étape 1 : Créer la Stack Portainer

1.  **Stacks** > **Add stack**.
2.  **Name** : `archioweb-api`.
3.  **Build method** : `Web editor`.
4.  Copiez-collez le `docker-compose.yml`.
5.  **Environment variables** :
    *   `JWT_SECRET` : Votre secret.
    *   `DATABASE_URL` : Votre connexion string Atlas.

6.  Cliquez sur **Deploy**.

## ✅ C'est tout !

1.  **GitHub Actions** construit l'image sur push.
2.  Votre **Watchtower** détectera la nouvelle image (grâce au label `com.centurylinklabs.watchtower.enable=true`) et mettra à jour le conteneur `archioweb-api`.

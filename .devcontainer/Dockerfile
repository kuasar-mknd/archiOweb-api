FROM node:14

# Installer MongoDB
RUN apt-get update && apt-get install -y mongodb

# Exposer le port pour Express et MongoDB
EXPOSE 3000 27017

# Configurer le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de configuration de l'application
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier le code source de l'application
COPY . .

# archiOweb-api

# HomeGarden

[https://www.aujardin.info/plantes/viola-odorata.php](https://www.aujardin.info/plantes/viola-odorata.php])

## But définir des rappels d’entretien

### Utilisateur (possède 0-N jardin) :

-   Identifiant\*
-   Nom
-   Prenom
-   date de naissance
-   Mot de passe\*
-   Date et heure de création
-   Dernière date de modification

### Plante (appartient à 1 jardin)

-   Nom familier (list)
-   Nom officielle latin \*
-   Famille \*
-   Description
-   Origine (Europe, Inde ..) (On peut imaginer pointer sur une liste de pays ou de région prédéfini)
-   Exposition (soleil, ombre, mi-ombre)
-   Entretien (arrosage)
-   Type de sol (riche, léger)
-   Couleurs des fleurs
-   Hauteur [cm]
-   Floraison (fac)
-   Date de plantation (saison)
-   Soins nécessaires
-   Image (fac)
-   Utilisation (massif, couvre-sol, pelouse, alimentaire, médicinale, parfum)
-   ID_Jardin

### Jardin (possède 0-N plante(s) et appartient à 1 utilisateur)

-   Nom du jardin\*
-   Liste de plantes cultivées
-   Localisation (géolocalisation)\*
-   ID_Utilisateur
-   Date de création
-   Dernière date de modification

### Fonctions téléphones

-   Géolocalisation du jardin
-   photos des plantes

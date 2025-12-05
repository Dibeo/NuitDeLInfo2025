# Défi : Podium de Concours – Gamification Full-Stack

Ce projet répond au défi « Podium de concours ». Il s’agit d’une sous-application intégrée visant à gamifier l’expérience des participants grâce à un système de progression en temps réel, visualisable via des interfaces 2D et 3D.

_(Aperçu de la scène 3D générée avec Three.js)_

## 🎯 Objectif du Projet

Créer une interface dynamique permettant de gérer et visualiser la progression des équipes/utilisateurs en temps réel, avec une mise à jour automatique depuis une base de données, tout en respectant des critères de performance et d’accessibilité.

---

## Fonctionnalités Clés

-   **Gamification instantanée** : gain d’XP en répondant à des questions sur l’interface principale.
-   **Identité ludique semi-anonyme** : génération d’un ID unique associé à un nom d’animal (ex. _Écureuil Furtif_, _Panda Endormi_) via un hachage serveur.
-   **Visualisation 3D immersive** : podium Three.js avec gestion des ombres, éclairage dynamique et barres évolutives.
-   **Tableau de bord analytique** : graphique en barres via Chart.js pour comparer facilement les scores.
-   **Mise à jour temps réel** : polling régulier du backend pour rafraîchir les classements sans rechargement.

---

## 🛠️ Architecture Technique

Le projet se compose d’un backend léger et performant et d’un frontend riche.

### 🔙 Backend (Node.js + Express + SQLite)

-   API REST simple pour la persistance des données.
-   Base de données : **better-sqlite3** (fichier `game.db`).
-   **NameRepository** : attribution déterministe d’un nom d’animal basé sur le hash de l’ID utilisateur.

**Endpoints :**

-   `POST /xp` : ajoute de l’XP à un utilisateur.
-   `GET /xp/all` : renvoie le classement trié par XP.
-   `DELETE /xp/:id` : nettoyage / gestion des utilisateurs.

### 🔜 Frontend (Angular)

L’interface propose deux modes de visualisation principaux.

#### 1. Podium 3D (Three.js)

-   Scène avec caméra « surveillance », vue d’ensemble du classement.
-   Utilisation de **WebGLRenderer** avec **ShadowMap**.
-   Barres dynamiques dont la hauteur suit l’XP.
-   Labels générés via Canvas 2D et intégrés au sol pour lisibilité.

#### 2. Graphique de Classement (Chart.js)

-   Histogramme clair et accessible.
-   Mise en avant de l’utilisateur courant avec couleur dédiée.
-   Couleurs contrastées + tooltips.

#### 3. Gestion des Données (UserProgressRepository)

-   Gestion de l’ID utilisateur via `localStorage`.
-   Synchronisation avec l’API toutes les 2 secondes pour l’effet temps réel.

---

## 🚀 Installation & Lancement

### Prérequis

-   Node.js installé.

### 1. Démarrer le Backend

```bash
cd BackEndUserProgress
npm install
npm run build
npm run start
```

```bash
cd FrontEnd
npm install
npm run start
```

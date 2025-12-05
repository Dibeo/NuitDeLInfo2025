#  Intégration 3D – Nuit de l’Info : Défi *En Trois Dimensions*

---

##  Présentation du défi

Ce projet a été réalisé pour le défi **“En trois dimensions”** proposé par
l’IUT de Marne-la-Vallée lors de la Nuit de l’Info.

Le but du défi :
 *Intégrer des éléments 3D pertinents dans un site web, en utilisant Three.js, afin d’améliorer ses fonctionnalités ou son esthétique.*

---

## Description du projet

Le projet intègre une **visualisation 3D avancée**, réalisée avec **Three.js** et **Angular**, exploitant la classe `MainVisualizer`.
Cette visualisation représente :

*  **Un modèle 3D animé (dragon Minecraft)**
*  **Une planète stylisée en rotation**
*  **Un champ de particules 3D volumétrique**
*  **Une réaction en temps réel aux sons chargés par l’utilisateur**

L’objectif est d’apporter une **plus-value fonctionnelle et esthétique** au site en proposant une expérience immersive : la 3D n'est pas décorative, elle est **pilotée par l’utilisateur**, **réagit à la musique**, et **renforce le thème interactif du site**.

---

## Valeur ajoutée au site

### Plus-value fonctionnelle

* L’utilisateur peut **importer son propre fichier audio**, qui devient immédiatement la source du visualiseur.
* Les éléments 3D s’animent **en fonction du spectre sonore** (FFT), créant un retour visuel interactif.
* Les animations sont synchronisées avec la musique et renforcent l’expérience d’écoute.

### Plus-value esthétique

* Le dragon animé flotte dans un univers stylisé.
* Une planète en rotation et des nuages 3D génèrent une ambiance immersive.
* Les jeux de lumières et la profondeur apportent une dimension artistique forte.

L'objectif n’était pas seulement d’ajouter de la 3D, mais de **rendre le site plus engageant**, plus vivant et en cohérence totale avec la fonctionnalité principale : *visualiser le son*.

---

## Technologies Utilisées

* **Three.js** – rendu 3D et animations
* **GLTFLoader** – chargement des modèles 3D
* **Angular 17** – architecture du projet
* **Web Audio API** – analyse en temps réel du spectre audio
* **SweetAlert2** – gestion de la sélection de fichier audio
* **Signals Angular** – gestion d’état moderne et efficace

---

##  Structure et Fonctionnement

###  Scène 3D

* `THREE.Scene`, `THREE.WebGLRenderer`, `THREE.PerspectiveCamera`
* Lumières : `AmbientLight` + `DirectionalLight`
* Gestion responsive du rendu (resize dynamique)

###  Éléments 3D intégrés

* **Dragon animé** (GLTF + animations)
* **Planète stylisée** (GLTF ou fallback géométrique)
* **Système de particules 3D** (Points + BufferGeometry)

###  Réactivité à l’audio

* Analyse FFT (256 samples)
* Mesure du volume global + bandes fréquentielles
* Synchronisation du dragon, de la planète et des nuages avec la musique

###  Intégration dans le site

Les éléments 3D sont intégrés dans une page dédiée du site, consultable :

**[https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio](https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio)**

Cette page fait partie prenante de l’expérience utilisateur du site, en cohérence avec les fonctionnalités proposées.

---

##  Mentions légales & Propriété intellectuelle

Les modèles 3D utilisés proviennent de sources libres ou redistribuables :

   *Fire Dragon Minecraft* – modèle GLTF (Creative Common)
   *Planet* – modèle GLTF stylisé (Creative Common)

 Les mentions correspondantes sont ajoutées dans la **page de mentions légales**, conformément aux règles du défi.

---

##  Liens pour la restitution

###  URL des pages intégrant la 3D

**[https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio](https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio)**

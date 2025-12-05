
# 3D Audio Visualizer – Nuit de l’Info x Capgemini
Défi : Capgemini – *Visualisation Audio*
URL du projet : [https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio](https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio)

---

## Présentation

Ce projet propose une visualisation audio 3D interactive, réalisée avec Angular et Three.js, spécialement pour le défi *Visualisation Audio* de Capgemini dans le cadre de la Nuit de l’Info.

L'objectif était de recréer l'esprit des anciens lecteurs multimédia (Winamp, Windows Media Player, etc.) en proposant un visuel original, réactif, immersif et amusant, en exploitant l'audio en temps réel.

Le visualiseur affiche :

* Un dragon 3D animé réagissant aux variations du spectre audio
* Une planète en rotation, influencée par le niveau sonore
* Un champ volumétrique de particules, simulant des nuages dynamiques
* Analyse audio temps réel via WebAudio API
* Possibilité d’importer son propre fichier audio (et obligation)

---

## Fonctionnalités

### Analyse audio temps réel

* Utilisation de AudioContext et AnalyserNode
* Récupération de l’énergie musicale en temps réel
* Calcul du niveau moyen ou de bandes fréquentielles

### Visualisation 3D réactive

* Modèle GLTF (dragon Minecraft) animé
* Rotation dynamique du dragon en fonction du volume
* Animation des nuages et rotation de la planète synchronisées avec la musique

### Interface utilisateur

* Import d’un fichier audio via une modale SweetAlert2
* Contrôle du volume
* Lecture / Pause / Arrêt
* Indicateurs de chargement via signaux Angular

---

## Architecture technique

### Technologies utilisées

* Angular 17
* Three.js (WebGL)
* GLTFLoader pour le chargement des modèles 3D
* SweetAlert2 pour les interactions utilisateur
* Audio API pour analyser le spectre sonore
* Signals Angular pour un état léger et réactif

### Composant principal : `MainVisualizer`

Ce composant gère :

* La scène 3D (`THREE.Scene`)
* La caméra et le rendu (`PerspectiveCamera`, `WebGLRenderer`)
* Le modèle principal (dragon)
* La planète secondaire
* Les particules (nuages)
* Le pipeline d'analyse audio
* La boucle d’animation
* Le redimensionnement dynamique



## Fonctionnement visuel

| Élément   | Rôle               | Réaction audio                                |
| ----------| -------------------| --------------------------------------------- |
| Dragon    | Modèle 3D animé    | incline sa tête proportionnellement au volume |
| Planète   | Décor dynamique    | rotation amplifiée par le niveau sonore       |
| Nuages 3D | Effet volumétrique | oscillations et rotation                      |
| Audio     | Source utilisateur | fréquence → mouvement                         |

---

## Gestion du modèle 3D

Deux méthodes de chargement sont prévues :

1. Chargement optimisé via `ModelLoaderService`
2. Fallback : chargement manuel avec `GLTFLoader`
3. Si tout échoue → cube placeholder pour éviter un crash

Chaque animation GLTF est ajoutée automatiquement via `AnimationMixer`.

---

## Choix techniques

* Three.js pour sa puissance graphique WebGL
* GLTF pour des modèles 3D légers et animés
* Angular Signals pour gérer l'état sans surcharge
* AudioContext pour une analyse fluide des FFT
* WebGLRenderer optimisé pour les grandes scènes

---

## Ce qui répond au défi Capgemini

* Visualisation fun, immersive et originale (j'espere)
* Source audio dynamique importée par l’utilisateur
* Effets 3D synchronisés à la musique
* Expérience fluide et gamifiée
* Projet hébergé et accessible en ligne

---

## Lien vers le défi national

Visualisation Audio – Projet Web 3D

[https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio](https://nuit-de-l-info2025-dibeo-dibeos-projects.vercel.app/visualisation-audio)

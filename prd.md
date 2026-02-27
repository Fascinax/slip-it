# PRD: Slip It

## 1. Product overview

### 1.1 Document title and version

- PRD: Piège à Mots
- Version: 1.1
- Date: 27 février 2026
- Auteur: Équipe produit

### 1.2 Résumé du produit

**Piège à Mots** est un jeu de société numérique pour mobile, conçu pour être joué en groupe en présentiel. Le principe est simple : chaque joueur reçoit secrètement une **cible** (un autre joueur) et un **mot secret**. Son objectif est d'amener naturellement sa cible à prononcer ce mot lors de la conversation libre entre les joueurs. Si la cible prononce le mot, le piégeur marque un point.

L'application est construite comme une PWA (Progressive Web App) avec Ionic 8 + Angular 18, sans serveur backend. Un seul téléphone est partagé à tour de rôle entre les joueurs pour consulter leurs cartes de mission personnelles, le reste du jeu se déroulant à l'oral.

Le jeu vise à être immédiatement accessible, sans création de compte, sans connexion internet requise après le premier chargement, et sans besoin de matériel externe. Il constitue une alternative numérique légère aux jeux de cartes physiques du même type, parfaitement adaptée aux soirées, apéros et rassemblements entre amis.

---

## 2. Objectifs

### 2.1 Objectifs business

- Proposer un jeu de société 100 % gratuit, sans publicité ni monétisation, accessible depuis un simple navigateur mobile
- Établir une base de joueurs fidèles via le bouche-à-oreille et le partage social
- Valider le concept auprès d'utilisateurs réels avant d'envisager des fonctionnalités premium (multijoueur en ligne, packs de mots, etc.)
- Construire une application de référence démontrant la maîtrise de la stack Ionic + Angular 18 en mode PWA

### 2.2 Objectifs utilisateurs

- Jouer immédiatement sans inscription ni téléchargement, avec seulement un téléphone et 3 amis minimum
- Personnaliser sa partie (nombre de manches, difficulté des mots, mode de jeu) en quelques secondes
- Reprendre une partie interrompue sans perdre les scores ni les assignations
- Comprendre les règles sans aide extérieure grâce à une UX auto-explicative

### 2.3 Non-objectifs (hors périmètre v1)

- Multijoueur en réseau (chaque joueur sur son propre téléphone)
- Système de comptes utilisateurs ou de profils persistants
- Classements en ligne ou comparaison entre parties
- Contenu payant ou modèle freemium
- Internationalisation (la v1 est exclusivement en français)
- Mode spectateur ou affichage secondaire (TV, projecteur)

---

## 3. Personas utilisateurs

### 3.1 Types d'utilisateurs clés

- Joueur hôte (initialise et gère la partie)
- Joueur participant (reçoit sa carte et joue)
- Groupe mixte (amis, famille, collègues, 3 à 20 personnes)

### 3.2 Détail des personas

- **L'hôte de soirée** : 25-40 ans, organise des rassemblements informels, cherche une activité simple à lancer sans explication longue. Il configure la partie en 2 minutes depuis son téléphone.
- **Le joueur occasionnel** : tout âge, peu habitué aux jeux numériques. Il prend le téléphone uniquement pour voir sa carte secrète, le reste du jeu est oral.
- **Le compétiteur** : voulant optimiser sa stratégie, il apprécie le classement en temps réel, les statistiques de fin de partie et la possibilité de jouer plusieurs manches.
- **L'animateur d'équipe** : utilise le jeu dans un cadre professionnel lors de team buildings ou de séminaires pour briser la glace.

### 3.3 Accès par rôle

- **Hôte** : configure la partie, ajoute les joueurs, lance les manches, valide les pièges déclarés, termine la partie
- **Joueur** : prend le téléphone à son tour pour consulter sa carte secrète (une seule fois par manche), déclare un piège en appuyant sur « Piégé ! »
- *Il n'y a pas de différenciation de rôle technique dans l'application (pas d'authentification différenciée), tous les joueurs utilisent le même appareil*

---

## 4. Exigences fonctionnelles

### Page d'accueil (`/home`)

**Priorité : Critique**

- Afficher le titre « Piège à Mots » avec le sous-titre « Fais prononcer le mot secret à ta cible… si tu oses ! »
- Bouton « Nouvelle partie » toujours visible, navigue vers `/game-setup`
- Bouton « Reprendre la partie » visible uniquement si une partie en cours existe en `localStorage` (statut différent de `FINISHED` et `SETUP`)
- L'état de la partie est chargé depuis le `localStorage` au démarrage

### Configuration de partie (`/game-setup`)

**Priorité : Critique**

- Formulaire d'ajout de joueur : champ nom (3 à 20 caractères), validation en temps réel, message d'erreur si nom dupliqué
- Minimum 3 joueurs, maximum 20 joueurs
- Badge coloré sur le compteur de joueurs : rouge si < 3, vert si ≥ 3
- Avertissement textuel « Minimum 3 joueurs requis » affiché si < 3 joueurs
- Bouton « Distribuer les cartes » (footer et header) désactivé si < 3 joueurs
- Suppression de joueur depuis la liste (icône poubelle)
- Paramètres de partie :
  - **Nombre de manches** : entier entre 1 et 10, défaut 3
  - **Difficulté des mots** : EASY / MEDIUM / HARD / MIXED, défaut MIXED
  - **Durée par manche (minutes)** : entier entre 5 et 60, défaut 20 (indicatif, pas de chronomètre en v1)
  - **Mode de jeu** : POINTS (score) / DRINK (gage à boire) / CUSTOM (pénalité personnalisée)
  - **Pénalité personnalisée** : champ texte libre, visible uniquement en mode CUSTOM

### Distribution des cartes (`/card-deal`)

**Priorité : Critique**

- Route protégée par `GameActiveGuard` (redirige vers `/home` si aucune partie active)
- Afficher l'indicateur de progression (barre + « Joueur X / N »)
- Pour chaque joueur (dans l'ordre de la liste), afficher l'écran d'invitation au passage de téléphone : « 📲 Passe le téléphone à [nom]. Il peut voir sa carte une seule fois. »
- Bouton « Voir ma carte » déclenche l'animation de retournement de carte (card flip)
- La carte révélée affiche : nom de la cible 🎯 et mot secret 🔑
- Bouton « J'ai mémorisé, suivant » masque la carte et passe au joueur suivant
- Une fois tous les joueurs servis, naviguer automatiquement vers `/gameplay`
- Les assignations sont générées par l'algorithme Fisher-Yates (chaîne cyclique sans auto-assignation)
- Les mots secrets sont sélectionnés aléatoirement depuis les fichiers JSON de mots filtrés par difficulté
- Retour audio haptique (`SoundService.tapFeedback()`) à chaque interaction clé

### Jeu en cours (`/gameplay`)

**Priorité : Critique**

- Route protégée par `GameActiveGuard`
- En-tête : numéro de manche actuelle / total de manches, bouton « Terminer » (icône stop)
- Carte de classement rapide : rang + avatar + nom + score pour chaque joueur
- Liste de joueurs avec deux boutons par joueur :
  - **« Ma carte »** : déclenche l'écran de passage de téléphone intermédiaire, puis révèle la carte secrète du joueur ; ce bouton est désactivé une fois la carte consultée pendant la manche en cours
  - **« Piégé ! »** : ouvre la modale de confirmation du piège (`ConfirmDialogComponent`) avec le message « [Trappeur] prétend avoir piégé [Cible] avec le mot "[mot]". Est-ce valide ? » — deux choix : « Oui, valider » (attribue +1 point) ou « Non, rejeter »
- Footer : bouton « Manche suivante » → alerte de confirmation Ionic → navigue vers `/scoreboard`
- Bouton « Terminer » → modale `ConfirmDialogComponent` → navigue vers `/game-end`

### Tableau des scores (`/scoreboard`)

**Priorité : Haute**

- Route protégée par `GameActiveGuard`
- Afficher le classement à l'issue de la manche avec podium (🥇🥈🥉 pour les 3 premiers)
- Chaque entrée affiche rang, avatar, nom et score cumulé
- Bouton « Distribuer les cartes » navigue vers `/card-deal` pour commencer la manche suivante

### Fin de partie (`/game-end`)

**Priorité : Haute**

- Mise en avant du vainqueur avec couronne 👑 et son score
- Statistiques de la partie : nombre de manches, nombre de pièges réussis, nombre de joueurs
- Podium complet (tous les joueurs classés)
- Section « Meilleur piège » (premier piège validé de la partie)
- Bouton « Nouvelle partie » → réinitialise le state et navigue vers `/home`

### Services transversaux

**Priorité : Critique**

- **`GameService`** : gestion du cycle de vie de la partie (SETUP → DEALING → IN_PROGRESS → FINISHED), persistance `localStorage`
- **`PlayerService`** : CRUD joueurs, gestion des scores, avatars colorés auto-assignés
- **`AssignmentService`** : génération des missions par manche (Fisher-Yates + chaîne cyclique)
- **`WordService`** : chargement des fichiers JSON de mots (`easy.json`, `medium.json`, `hard.json`), sélection aléatoire filtrée par difficulté
- **`ScoreService`** : calcul du classement trié par score décroissant
- **`StorageService`** : abstraction `localStorage` avec sérialisation/désérialisation (rehydratation des `Date`)
- **`SoundService`** : retour haptique et sons

---

## 5. Expérience utilisateur

### 5.1 Points d'entrée et flux nouvel utilisateur

- Accès direct via URL dans un navigateur mobile (Chrome, Safari) ou via raccourci PWA installé sur l'écran d'accueil
- Aucune inscription requise : la première interaction est le bouton « Nouvelle partie »
- L'application démarre avec la liste de mots déjà chargée (chargement au bootstrap dans `AppComponent`)
- Tutoriel implicite : chaque écran contient les instructions nécessaires pour l'action attendue

### 5.2 Expérience principale

- **Étape 1 — Configuration** : l'hôte entre les prénoms un par un, ajuste les paramètres si souhaité, lance la distribution
- **Étape 2 — Distribution** : le téléphone passe de main en main ; chaque joueur voit sa carte une seule fois, mémorise, et passe
- **Étape 3 — Jeu libre** : les joueurs conversent librement ; dès qu'un piège est déclaré, l'hôte valide ou rejette via la modale
- **Étape 4 — Fin de manche** : l'hôte appuie sur « Manche suivante », le classement intermédiaire est affiché
- **Étape 5 — Fin de partie** : après la dernière manche, le podium final est affiché avec les statistiques

### 5.3 Fonctionnalités avancées et cas limites

- Si l'utilisateur ferme l'application pendant une partie, la reprise est proposée via « Reprendre la partie » sur la home page
- Un joueur ne peut consulter sa carte qu'une seule fois par manche (le bouton « Ma carte » est désactivé après consultation)
- La suppression d'un joueur avec une partie déjà créée n'est pas possible (le bouton Supprimer n'est disponible qu'en phase de configuration)
- Si < 3 joueurs sont ajoutés, le lancement de la partie est bloqué avec un message d'erreur visuel
- Les noms de joueurs en double sont rejetés avec un message « toast » d'erreur
- La liste de mots est filtrée par difficulté avant sélection aléatoire ; si MIXED est sélectionné, tous les mots sont éligibles

### 5.4 Points forts UX/UI

- Design épuré Ionic avec palette chromatique cohérente (couleur primaire toolbar, couleur success/danger pour les états)
- Avatars colorés auto-générés pour identifier visuellement chaque joueur sans photo
- Animation card flip lors de la révélation de la carte secrète
- Écran intermédiaire de passage de téléphone systématique avant toute révélation (prévention de triche accidentelle)
- Classement visible en permanence pendant le jeu (carte « Classement rapide »)
- Modale de confirmation systématique pour toute action irréversible (valider piège, changer de manche, terminer)
- Retour haptique sur les interactions clés

---

## 6. Récit utilisateur

Un vendredi soir, Camille sort son téléphone et propose « Piège à Mots » à ses cinq amis. En 90 secondes, elle entre les six prénoms, choisit la difficulté « Hard » et lance une partie de 4 manches. Le téléphone passe à tour de rôle : chacun découvre en secret sa cible et son mot, retient l'information, puis la conversation reprend. Léo remarque que Théo vient de dire « nonchalamment » — exactement son mot secret — et crie « Piégé ! ». Camille valide le piège, Léo marque un point, et le classement s'actualise. À la fin des 4 manches, le podium révèle que Marie, discrète mais redoutable, a piégé tout le monde deux fois. La soirée se poursuit avec une revanche immédiatement lancée d'un simple appui.

---

## 7. Métriques de succès

### 7.1 Métriques centrées utilisateur

- Taux de conversion « page d'accueil → partie lancée » ≥ 80 %
- Taux de parties menées jusqu'à la fin (affichage du podium final) ≥ 60 %
- Temps moyen de configuration d'une partie (du home au premier card-deal) ≤ 2 minutes
- Taux de « reprise de partie » (% de parties reprises après interruption) ≥ 20 %
- Note de satisfaction moyenne ≥ 4/5 dans les retours qualitatifs

### 7.2 Métriques business

- Nombre de parties créées par semaine (objectif : +20 % chaque mois pendant les 6 premiers mois)
- Taux de retour (joueurs ayant lancé ≥ 3 parties distinctes)
- Taux de partage / recommandation (mesurable via analytics ou retours directs)

### 7.3 Métriques techniques

- Score Lighthouse Performance ≥ 90 sur mobile (mode PWA)
- Score Lighthouse Accessibility ≥ 85
- Temps de premier affichage (FCP) ≤ 1,5 s sur 4G
- Couverture des tests E2E Playwright : ≥ 85 % des parcours critiques (baseline : 27 tests passants)
- Zéro crash bloquant sur les navigateurs cibles (Chrome Android, Safari iOS)
- Taille du bundle JS initial ≤ 200 KB gzippé (lazy loading par route actif)

---

## 8. Considérations techniques

### 8.1 Points d'intégration

- **Assets de mots** : fichiers JSON statiques `easy.json`, `medium.json`, `hard.json` servis comme assets Angular
  - Structure : `[{ "word": string, "category": string, "difficulty": "EASY"|"MEDIUM"|"HARD" }]`
- **LocalStorage** : persistance de la partie complète via `StorageService` (clé `current_game`)
- **PWA** : manifest + service worker pour installation sur l'écran d'accueil et fonctionnement hors ligne
- **Routing** : lazy-loading par feature module avec `GameActiveGuard` sur les routes protégées

### 8.2 Stockage des données et confidentialité

- Toutes les données (joueurs, scores, assignations) sont stockées exclusivement en `localStorage` côté client
- Aucune donnée personnelle n'est transmise à un serveur
- Les noms de joueurs ne sont pas des données d'identification réelle (pseudonymes, prénoms)
- Pas de cookies, pas de tracking, pas d'analytics tiers en v1
- Le hash SHA-256 des PIN (fonctionnalité `PlayerService.pinHash`) est calculé côté client uniquement via Web Crypto API

### 8.3 Performance et scalabilité

- Architecture lazy-loading : chaque feature module (home, game-setup, card-deal, gameplay, scoreboard, game-end) est chargé à la demande
- `ChangeDetectionStrategy.OnPush` sur tous les composants pour minimiser les cycles de détection
- State management via `BehaviorSubject` RxJS : pas de bibliothèque tierce, overhead minimal
- Les fichiers de mots sont préchargés au bootstrap (`AppComponent`) pour éviter toute latence lors de la distribution des cartes
- Support simultané de 3 à 20 joueurs sur un seul appareil sans dégradation de performance

### 8.4 Défis potentiels

- **Triche** : un joueur curieux pourrait appuyer sur « Ma carte » d'un autre joueur ; l'écran intermédiaire de passage de téléphone et la désactivation post-consultation sont les seules garanties côté app (la confiance repose aussi sur les joueurs)
- **Mots insuffisants** : si le nombre de joueurs dépasse le nombre de mots disponibles pour la difficulté choisie, `AssignmentService` lèvera une erreur ; à mitiger par enrichissement régulier des listes de mots
- **Reprise de partie incohérente** : si le `localStorage` contient une partie en état `DEALING` (distribution interrompue), la reprise via `/gameplay` peut aboutir à un état incohérent ; à gérer par une logique de récupération d'état
- **Compatibilité Safari iOS** : certaines API Web Crypto et comportements CSS 3D (card flip) peuvent varier ; tests dédiés iOS nécessaires
- **Orientation de l'écran** : l'application est optimisée portrait ; le mode paysage sur tablette n'est pas supporté en v1

---

## 9. Jalons et séquencement

### 9.1 Estimation du projet

- **État actuel (v1 — base jouable)** : fonctionnalités de base implémentées, 27 tests E2E passants
- **v1.1 — Stabilisation** : Small — ~2 semaines
- **v1.2 — Enrichissement contenu** : Medium — ~3 semaines
- **v2.0 — Multijoueur en ligne** : Large — ~2-3 mois

### 9.2 Taille et composition de l'équipe

- Équipe minimale : 1 développeur full-stack (Ionic/Angular)
- Équipe idéale : 1 développeur, 1 designer UX/UI, 1 product manager

### 9.3 Phases suggérées

- **Phase 1 — Stabilisation v1.1** (2 semaines)
  - Corrections de bugs identifiés lors des tests utilisateurs
  - Amélioration des animations (card flip, transitions de pages)
  - Enrichissement des listes de mots (objectif : ≥ 200 mots par niveau de difficulté)
  - Support de l'installation PWA (manifest, splash screen, icônes)
  - Optimisation performances Lighthouse

- **Phase 2 — Enrichissement fonctionnel v1.2** (3 semaines)
  - Chronomètre par manche configurable (indicatif visuel, pas de fin automatique)
  - Historique des pièges de la partie affiché en fin de jeu
  - Partage du podium final via l'API Web Share
  - Mode « Rejouer » (même groupe de joueurs, nouvelle partie)
  - Catégories de mots sélectionnables (nature, sport, culture, etc.)

- **Phase 3 — Multijoueur local avancé v1.3** (4 semaines)
  - Mode « Sans passer le téléphone » : chaque joueur utilise son propre écran via QR Code ou lien de session locale (WebRTC peer-to-peer ou localStorage partagé sur WiFi)
  - Buzzer sonore personnalisable au moment de crier « Piégé ! »
  - Thèmes visuels (clair, sombre, soirée, etc.)

- **Phase 4 — Multijoueur en ligne v2.0** (2-3 mois)
  - Backend léger (NestJS / Supabase) pour les sessions de jeu en temps réel
  - WebSockets pour synchronisation des états entre appareils
  - Système de salle avec code à 6 caractères
  - Profils joueurs optionnels avec avatar persistant et statistiques historiques

---

## 10. User stories

### 10.1. Démarrage d'une nouvelle partie

- **ID** : PAM-001
- **Description** : En tant qu'hôte, je veux lancer une nouvelle partie depuis la page d'accueil afin de configurer mon groupe de joueurs.
- **Critères d'acceptation** :
  - Le bouton « Nouvelle partie » est visible et cliquable dès l'arrivée sur `/home`
  - Un clic navigue vers `/game-setup` sans délai perceptible
  - Si une partie en cours existe, elle est accessible séparément via « Reprendre la partie »

### 10.2. Ajout de joueurs

- **ID** : PAM-002
- **Description** : En tant qu'hôte, je veux ajouter les participants un par un avec leur prénom afin de constituer le groupe de jeu.
- **Critères d'acceptation** :
  - Le champ nom accepte entre 1 et 20 caractères
  - Un toast d'erreur s'affiche si le nom est dupliqué
  - Le badge de compteur passe du rouge au vert à partir de 3 joueurs
  - L'avertissement « Minimum 3 joueurs requis » disparaît dès que 3 joueurs sont listés
  - Le bouton d'ajout de joueur n'est plus affiché au-delà de 20 joueurs

### 10.3. Suppression d'un joueur avant la partie

- **ID** : PAM-003
- **Description** : En tant qu'hôte, je veux pouvoir retirer un joueur de la liste si je me suis trompé de prénom.
- **Critères d'acceptation** :
  - Chaque joueur de la liste dispose d'un bouton de suppression
  - La suppression est immédiate et met à jour le compteur et les styles
  - La suppression n'est possible qu'en phase de configuration (avant le lancement)

### 10.4. Configuration des paramètres de partie

- **ID** : PAM-004
- **Description** : En tant qu'hôte, je veux configurer la difficulté des mots et le nombre de manches afin d'adapter le jeu à mon groupe.
- **Critères d'acceptation** :
  - Le composant `app-game-settings` affiche les options : mode, nombre de manches (1-10), difficulté (EASY/MEDIUM/HARD/MIXED), durée et pénalité personnalisée
  - Les modifications sont reflétées immédiatement sans recharger la page
  - Les valeurs par défaut sont : 3 manches, MIXED, mode POINTS
  - En mode CUSTOM, le champ texte de pénalité personnalisée est affiché

### 10.5. Lancement de la distribution des cartes

- **ID** : PAM-005
- **Description** : En tant qu'hôte, je veux lancer la distribution des cartes secrètes pour démarrer la manche.
- **Critères d'acceptation** :
  - Le bouton « Distribuer les cartes » est désactivé si < 3 joueurs sont présents
  - Un clic avec ≥ 3 joueurs crée la partie en `localStorage`, passe le statut à `DEALING`, et navigue vers `/card-deal`
  - Les assignations sont générées à ce moment (pas avant)

### 10.6. Consultation de la carte secrète

- **ID** : PAM-006
- **Description** : En tant que joueur, je veux voir ma cible et mon mot secret de manière privée, en ayant la certitude que personne d'autre ne peut les voir en même temps.
- **Critères d'acceptation** :
  - L'écran d'invitation au passage de téléphone s'affiche avant tout accès à la carte
  - La carte n'est révélée qu'après appui sur « Voir ma carte »
  - L'animation de retournement de carte est visible
  - Le nom de la cible et le mot secret sont lisibles clairement
  - Après avoir cliqué « J'ai mémorisé, suivant », la carte disparaît et l'écran suivant prend le relais

### 10.7. Navigation automatique vers le jeu

- **ID** : PAM-007
- **Description** : En tant que groupe, nous voulons que l'application navigue automatiquement vers l'écran de jeu une fois que tous les joueurs ont vu leur carte.
- **Critères d'acceptation** :
  - Après que le dernier joueur ait cliqué « J'ai mémorisé, suivant », la navigation vers `/gameplay` est déclenchée automatiquement
  - La barre de progression atteint 100 % avant la navigation
  - L'état du jeu passe à `IN_PROGRESS`

### 10.8. Consultation de sa carte pendant le jeu

- **ID** : PAM-008
- **Description** : En tant que joueur, je veux pouvoir revoir ma carte une seule fois pendant la manche si j'ai oublié mon mot secret.
- **Critères d'acceptation** :
  - Chaque joueur dispose d'un bouton « Ma carte » dans la liste de la page gameplay
  - Un écran intermédiaire de passage de téléphone s'affiche avant la révélation
  - La carte est masquée après que le joueur clique « Fermer »
  - Le bouton « Ma carte » est désactivé définitivement pour ce joueur pour la manche en cours après consultation
  - Le bouton désactivé l'est uniquement pour la session locale (non persisté si l'app est rechargée)

### 10.9. Déclaration d'un piège

- **ID** : PAM-009
- **Description** : En tant que joueur ayant entendu sa cible prononcer son mot secret, je veux déclarer un piège pour marquer un point.
- **Critères d'acceptation** :
  - Le bouton « Piégé ! » est disponible pour chaque joueur à tout moment pendant le jeu
  - Une modale de confirmation s'affiche avec le nom du piégeur, de la cible et le mot secret
  - Le groupe valide ou rejette collectivement le piège
  - En cas de validation, +1 point est attribué au piégeur et un toast de confirmation s'affiche
  - En cas de rejet, aucune modification de score n'est effectuée
  - L'action est persistée dans `game.traps[]`

### 10.10. Passage à la manche suivante

- **ID** : PAM-010
- **Description** : En tant qu'hôte, je veux passer à la manche suivante et afficher le classement intermédiaire.
- **Critères d'acceptation** :
  - Le bouton « Manche suivante » (footer de `/gameplay`) déclenche une alerte de confirmation Ionic
  - Après confirmation, la navigation se fait vers `/scoreboard`
  - Le classement affiché reflète les scores cumulés à l'issue de la manche
  - Le bouton « Distribuer les cartes » sur `/scoreboard` relance une distribution pour la manche suivante

### 10.11. Fin de partie et podium

- **ID** : PAM-011
- **Description** : En tant que groupe, nous voulons voir le podium final avec les statistiques de la partie après la dernière manche.
- **Critères d'acceptation** :
  - Le bouton « Terminer » sur `/gameplay` ouvre une modale de confirmation
  - Après confirmation, la navigation se fait vers `/game-end`
  - Le vainqueur est mis en avant avec la couronne 👑 et son score
  - Les statistiques affichées sont : nombre de manches, nombre de pièges réussis, nombre de joueurs
  - Le podium complet est affiché (tous les joueurs avec rang et score)
  - Le statut de la partie passe à `FINISHED`

### 10.12. Reprise d'une partie interrompue

- **ID** : PAM-012
- **Description** : En tant que groupe, nous voulons reprendre notre partie là où nous l'avions laissée si l'application a été fermée accidentellement.
- **Critères d'acceptation** :
  - Le bouton « Reprendre la partie » est affiché sur `/home` si et seulement si une partie en statut `IN_PROGRESS` ou `DEALING` existe en `localStorage`
  - Un clic navigue vers `/gameplay` avec tous les scores et l'état de manche restaurés
  - Les données de joueurs, d'assignations et de pièges sont correctement réhydratées (notamment les objets `Date`)
  - Une partie en statut `FINISHED` ou `SETUP` ne génère pas le bouton « Reprendre »

### 10.13. Démarrage hors ligne

- **ID** : PAM-013
- **Description** : En tant qu'utilisateur dans un lieu sans connexion internet stable, je veux que l'application fonctionne correctement hors ligne.
- **Critères d'acceptation** :
  - L'application est installable en tant que PWA (manifest valide, service worker actif)
  - Toutes les fonctionnalités de jeu fonctionnent sans connexion réseau après le premier chargement
  - Les fichiers de mots (`easy.json`, `medium.json`, `hard.json`) sont mis en cache par le service worker
  - Aucune erreur bloquante n'apparaît en mode avion

### 10.14. Protection des routes actives

- **ID** : PAM-014
- **Description** : En tant que développeur, je veux que les routes de jeu soient protégées afin qu'un utilisateur ne puisse pas accéder à `/gameplay` ou `/card-deal` sans partie active.
- **Critères d'acceptation** :
  - `GameActiveGuard` redirige vers `/home` si `GameService.currentGame` est null
  - La navigation directe vers une URL protégée sans partie active aboutit à `/home`
  - Les routes `/home` et `/game-end` ne sont pas protégées

### 10.15. Accessibilité minimale

- **ID** : PAM-015
- **Description** : En tant qu'utilisateur avec des besoins d'accessibilité, je veux pouvoir utiliser l'application sur mobile sans difficulté majeure.
- **Critères d'acceptation** :
  - Score Lighthouse Accessibility ≥ 85
  - Tous les boutons ont un label accessible (`aria-label` si icône seule)
  - Les contrastes de couleurs respectent WCAG AA (ratio ≥ 4.5:1) pour le texte principal
  - La taille des zones de tap est ≥ 48x48 px sur mobile

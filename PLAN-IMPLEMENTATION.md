# Plan d'Implémentation — « Piège à Mots »

## 1. Concept du jeu

Chaque joueur tire au sort une **carte secrète** contenant :
- Le **nom d'un autre joueur** de la soirée (sa cible)
- Un **mot secret**

L'objectif : faire prononcer le mot secret à la cible, le plus naturellement possible. Quand le piège réussit → le joueur marque un point (ou la cible boit, selon le mode choisi).

---

## 2. Stack technique recommandée

| Couche | Technologie | Justification |
|---|---|---|
| **Framework mobile** | **Ionic 8 + Angular 18** (NgModule) | Une seule codebase pour iOS/Android/PWA |
| **Build natif** | **Capacitor 6** | Accès aux API natives (vibrations, notifications) |
| **State management** | **RxJS BehaviorSubject** dans des services façade | Standard Angular classique |
| **Persistance locale** | **Ionic Storage** (wrapper SQLite via Capacitor) | Pas de compte utilisateur requis |
| **Sync multi-appareils** (Phase 3) | **Firebase Realtime Database** ou **Supabase** | Chaque joueur sur son propre téléphone |
| **Base de mots** | Fichiers JSON embarqués | Fonctionne hors-ligne |
| **Tests** | Jasmine/Karma (unit), Cypress (E2E) | Standards Angular |

---

## 3. Fonctionnalités

### MVP (essentiel)

| # | Fonctionnalité | Description |
|---|---|---|
| F1 | **Création de partie** | Mode points/boisson/personnalisé, durée, nombre de manches |
| F2 | **Gestion des joueurs** | Ajout des prénoms (3 à 20 joueurs), avatar/couleur aléatoire |
| F3 | **Dictionnaire de mots** | ~500 mots FR par catégories (facile, moyen, difficile) |
| F4 | **Distribution secrète** | Mode « passer le téléphone » — chaque joueur voit sa carte sans que les autres voient |
| F5 | **Consultation secrète** | Revoir sa carte avec un PIN rapide |
| F6 | **Déclaration de piège** | Vote rapide du groupe pour valider |
| F7 | **Tableau des scores** | Classement en temps réel avec animations |
| F8 | **Écran de fin** | Podium, stats, meilleurs pièges |

### Post-MVP

- Mode **multi-appareils** (Firebase, code de salon)
- Mots personnalisés ajoutés par les joueurs
- Historique des parties
- Thèmes visuels (soirée, plage, Halloween...)
- Notifications de rappel (vibration discrète)
- Mode **Chaîne** (A piège B, B piège C, ... N piège A)
- Partage social

---

## 4. Modèles de données

```typescript
// === Game ===
export interface Game {
  id: string;
  createdAt: Date;
  status: GameStatus;          // SETUP | DEALING | IN_PROGRESS | FINISHED
  mode: GameMode;              // POINTS | DRINK | CUSTOM
  currentRound: number;
  totalRounds: number;
  players: Player[];
  assignments: Assignment[];
  traps: Trap[];
  settings: GameSettings;
}

// === Player ===
export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  pin: string;                 // PIN hashé (SHA-256)
  score: number;
}

// === Assignment (carte d'un joueur) ===
export interface Assignment {
  playerId: string;            // Le piégeur
  targetPlayerId: string;      // La cible
  secretWord: string;
  round: number;
  revealed: boolean;
}

// === Trap (piège réussi) ===
export interface Trap {
  id: string;
  assignmentPlayerId: string;
  targetPlayerId: string;
  secretWord: string;
  round: number;
  timestamp: Date;
  validated: boolean;
}

// === Mot ===
export interface WordEntry {
  word: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
```

---

## 5. Architecture de l'application

```
src/app/
├── core/                         # Services singletons
│   ├── services/
│   │   ├── game.service.ts       # Façade principale (BehaviorSubject)
│   │   ├── player.service.ts
│   │   ├── assignment.service.ts # Algorithme de distribution
│   │   ├── word.service.ts       # Chargement & filtrage des mots
│   │   ├── score.service.ts
│   │   ├── storage.service.ts    # Ionic Storage
│   │   └── sound.service.ts      # Capacitor vibrations/sons
│   ├── guards/
│   │   └── game-active.guard.ts
│   └── models/                   # Interfaces & enums
│
├── shared/                       # Composants réutilisables
│   ├── components/
│   │   ├── player-avatar/
│   │   ├── score-badge/
│   │   ├── countdown-timer/
│   │   ├── confirm-dialog/
│   │   └── card-flip/            # Animation 3D retournement
│   └── pipes/
│
├── features/
│   ├── home/                     # Écran d'accueil
│   ├── game-setup/               # Création de partie + ajout joueurs
│   ├── card-deal/                # Distribution des cartes
│   ├── gameplay/                 # Dashboard, consultation carte, déclaration piège
│   ├── scoreboard/               # Classement
│   ├── game-end/                 # Résultats & podium
│   └── history/                  # Historique (post-MVP)
│
└── assets/words/                 # JSON de mots (~500 mots FR)
```

---

## 6. Parcours écrans

```
ACCUEIL → AJOUTER JOUEURS → PARAMÈTRES → DISTRIBUTION DES CARTES
                                              │
                     ┌────────────────────────┘
                     ▼
              DASHBOARD (partie active)
              ├── 👁 Ma carte (PIN requis)
              ├── 🎯 J'ai piégé ! → Vote du groupe → Score mis à jour
              ├── 📊 Classement
              ├── ⏭ Manche suivante
              └── 🛑 Terminer → RÉSULTATS (podium + stats)
```

La **distribution** fonctionne en mode « passer le téléphone » :
1. Écran : "Passe le téléphone à **[Nom]**"
2. Le joueur entre son PIN (ou le crée la 1ère fois)
3. Animation flip → sa carte est révélée (cible + mot secret)
4. Bouton "J'ai compris" → joueur suivant

---

## 7. Feuille de route

### Phase 1 — MVP (4 semaines)

| Semaine | Tâches |
|---|---|
| **S1** | Initialisation projet Ionic/Angular, structure modules, modèles TypeScript, `StorageService`, `WordService` + fichiers JSON de mots |
| **S2** | Pages Accueil + GameSetup (ajout joueurs, paramètres), `GameService`, `AssignmentService` (algo de distribution) |
| **S3** | Module CardDeal (animation flip, passage du téléphone, PIN), module Gameplay (dashboard, consultation carte, déclaration piège) |
| **S4** | Scoreboard, écran de fin (podium), guard de routes, tests unitaires (≥80%), tests E2E Cypress |

### Phase 2 — Polish & UX (2 semaines)

- Thème SCSS complet (mode sombre, couleurs soirée)
- Animations et micro-interactions
- Sons / vibrations (Capacitor)
- Timer, mode chaîne, mots personnalisés
- Historique des parties
- Builds natifs iOS & Android

### Phase 3 — Multi-appareils & publication (3 semaines)

- Firebase Realtime Database, salons par code 6 caractères
- Chaque joueur rejoint depuis son propre téléphone
- Partage social
- Publication App Store & Google Play

**Durée totale estimée : ~9 semaines** pour un dev à temps plein.

---

## 8. Sécurité

| Risque | Mitigation |
|---|---|
| Espionnage de carte | PIN par joueur + écran de garde |
| Stockage PIN | Hashage SHA-256 (`crypto.subtle`) |
| XSS (noms/mots custom) | Sanitisation Angular + validation formulaire |
| Firebase (Phase 3) | Règles de sécurité : écriture/lecture limitées au salon |


import { GameMode } from './enums';

export interface GameSettings {
  mode: GameMode;
  totalRounds: number;
  wordDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  timePerRoundMinutes: number;
  customPenalty: string;
  /** v1.2 — Afficher un chronomètre indicatif pendant la manche */
  timerEnabled: boolean;
  /** v1.2 — Partie sans manches définies ; le jeu continue jusqu'à arrêt manuel */
  continuousMode: boolean;
  /** v1.2 — Catégories de mots autorisées ; tableau vide = toutes les catégories */
  selectedCategories: string[];
  /** Phase 2 — Mode chaîne : A piège B, B piège C, ... N piège A (ordre fixe des joueurs) */
  chainMode: boolean;
  /** Phase 2 — Mots personnalisés ajoutés par les joueurs */
  customWords: string[];
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  mode: GameMode.POINTS,
  totalRounds: 3,
  wordDifficulty: 'MIXED',
  timePerRoundMinutes: 20,
  customPenalty: '',
  timerEnabled: false,
  continuousMode: false,
  selectedCategories: [],
  chainMode: false,
  customWords: [],
};

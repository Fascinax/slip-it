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
};

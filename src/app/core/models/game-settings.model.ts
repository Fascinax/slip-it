import { GameMode } from './enums';

export interface GameSettings {
  mode: GameMode;
  totalRounds: number;
  wordDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  timePerRoundMinutes: number;
  customPenalty: string;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  mode: GameMode.POINTS,
  totalRounds: 3,
  wordDifficulty: 'MIXED',
  timePerRoundMinutes: 20,
  customPenalty: '',
};

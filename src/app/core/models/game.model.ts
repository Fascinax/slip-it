import { GameStatus, GameMode } from './enums';
import { Player } from './player.model';
import { Assignment } from './assignment.model';
import { Trap } from './trap.model';
import { GameSettings } from './game-settings.model';

export interface Game {
  id: string;
  createdAt: Date;
  status: GameStatus;
  mode: GameMode;
  currentRound: number;
  totalRounds: number;
  players: Player[];
  assignments: Assignment[];
  traps: Trap[];
  settings: GameSettings;
}

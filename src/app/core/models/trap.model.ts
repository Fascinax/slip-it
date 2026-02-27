export interface Trap {
  id: string;
  assignmentPlayerId: string;
  targetPlayerId: string;
  secretWord: string;
  round: number;
  timestamp: Date;
  validated: boolean;
}

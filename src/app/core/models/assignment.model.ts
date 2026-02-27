export interface Assignment {
  playerId: string;
  targetPlayerId: string;
  secretWord: string;
  round: number;
  revealed: boolean;
}

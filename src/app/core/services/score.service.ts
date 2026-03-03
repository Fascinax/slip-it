import { Injectable } from '@angular/core';
import { Player } from '../models';

export interface ScoreEntry {
  player: Player;
  rank: number;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {

  getRanking(players: Player[]): ScoreEntry[] {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    let currentRank = 1;
    return sorted.map((player, index) => {
      if (index > 0 && player.score < sorted[index - 1].score) {
        currentRank = index + 1;
      }
      return { player, rank: currentRank };
    });
  }

  getTopPlayer(players: Player[]): Player | null {
    if (players.length === 0) { return null; }
    return [...players].sort((a, b) => b.score - a.score)[0];
  }
}

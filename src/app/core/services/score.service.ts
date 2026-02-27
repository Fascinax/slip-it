import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../models';

export interface ScoreEntry {
  player: Player;
  rank: number;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {

  getRanking(players: Player[]): ScoreEntry[] {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return sorted.map((player, index) => ({
      player,
      rank: index + 1,
    }));
  }

  getTopPlayer(players: Player[]): Player | null {
    if (players.length === 0) { return null; }
    return [...players].sort((a, b) => b.score - a.score)[0];
  }
}

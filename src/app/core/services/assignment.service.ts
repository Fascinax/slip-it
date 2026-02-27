import { Injectable } from '@angular/core';
import { Assignment, Player, WordEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {

  /**
   * Generates one assignment per player for a given round.
   * Algorithm: Fisher-Yates shuffle on player IDs to create a cyclic
   * assignment chain (A→B, B→C, ..., N→A), ensuring no self-assignment.
   */
  generate(players: Player[], words: WordEntry[], round: number): Assignment[] {
    if (players.length < 2) {
      throw new Error('Il faut au minimum 2 joueurs pour distribuer les cartes.');
    }
    if (words.length < players.length) {
      throw new Error('Pas assez de mots disponibles pour cette manche.');
    }

    // Shuffle player ids to create the chain: ids[i] traps ids[(i+1) % n]
    const shuffledIds = this.fisherYatesShuffle(players.map(p => p.id));
    // Pick distinct random words
    const pickedWords = this.fisherYatesShuffle([...words]).slice(0, players.length);

    return shuffledIds.map((playerId, i) => ({
      playerId,
      targetPlayerId: shuffledIds[(i + 1) % shuffledIds.length],
      secretWord: pickedWords[i].word,
      round,
      revealed: false,
    }));
  }

  /** Fisher-Yates shuffle — cryptographically sufficient for game use */
  private fisherYatesShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

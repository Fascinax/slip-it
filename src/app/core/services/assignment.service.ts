import { Injectable } from '@angular/core';
import { Assignment, Player, WordEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {

  /**
   * Génère un assignment par joueur pour une manche donnée.
   *
   * @param chainMode false (défaut) = ordre aléatoire (Fisher-Yates),
   *                  true = ordre fixe des joueurs (A→B→C→...→N→A).
   */
  generate(
    players: Player[],
    words: WordEntry[],
    round: number,
    chainMode = false,
  ): Assignment[] {
    if (players.length < 2) {
      throw new Error('Il faut au minimum 2 joueurs pour distribuer les cartes.');
    }
    if (words.length < players.length) {
      throw new Error('Pas assez de mots disponibles pour cette manche.');
    }

    // Mode chaîne : ordre fixe ; Mode normal : chaîne aléatoire (Fisher-Yates sur les IDs)
    const orderedIds = chainMode
      ? players.map(p => p.id)
      : this.fisherYatesShuffle(players.map(p => p.id));

    // Mots distincts tirés aléatoirement quels que soit le mode
    const pickedWords = this.fisherYatesShuffle([...words]).slice(0, players.length);

    return orderedIds.map((playerId, i) => ({
      playerId,
      targetPlayerId: orderedIds[(i + 1) % orderedIds.length],
      secretWord: pickedWords[i].word,
      round,
      revealed: false,
    }));
  }

  /** Fisher-Yates shuffle */
  private fisherYatesShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

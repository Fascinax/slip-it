import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../models';
import { StorageService } from './storage.service';

const HISTORY_KEY = 'game_history';
const MAX_HISTORY = 50;

export interface GameSummary {
  id: string;
  playedAt: Date;
  totalRounds: number;
  playerCount: number;
  winnerName: string | null;
  winnerScore: number;
  totalTraps: number;
  modeName: string;
  chainMode: boolean;
  playerNames: string[];
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private _history$ = new BehaviorSubject<GameSummary[]>([]);

  /** Flux en lecture seule de l'historique */
  readonly history$: Observable<GameSummary[]> = this._history$.asObservable();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  get history(): GameSummary[] {
    return this._history$.value;
  }

  /** Sauvegarde un résumé de la partie terminée */
  async saveGame(game: Game): Promise<void> {
    const sorted = [...game.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0] ?? null;

    const summary: GameSummary = {
      id: game.id,
      playedAt: new Date(),
      totalRounds: game.currentRound,
      playerCount: game.players.length,
      winnerName: winner?.name ?? null,
      winnerScore: winner?.score ?? 0,
      totalTraps: game.traps.filter(t => t.validated).length,
      modeName: this.modeLabel(game.mode),
      chainMode: game.settings?.chainMode ?? false,
      playerNames: game.players.map(p => p.name),
    };

    const updated = [summary, ...this._history$.value].slice(0, MAX_HISTORY);
    this._history$.next(updated);
    await this.storage.set<GameSummary[]>(HISTORY_KEY, updated);
  }

  /** Supprime toutes les parties de l'historique */
  async clearHistory(): Promise<void> {
    this._history$.next([]);
    await this.storage.remove(HISTORY_KEY);
  }

  /** Supprime une seule entrée d'historique */
  async removeEntry(gameId: string): Promise<void> {
    const updated = this._history$.value.filter(g => g.id !== gameId);
    this._history$.next(updated);
    await this.storage.set<GameSummary[]>(HISTORY_KEY, updated);
  }

  private async loadFromStorage(): Promise<void> {
    const stored = await this.storage.get<GameSummary[]>(HISTORY_KEY);
    if (stored && stored.length > 0) {
      // Restore Date objects (JSON serialise en string)
      const withDates = stored.map(g => ({
        ...g,
        playedAt: new Date(g.playedAt),
      }));
      this._history$.next(withDates);
    }
  }

  private modeLabel(mode: string): string {
    const labels: Record<string, string> = {
      POINTS: 'Points',
      DRINK: 'Boisson',
      CUSTOM: 'Personnalisé',
    };
    return labels[mode] ?? mode;
  }
}

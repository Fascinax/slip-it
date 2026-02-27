import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Assignment, Trap, GameSettings } from '../models';
import { GameStatus, GameMode } from '../models/enums';
import { DEFAULT_GAME_SETTINGS } from '../models/game-settings.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'current_game';

@Injectable({ providedIn: 'root' })
export class GameService {
  private _game$ = new BehaviorSubject<Game | null>(null);

  /** Read-only stream of the current game state */
  readonly game$: Observable<Game | null> = this._game$.asObservable();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  get currentGame(): Game | null {
    return this._game$.value;
  }

  async createGame(mode: GameMode = GameMode.POINTS, settings?: Partial<GameSettings>): Promise<Game> {
    const game: Game = {
      id: uuidv4(),
      createdAt: new Date(),
      status: GameStatus.SETUP,
      mode,
      currentRound: 1,
      totalRounds: settings?.totalRounds ?? DEFAULT_GAME_SETTINGS.totalRounds,
      players: [],
      assignments: [],
      traps: [],
      settings: { ...DEFAULT_GAME_SETTINGS, ...settings, mode },
    };
    this._game$.next(game);
    await this.persist();
    return game;
  }

  async updateGame(partial: Partial<Game>): Promise<void> {
    const current = this._game$.value;
    if (!current) { return; }
    const updated: Game = { ...current, ...partial };
    this._game$.next(updated);
    await this.persist();
  }

  async setStatus(status: GameStatus): Promise<void> {
    await this.updateGame({ status });
  }

  async nextRound(): Promise<void> {
    const game = this._game$.value;
    if (!game) { return; }
    const next = game.currentRound + 1;
    if (next > game.totalRounds) {
      await this.setStatus(GameStatus.FINISHED);
    } else {
      await this.updateGame({ currentRound: next });
    }
  }

  async addTrap(trap: Trap): Promise<void> {
    const game = this._game$.value;
    if (!game) { return; }
    await this.updateGame({ traps: [...game.traps, trap] });
  }

  async resetGame(): Promise<void> {
    this._game$.next(null);
    await this.storage.remove(STORAGE_KEY);
  }

  private async persist(): Promise<void> {
    await this.storage.set(STORAGE_KEY, this._game$.value);
  }

  private async loadFromStorage(): Promise<void> {
    const saved = await this.storage.get<Game>(STORAGE_KEY);
    if (saved) {
      // Rehydrate Date objects
      this._game$.next({
        ...saved,
        createdAt: new Date(saved.createdAt),
        traps: saved.traps.map(t => ({ ...t, timestamp: new Date(t.timestamp) })),
      });
    }
  }
}

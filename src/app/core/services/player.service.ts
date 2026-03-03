import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../models';

const AVATAR_COLORS = [
  '#E63946', '#F4A261', '#2A9D8F', '#457B9D', '#6A4C93',
  '#E9C46A', '#264653', '#F72585', '#4CC9F0', '#06D6A0',
  '#FF6B6B', '#A8DADC', '#FFB703', '#8338EC', '#FB5607',
];

const MAX_PLAYERS = 10;

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private _players$ = new BehaviorSubject<Player[]>([]);

  readonly players$: Observable<Player[]> = this._players$.asObservable();

  constructor() {}

  /** Called by GameService at startup to restore players from persisted game */
  syncFromGame(players: Player[]): void {
    if (this._players$.value.length === 0 && players.length > 0) {
      this._players$.next([...players]);
    }
  }

  get players(): Player[] {
    return this._players$.value;
  }

  setPlayers(players: Player[]): void {
    this._players$.next([...players]);
  }

  addPlayer(name: string): Player {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      throw new Error('Le nom doit contenir au moins 2 caractères.');
    }
    if (this._players$.value.length >= MAX_PLAYERS) {
      throw new Error(`Maximum ${MAX_PLAYERS} joueurs autorisés.`);
    }
    const existing = this._players$.value.find(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      throw new Error(`Un joueur nommé "${trimmedName}" existe déjà.`);
    }

    const player: Player = {
      id: uuidv4(),
      name: trimmedName,
      avatarColor: this.nextColor(),
      score: 0,
    };
    this._players$.next([...this._players$.value, player]);
    return player;
  }

  removePlayer(id: string): void {
    this._players$.next(this._players$.value.filter(p => p.id !== id));
  }

  addScore(playerId: string, points = 1): void {
    this._players$.next(
      this._players$.value.map(p =>
        p.id === playerId ? { ...p, score: p.score + points } : p
      )
    );
  }

  resetScores(): void {
    this._players$.next(this._players$.value.map(p => ({ ...p, score: 0 })));
  }

  private nextColor(): string {
    const used = new Set(this._players$.value.map(p => p.avatarColor));
    const available = AVATAR_COLORS.filter(c => !used.has(c));
    return available.length > 0
      ? available[0]
      : AVATAR_COLORS[this._players$.value.length % AVATAR_COLORS.length];
  }
}

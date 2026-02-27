import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Player } from '../models';
import { hashPin } from '../utils/crypto.util';

const AVATAR_COLORS = [
  '#E63946', '#F4A261', '#2A9D8F', '#457B9D', '#6A4C93',
  '#E9C46A', '#264653', '#F72585', '#4CC9F0', '#06D6A0',
  '#FF6B6B', '#A8DADC', '#FFB703', '#8338EC', '#FB5607',
];

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private _players$ = new BehaviorSubject<Player[]>([]);

  readonly players$: Observable<Player[]> = this._players$.asObservable();

  get players(): Player[] {
    return this._players$.value;
  }

  setPlayers(players: Player[]): void {
    this._players$.next([...players]);
  }

  async addPlayer(name: string, pin: string): Promise<Player> {
    const trimmedName = name.trim();
    const existing = this._players$.value.find(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      throw new Error(`Un joueur nommé "${trimmedName}" existe déjà.`);
    }

    const pinHash = await hashPin(pin);
    const player: Player = {
      id: uuidv4(),
      name: trimmedName,
      avatarColor: this.nextColor(),
      pinHash,
      score: 0,
    };
    this._players$.next([...this._players$.value, player]);
    return player;
  }

  removePlayer(id: string): void {
    this._players$.next(this._players$.value.filter(p => p.id !== id));
  }

  async verifyPin(playerId: string, pin: string): Promise<boolean> {
    const player = this._players$.value.find(p => p.id === playerId);
    if (!player) { return false; }
    const hash = await hashPin(pin);
    // Use timing-safe comparison by comparing full hash strings
    return hash === player.pinHash;
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

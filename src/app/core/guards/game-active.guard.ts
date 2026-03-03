import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, switchMap, map, take } from 'rxjs';
import { GameService } from '../services/game.service';
import { GameStatus } from '../models/enums';

/** Prevents navigation to gameplay screens if no game exists */
@Injectable({ providedIn: 'root' })
export class GameActiveGuard implements CanActivate {

  constructor(private gameService: GameService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.gameService.ready$.pipe(
      switchMap(() => this.gameService.game$),
      take(1),
      map(game => {
        const hasGame = game !== null && game.status !== GameStatus.SETUP;
        return hasGame ? true : this.router.createUrlTree(['/home']);
      }),
    );
  }
}

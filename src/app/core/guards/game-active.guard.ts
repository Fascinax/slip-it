import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { GameService } from '../services/game.service';
import { GameStatus } from '../models/enums';

/** Prevents navigation to gameplay screens if no active game is running */
@Injectable({ providedIn: 'root' })
export class GameActiveGuard implements CanActivate {

  constructor(private gameService: GameService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.gameService.game$.pipe(
      map(game => {
        const active = game !== null &&
          game.status !== GameStatus.SETUP &&
          game.status !== GameStatus.FINISHED;
        return active ? true : this.router.createUrlTree(['/home']);
      })
    );
  }
}

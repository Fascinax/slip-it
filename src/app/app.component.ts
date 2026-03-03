import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WordService } from './core/services/word.service';
import { GameService } from './core/services/game.service';
import { PlayerService } from './core/services/player.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private wordService: WordService,
    private gameService: GameService,
    private playerService: PlayerService,
  ) {}

  ngOnInit(): void {
    this.wordService.loadWords().pipe(takeUntil(this.destroy$)).subscribe();
    this.gameService.registerPlayerSync(players => this.playerService.syncFromGame(players));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

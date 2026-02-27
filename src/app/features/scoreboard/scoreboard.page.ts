import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Game, Player } from '../../core/models';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { ScoreService, ScoreEntry } from '../../core/services/score.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.page.html',
  styleUrls: ['./scoreboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardPage implements OnInit, OnDestroy {
  game: Game | null = null;
  ranking: ScoreEntry[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private playerService: PlayerService,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(g => {
      this.game = g;
      this.cdr.markForCheck();
    });
    this.playerService.players$.pipe(takeUntil(this.destroy$)).subscribe(players => {
      this.ranking = this.scoreService.getRanking(players);
      this.cdr.markForCheck();
    });
  }

  trackByRank(_i: number, e: ScoreEntry): number { return e.rank; }

  dealNextRound(): void {
    this.router.navigate(['/card-deal']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

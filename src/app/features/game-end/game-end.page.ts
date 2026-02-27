import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Game, Player, Trap } from '../../core/models';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { ScoreService, ScoreEntry } from '../../core/services/score.service';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.page.html',
  styleUrls: ['./game-end.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameEndPage implements OnInit, OnDestroy {
  game: Game | null = null;
  ranking: ScoreEntry[] = [];
  winner: Player | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private gameService: GameService,
    private playerService: PlayerService,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(g => {
      this.game = g;
      this.cdr.markForCheck();
    });
    this.playerService.players$.pipe(takeUntil(this.destroy$)).subscribe(players => {
      this.ranking = this.scoreService.getRanking(players);
      this.winner = this.scoreService.getTopPlayer(players);
      this.cdr.markForCheck();
    });
  }

  get totalTraps(): number {
    return this.game?.traps.filter(t => t.validated).length ?? 0;
  }

  get bestTrap(): Trap | null {
    if (!this.game?.traps.length) { return null; }
    return this.game.traps.filter(t => t.validated)[0] ?? null;
  }

  trapperName(trap: Trap): string {
    const player = this.playerService.players.find(p => p.id === trap.assignmentPlayerId);
    return player?.name ?? '?';
  }

  targetName(trap: Trap): string {
    const player = this.playerService.players.find(p => p.id === trap.targetPlayerId);
    return player?.name ?? '?';
  }

  async newGame(): Promise<void> {
    await this.gameService.resetGame();
    this.playerService.resetScores();
    this.router.navigate(['/home']);
  }

  trackByRank(_i: number, e: ScoreEntry): number { return e.rank; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

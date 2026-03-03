import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Game, Player, Trap } from '../../core/models';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { ScoreService, ScoreEntry } from '../../core/services/score.service';
import { HistoryService } from '../../core/services/history.service';

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

  /** v1.2 — Indique si l'API Web Share est disponible */
  readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  private destroy$ = new Subject<void>();
  private historySaved = false;

  constructor(
    private router: Router,
    private gameService: GameService,
    private playerService: PlayerService,
    private scoreService: ScoreService,
    private historyService: HistoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(g => {
      this.game = g;
      // Sauvegarde unique dans l'historique quand la partie est terminée
      if (g && !this.historySaved) {
        this.historySaved = true;
        void this.historyService.saveGame(g);
      }
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

  /** v1.2 — Tous les pièges validés (historique complet) */
  get validatedTraps(): Trap[] {
    return this.game?.traps.filter(t => t.validated) ?? [];
  }

  /** @deprecated — conservé pour rétrocompatibilité */
  get bestTrap(): Trap | null {
    return this.validatedTraps[0] ?? null;
  }

  trapperName(trap: Trap): string {
    const player = this.playerService.players.find(p => p.id === trap.assignmentPlayerId);
    return player?.name ?? '?';
  }

  targetName(trap: Trap): string {
    const player = this.playerService.players.find(p => p.id === trap.targetPlayerId);
    return player?.name ?? '?';
  }

  /** v1.2 — Partager le podium via Web Share API */
  async sharePodium(): Promise<void> {
    if (!this.canShare) { return; }

    const lines = this.ranking.map(e =>
      `${e.rank}. ${e.player.name} — ${e.player.score} pt(s)`
    );
    const winnerLine = this.winner
      ? `🏆 Vainqueur : ${this.winner.name} (${this.winner.score} pt(s))`
      : '';

    try {
      await navigator.share({
        title: '🎯 Piège à Mots — Résultats',
        text: `${winnerLine}\n\n${lines.join('\n')}\n\nJoue sur Piège à Mots !`,
      });
    } catch {
      // L'utilisateur a annulé le partage — pas d'erreur à afficher
    }
  }

  /** v1.2 — Rejouer avec les mêmes joueurs (scores remis à zéro) */
  async replayGame(): Promise<void> {
    const settings = this.game?.settings;
    this.playerService.resetScores();
    if (settings) {
      await this.gameService.replayWithSamePlayers(settings);
    } else {
      await this.gameService.resetGame();
    }
    this.router.navigate(['/game-setup']);
  }

  async newGame(): Promise<void> {
    await this.gameService.resetGame();
    this.playerService.resetScores();
    // Vider complètement les joueurs pour repartir de zéro
    this.playerService.setPlayers([]);
    this.router.navigate(['/home']);
  }

  trackByRank(_i: number, e: ScoreEntry): string { return e.player.id; }
  trackByTrapId(_i: number, t: Trap): string { return t.id; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

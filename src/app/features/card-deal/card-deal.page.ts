import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ViewWillEnter } from '@ionic/angular';
import { Player, Assignment, Game } from '../../core/models';
import { GameStatus } from '../../core/models/enums';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { WordService } from '../../core/services/word.service';
import { AssignmentService } from '../../core/services/assignment.service';
import { SoundService } from '../../core/services/sound.service';

type DealState = 'WAITING' | 'SHOWING_CARD' | 'DONE';

@Component({
  selector: 'app-card-deal',
  templateUrl: './card-deal.page.html',
  styleUrls: ['./card-deal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDealPage implements OnInit, ViewWillEnter, OnDestroy {
  players: Player[] = [];
  assignments: Assignment[] = [];
  currentIndex = 0;
  state: DealState = 'WAITING';
  flipped = false;
  game: Game | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private gameService: GameService,
    private playerService: PlayerService,
    private wordService: WordService,
    private assignmentService: AssignmentService,
    private soundService: SoundService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(game => {
      this.game = game;
      this.cdr.markForCheck();
    });
    this.playerService.players$.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.players = p;
      this.cdr.markForCheck();
    });
  }

  /**
   * ionViewWillEnter fires each time the page becomes active — both on first
   * creation (round 1) and when IonicRouteStrategy re-activates the cached
   * component (round 2+). We reset the local UI state here so the page is
   * always in WAITING state with fresh assignments for the current round.
   */
  ionViewWillEnter(): void {
    this.currentIndex = 0;
    this.state = 'WAITING';
    this.flipped = false;
    this.generateAssignments();
    this.cdr.markForCheck();
  }

  get currentPlayer(): Player | null {
    return this.players[this.currentIndex] ?? null;
  }

  get currentAssignment(): Assignment | null {
    return this.assignments.find(a => a.playerId === this.currentPlayer?.id) ?? null;
  }

  get targetPlayer(): Player | null {
    const assign = this.currentAssignment;
    if (!assign) { return null; }
    return this.players.find(p => p.id === assign.targetPlayerId) ?? null;
  }

  private generateAssignments(): void {
    const settings = this.game?.settings;
    const words = this.wordService.pickRandom(
      this.players.length,
      (settings?.wordDifficulty ?? 'MIXED') as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
      settings?.selectedCategories?.length ? settings.selectedCategories : undefined,
      settings?.customWords?.length ? settings.customWords : undefined,
    );
    if (this.players.length >= 2) {
      this.assignments = this.assignmentService.generate(
        this.players,
        words,
        this.game?.currentRound ?? 1,
        settings?.chainMode ?? false,
      );
    }
  }

  async showCard(): Promise<void> {
    this.state = 'SHOWING_CARD';
    this.flipped = true;
    this.cdr.markForCheck();
    await this.soundService.tapFeedback();
  }

  confirmCard(): void {
    const assign = this.currentAssignment;
    if (assign) { assign.revealed = true; }
    this.flipped = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.players.length) {
        this.finishDeal();
      } else {
        this.state = 'WAITING';
        this.cdr.markForCheck();
      }
    }, 400);
  }

  private async finishDeal(): Promise<void> {
    await this.gameService.updateGame({
      assignments: this.assignments,
      status: GameStatus.IN_PROGRESS,
    });
    await this.soundService.successFeedback();
    this.router.navigate(['/gameplay']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

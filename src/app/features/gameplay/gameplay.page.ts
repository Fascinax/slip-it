import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AlertController, ModalController, ToastController, ViewWillEnter } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Assignment, Trap } from '../../core/models';
import { GameStatus } from '../../core/models/enums';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { SoundService } from '../../core/services/sound.service';
import { ScoreService, ScoreEntry } from '../../core/services/score.service';
import { WordService } from '../../core/services/word.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gameplay',
  templateUrl: './gameplay.page.html',
  styleUrls: ['./gameplay.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameplayPage implements OnInit, OnDestroy, ViewWillEnter {
  game: Game | null = null;
  players: Player[] = [];
  ranking: ScoreEntry[] = [];
  showCardFor: Player | null = null;
  viewingCard = false;
  viewedPlayerIds = new Set<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private gameService: GameService,
    private playerService: PlayerService,
    private scoreService: ScoreService,
    private soundService: SoundService,
    private wordService: WordService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter(): void {
    this.viewedPlayerIds.clear();
    this.showCardFor = null;
    this.viewingCard = false;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe(game => {
      this.game = game;
      this.cdr.markForCheck();
    });
    this.playerService.players$.pipe(takeUntil(this.destroy$)).subscribe(players => {
      this.players = players;
      this.ranking = this.scoreService.getRanking(players);
      this.cdr.markForCheck();
    });
  }

  get continuousMode(): boolean {
    return this.game?.settings?.continuousMode === true;
  }

  get timerEnabled(): boolean {
    return this.game?.settings?.timerEnabled === true;
  }

  get timerDuration(): number {
    return this.game?.settings?.timePerRoundMinutes ?? 20;
  }

  get myAssignment(): Assignment | null {
    if (!this.showCardFor || !this.game) { return null; }
    return this.latestAssignmentFor(this.showCardFor.id);
  }

  hasTrapAlready(player: Player): boolean {
    if (!this.game) { return false; }
    const assign = this.latestAssignmentFor(player.id);
    if (!assign) { return false; }
    return this.game.traps.some(
      t => t.assignmentPlayerId === player.id
        && t.round === this.game!.currentRound
        && t.secretWord === assign.secretWord
        && t.validated,
    );
  }

  private latestAssignmentFor(playerId: string): Assignment | null {
    if (!this.game) { return null; }
    const matches = this.game.assignments.filter(
      a => a.playerId === playerId && a.round === this.game!.currentRound
    );
    return matches[matches.length - 1] ?? null;
  }

  get myTarget(): Player | null {
    const assign = this.myAssignment;
    if (!assign) { return null; }
    return this.players.find(p => p.id === assign.targetPlayerId) ?? null;
  }

  openCard(player: Player): void {
    this.showCardFor = player;
    this.viewingCard = false;
    this.cdr.markForCheck();
  }

  async revealCard(): Promise<void> {
    this.viewingCard = true;
    this.cdr.markForCheck();
    await this.soundService.tapFeedback();
  }

  closeCard(): void {
    if (this.showCardFor) {
      this.viewedPlayerIds.add(this.showCardFor.id);
    }
    this.showCardFor = null;
    this.viewingCard = false;
    this.cdr.markForCheck();
  }

  async onTimerUrgent(): Promise<void> {
    await this.soundService.warningFeedback();
    const toast = await this.toastCtrl.create({
      message: '⏰ Plus qu\'une minute !',
      duration: 2000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();
  }

  async onTimerExpired(): Promise<void> {
    await this.soundService.errorFeedback();
    const toast = await this.toastCtrl.create({
      message: '⏱ Temps écoulé pour cette manche !',
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }

  async declareTrap(trapper: Player): Promise<void> {
    if (this.hasTrapAlready(trapper)) {
      const toast = await this.toastCtrl.create({
        message: `⚠️ ${trapper.name} a déjà validé un piège avec ce mot`,
        duration: 2500,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const assign = this.latestAssignmentFor(trapper.id);
    if (!assign) { return; }

    const target = this.players.find(p => p.id === assign.targetPlayerId);
    const modal = await this.modalCtrl.create({
      component: ConfirmDialogComponent,
      componentProps: {
        title: '🎯 Piège déclaré !',
        message: `${trapper.name} prétend avoir piégé ${target?.name ?? '?'} avec le mot "${assign.secretWord}". Est-ce valide ?`,
        confirmLabel: 'Oui, valider',
        cancelLabel: 'Non, rejeter',
        confirmColor: 'success',
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      await this.validateTrap(trapper, assign);
    }
  }

  private async validateTrap(trapper: Player, assign: Assignment): Promise<void> {
    const trap: Trap = {
      id: uuidv4(),
      assignmentPlayerId: trapper.id,
      targetPlayerId: assign.targetPlayerId,
      secretWord: assign.secretWord,
      round: this.game!.currentRound,
      timestamp: new Date(),
      validated: true,
    };
    this.playerService.addScore(trapper.id, 1);
    await this.gameService.addTrap(trap);
    await this.gameService.syncPlayers(this.players);
    await this.soundService.successFeedback();

    const toast = await this.toastCtrl.create({
      message: `🎉 Piège validé ! +1 point pour ${trapper.name}`,
      duration: 3000,
      color: 'success',
    });
    await toast.present();

    // v1.2 — Mode continu : proposer une nouvelle carte au piégeur
    if (this.continuousMode) {
      await this.offerNewCardInContinuousMode(trapper);
    }
  }

  /** v1.2 — Mode continu : génère et ajoute une nouvelle assignation pour le piégeur */
  private async offerNewCardInContinuousMode(trapper: Player): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '🔄 Nouvelle carte ?',
      message: `${trapper.name} peut recevoir une nouvelle mission. Distribuer ?`,
      buttons: [
        { text: 'Plus tard', role: 'cancel' },
        {
          text: 'Distribuer',
          handler: () => this.distributeNewCard(trapper),
        },
      ],
    });
    await alert.present();
  }

  private async distributeNewCard(trapper: Player): Promise<void> {
    const settings = this.game?.settings;
    const round = this.game?.currentRound ?? 1;

    const usedWords = (this.game?.assignments ?? [])
      .filter(a => a.round === round)
      .map(a => a.secretWord);

    const [newWord] = this.wordService.pickRandom(
      1,
      (settings?.wordDifficulty ?? 'MIXED') as 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED',
      settings?.selectedCategories?.length ? settings.selectedCategories : undefined,
      settings?.customWords?.length ? settings.customWords : undefined,
      usedWords,
    );
    if (!newWord) { return; }

    // Choisir une cible différente du piégeur lui-même
    const possibleTargets = this.players.filter(p => p.id !== trapper.id);
    const newTarget = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    if (!newTarget) { return; }

    const newAssignment: Assignment = {
      playerId: trapper.id,
      targetPlayerId: newTarget.id,
      secretWord: newWord.word,
      round,
      revealed: false,
    };

    const current = this.game!;
    await this.gameService.updateGame({
      assignments: [...current.assignments, newAssignment],
    });

    // Permettre au piégeur de revoir sa nouvelle carte
    this.viewedPlayerIds.delete(trapper.id);
    this.cdr.markForCheck();

    const toast = await this.toastCtrl.create({
      message: `📲 Nouvelle carte prête pour ${trapper.name}`,
      duration: 2500,
      color: 'tertiary',
    });
    await toast.present();
  }

  async nextRound(): Promise<void> {
    if (!this.game || this.game.status === GameStatus.FINISHED) { return; }

    const alert = await this.alertCtrl.create({
      header: 'Manche suivante',
      message: `Passer à la manche ${(this.game?.currentRound ?? 0) + 1} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Suivant', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') { return; }

    await this.gameService.syncPlayers(this.players);
    await this.gameService.nextRound();
    const current = this.gameService.currentGame;
    if (current?.status === GameStatus.FINISHED) {
      this.router.navigate(['/game-end']);
    } else {
      this.router.navigate(['/scoreboard']);
    }
  }

  async endGame(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmDialogComponent,
      componentProps: {
        title: 'Terminer la partie',
        message: 'Mettre fin à la partie et voir le podium ?',
        confirmLabel: 'Terminer',
        confirmColor: 'danger',
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss<boolean>();
    if (data) {
      await this.gameService.syncPlayers(this.players);
      await this.gameService.setStatus(GameStatus.FINISHED);
      this.router.navigate(['/game-end']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_i: number, p: Player): string { return p.id; }
  trackByRank(_i: number, e: ScoreEntry): string { return e.player.id; }
}

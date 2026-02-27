import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Assignment, Trap } from '../../core/models';
import { GameStatus } from '../../core/models/enums';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';
import { SoundService } from '../../core/services/sound.service';
import { ScoreService, ScoreEntry } from '../../core/services/score.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gameplay',
  templateUrl: './gameplay.page.html',
  styleUrls: ['./gameplay.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameplayPage implements OnInit, OnDestroy {
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
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

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

  get myAssignment(): Assignment | null {
    if (!this.showCardFor || !this.game) { return null; }
    return this.game.assignments.find(
      a => a.playerId === this.showCardFor!.id && a.round === this.game!.currentRound
    ) ?? null;
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

  revealCard(): void {
    this.viewingCard = true;
    this.cdr.markForCheck();
    this.soundService.tapFeedback();
  }

  closeCard(): void {
    if (this.showCardFor) {
      this.viewedPlayerIds.add(this.showCardFor.id);
    }
    this.showCardFor = null;
    this.viewingCard = false;
    this.cdr.markForCheck();
  }

  async declareTrap(trapper: Player): Promise<void> {
    const assign = this.game?.assignments.find(
      a => a.playerId === trapper.id && a.round === this.game!.currentRound
    );
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
    this.soundService.successFeedback();

    const toast = await this.toastCtrl.create({
      message: `🎉 Piège validé ! +1 point pour ${trapper.name}`,
      duration: 3000,
      color: 'success',
    });
    await toast.present();
  }

  async nextRound(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Manche suivante',
      message: `Passer à la manche ${(this.game?.currentRound ?? 0) + 1} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Suivant',
          handler: async () => {
            await this.gameService.nextRound();
            if (this.game?.status === GameStatus.FINISHED) {
              this.router.navigate(['/game-end']);
            } else {
              this.router.navigate(['/scoreboard']);
            }
          },
        },
      ],
    });
    await alert.present();
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
      await this.gameService.setStatus(GameStatus.FINISHED);
      this.router.navigate(['/game-end']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_i: number, p: Player): string { return p.id; }
  trackByRank(_i: number, e: ScoreEntry): number { return e.rank; }
}

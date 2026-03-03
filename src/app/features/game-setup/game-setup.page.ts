import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';
import { Player, GameSettings } from '../../core/models';
import { GameMode, GameStatus } from '../../core/models/enums';
import { DEFAULT_GAME_SETTINGS } from '../../core/models/game-settings.model';
import { GameService } from '../../core/services/game.service';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.page.html',
  styleUrls: ['./game-setup.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSetupPage implements OnInit, OnDestroy {
  players: Player[] = [];
  settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private gameService: GameService,
    private playerService: PlayerService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.playerService.players$
      .pipe(takeUntil(this.destroy$))
      .subscribe(players => {
        this.players = players;
        this.cdr.markForCheck();
      });
  }

  async onPlayerAdded(name: string): Promise<void> {
    try {
      this.playerService.addPlayer(name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du joueur.';
      const toast = await this.toastCtrl.create({ message: msg, duration: 2500, color: 'danger' });
      await toast.present();
    }
  }

  onPlayerRemoved(playerId: string): void {
    this.playerService.removePlayer(playerId);
  }

  onSettingsChanged(settings: GameSettings): void {
    this.settings = settings;
  }

  onCustomWordsChanged(words: string[]): void {
    this.settings = { ...this.settings, customWords: words };
  }

  get canStartGame(): boolean {
    return this.players.length >= 3;
  }

  async startGame(): Promise<void> {
    if (!this.canStartGame) { return; }

    await this.gameService.createGame(this.settings.mode, this.settings);
    await this.gameService.syncPlayers(this.playerService.players);
    await this.gameService.setStatus(GameStatus.DEALING);

    this.router.navigate(['/card-deal']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

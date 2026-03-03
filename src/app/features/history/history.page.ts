import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { HistoryService, GameSummary } from '../../core/services/history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage implements OnInit, OnDestroy {
  history: GameSummary[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private historyService: HistoryService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.historyService.history$
      .pipe(takeUntil(this.destroy$))
      .subscribe(hist => {
        this.history = hist;
        this.cdr.markForCheck();
      });
  }

  trackById(_: number, item: GameSummary): string {
    return item.id;
  }

  trackByName(_: number, name: string): string {
    return name;
  }

  async onDeleteEntry(gameId: string): Promise<void> {
    await this.historyService.removeEntry(gameId);
  }

  async onClearAll(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Effacer l\'historique',
      message: 'Supprimer toutes les parties sauvegardées ? Cette action est irréversible.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Effacer',
          role: 'destructive',
          handler: () => this.historyService.clearHistory(),
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

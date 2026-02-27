import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>{{ message }}</p>
    </ion-content>
    <ion-footer class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" fill="outline" color="medium" (click)="dismiss(false)">
              {{ cancelLabel }}
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" [color]="confirmColor" (click)="dismiss(true)">
              {{ confirmLabel }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  `,
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() confirmColor = 'danger';

  constructor(private modalCtrl: ModalController) {}

  dismiss(confirmed: boolean): void {
    this.modalCtrl.dismiss(confirmed);
  }
}

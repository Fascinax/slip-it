import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlayerAvatarComponent } from './components/player-avatar/player-avatar.component';
import { ScoreBadgeComponent } from './components/score-badge/score-badge.component';
import { CardFlipComponent } from './components/card-flip/card-flip.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

const COMPONENTS = [
  PlayerAvatarComponent,
  ScoreBadgeComponent,
  CardFlipComponent,
  ConfirmDialogComponent,
];

/** Reusable presentational components — import in any feature module */
@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ...COMPONENTS,
  ],
})
export class SharedModule {}

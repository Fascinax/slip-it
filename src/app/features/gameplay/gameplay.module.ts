import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GameplayPage } from './gameplay.page';

const routes: Routes = [
  { path: '', component: GameplayPage },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [GameplayPage],
})
export class GameplayModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GameEndPage } from './game-end.page';

const routes: Routes = [{ path: '', component: GameEndPage }];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [GameEndPage],
})
export class GameEndModule {}

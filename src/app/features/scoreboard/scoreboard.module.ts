import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ScoreboardPage } from './scoreboard.page';

const routes: Routes = [{ path: '', component: ScoreboardPage }];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [ScoreboardPage],
})
export class ScoreboardModule {}

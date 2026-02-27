import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GameSetupPage } from './game-setup.page';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { AddPlayerComponent } from './components/add-player/add-player.component';
import { GameSettingsComponent } from './components/game-settings/game-settings.component';
import { CustomWordsComponent } from './components/custom-words/custom-words.component';

const routes: Routes = [
  { path: '', component: GameSetupPage },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [
    GameSetupPage,
    PlayerListComponent,
    AddPlayerComponent,
    GameSettingsComponent,
    CustomWordsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GameSetupModule {}

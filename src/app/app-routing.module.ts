import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { GameActiveGuard } from './core/guards/game-active.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'game-setup',
    loadChildren: () =>
      import('./features/game-setup/game-setup.module').then(m => m.GameSetupModule),
  },
  {
    path: 'card-deal',
    canActivate: [GameActiveGuard],
    loadChildren: () =>
      import('./features/card-deal/card-deal.module').then(m => m.CardDealModule),
  },
  {
    path: 'gameplay',
    canActivate: [GameActiveGuard],
    loadChildren: () =>
      import('./features/gameplay/gameplay.module').then(m => m.GameplayModule),
  },
  {
    path: 'scoreboard',
    canActivate: [GameActiveGuard],
    loadChildren: () =>
      import('./features/scoreboard/scoreboard.module').then(m => m.ScoreboardModule),
  },
  {
    path: 'game-end',
    loadChildren: () =>
      import('./features/game-end/game-end.module').then(m => m.GameEndModule),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

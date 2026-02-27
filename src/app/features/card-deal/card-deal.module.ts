import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CardDealPage } from './card-deal.page';

const routes: Routes = [
  { path: '', component: CardDealPage },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [CardDealPage],
})
export class CardDealModule {}

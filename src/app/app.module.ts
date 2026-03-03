import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ServiceWorkerModule } from '@angular/service-worker';
import { addIcons } from 'ionicons';
import {
  add,
  alarmOutline,
  arrowForwardCircle,
  chatbubbles,
  checkmarkCircle,
  chevronDown,
  chevronUp,
  closeCircle,
  diceOutline,
  eye,
  eyeOff,
  flash,
  gameController,
  infinite,
  keyOutline,
  linkOutline,
  locateOutline,
  medalOutline,
  people,
  peopleCircle,
  personAdd,
  phonePortraitOutline,
  playCircle,
  refresh,
  shareSocial,
  statsChartOutline,
  time,
  timeOutline,
  trash,
  trashOutline,
  trophy,
  trophyOutline,
} from 'ionicons/icons';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

addIcons({
  add,
  'alarm-outline': alarmOutline,
  'arrow-forward-circle': arrowForwardCircle,
  chatbubbles,
  'checkmark-circle': checkmarkCircle,
  'chevron-down': chevronDown,
  'chevron-up': chevronUp,
  'close-circle': closeCircle,
  'dice-outline': diceOutline,
  eye,
  'eye-off': eyeOff,
  flash,
  'game-controller': gameController,
  infinite,
  'key-outline': keyOutline,
  'link-outline': linkOutline,
  'locate-outline': locateOutline,
  'medal-outline': medalOutline,
  people,
  'people-circle': peopleCircle,
  'person-add': personAdd,
  'phone-portrait-outline': phonePortraitOutline,
  'play-circle': playCircle,
  refresh,
  'share-social': shareSocial,
  'stats-chart-outline': statsChartOutline,
  time,
  'time-outline': timeOutline,
  trash,
  'trash-outline': trashOutline,
  trophy,
  'trophy-outline': trophyOutline,
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({
      mode: 'md',  // Material Design mode for consistent cross-platform look
    }),
    CoreModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

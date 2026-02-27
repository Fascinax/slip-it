import { Injectable } from '@angular/core';

/** Handles haptic feedback via the Web Vibration API.
 *  Capacitor Haptics plugin can be swapped in for native builds. */
@Injectable({ providedIn: 'root' })
export class SoundService {

  /** Short tap feedback — card reveal, button press */
  tapFeedback(): void {
    this.vibrate(30);
  }

  /** Success feedback — trap validated */
  successFeedback(): void {
    this.vibrate([50, 30, 100]);
  }

  /** Error / denied feedback */
  errorFeedback(): void {
    this.vibrate([100, 50, 100]);
  }

  private vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

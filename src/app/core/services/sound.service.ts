import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Retours haptiques : Capacitor Haptics (iOS/Android natif)
 * avec fallback sur le Web Vibration API (PWA/navigateur).
 */
@Injectable({ providedIn: 'root' })
export class SoundService {

  /** Tap léger — pression de bouton, retournement de carte */
  async tapFeedback(): Promise<void> {
    const done = await this.nativeImpact(ImpactStyle.Light);
    if (!done) { this.vibrate(30); }
  }

  /** Impact moyen — confirmation d'action */
  async mediumFeedback(): Promise<void> {
    const done = await this.nativeImpact(ImpactStyle.Medium);
    if (!done) { this.vibrate(50); }
  }

  /** Succès — piège validé ✅ */
  async successFeedback(): Promise<void> {
    const done = await this.nativeNotification(NotificationType.Success);
    if (!done) { this.vibrate([50, 30, 100]); }
  }

  /** Erreur / refus ❌ */
  async errorFeedback(): Promise<void> {
    const done = await this.nativeNotification(NotificationType.Error);
    if (!done) { this.vibrate([100, 50, 100]); }
  }

  /** Avertissement — temps presque écoulé ⚠️ */
  async warningFeedback(): Promise<void> {
    const done = await this.nativeNotification(NotificationType.Warning);
    if (!done) { this.vibrate([60, 20, 60]); }
  }

  /** Sélection / toggle ✔️ */
  async selectionFeedback(): Promise<void> {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      this.vibrate(20);
    }
  }

  // ── Helpers privés ───────────────────────────────────────────────────────

  private async nativeImpact(style: ImpactStyle): Promise<boolean> {
    try {
      await Haptics.impact({ style });
      return true;
    } catch {
      return false;
    }
  }

  private async nativeNotification(type: NotificationType): Promise<boolean> {
    try {
      await Haptics.notification({ type });
      return true;
    } catch {
      return false;
    }
  }

  private vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

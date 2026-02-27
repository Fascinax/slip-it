import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-score-badge',
  template: `
    <span class="badge" [class.badge--zero]="score === 0">
      {{ score }} pt{{ score !== 1 ? 's' : '' }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      background: var(--ion-color-primary);
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .badge--zero { background: var(--ion-color-medium); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreBadgeComponent {
  @Input() score = 0;
}

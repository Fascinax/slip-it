import { Component, Input, ChangeDetectionStrategy, OnChanges, OnDestroy, SimpleChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-score-badge',
  template: `
    <span class="badge"
          [class.badge--zero]="score === 0"
          [class.badge--pop]="popping">
      {{ score }} pt{{ score !== 1 ? 's' : '' }}
    </span>
  `,
  styles: [`
    :host { display: inline-block; }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: var(--pam-radius-pill, 999px);
      background: var(--ion-color-primary);
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
      box-shadow: var(--pam-glow-primary, none);
      transition: background var(--pam-anim-fast, 150ms) ease;
    }

    .badge--zero {
      background: var(--ion-color-medium);
      box-shadow: none;
    }

    .badge--pop {
      animation: badge-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    @keyframes badge-pop {
      0%   { transform: scale(0.7); opacity: 0.5; }
      60%  { transform: scale(1.25); }
      100% { transform: scale(1); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreBadgeComponent implements OnChanges, OnDestroy {
  @Input() score = 0;
  popping = false;

  private popTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score'] && !changes['score'].firstChange) {
      this.triggerPop();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.popTimer) { clearTimeout(this.popTimer); }
  }

  private triggerPop(): void {
    if (this.popTimer) { clearTimeout(this.popTimer); }
    this.popping = false;
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      if (this.destroyed) { return; }
      this.popping = true;
      this.cdr.markForCheck();
      this.popTimer = setTimeout(() => {
        if (this.destroyed) { return; }
        this.popping = false;
        this.cdr.markForCheck();
      }, 500);
    });
  }
}

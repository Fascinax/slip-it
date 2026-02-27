import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent implements OnChanges, OnDestroy {
  /** Durée totale de la manche en minutes */
  @Input() durationMinutes = 20;
  /** Si false, le chronomètre ne démarre pas */
  @Input() active = true;

  remainingSeconds = 0;
  totalSeconds = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['durationMinutes'] || changes['active']) {
      this.reset();
      if (this.active) {
        this.start();
      }
    }
  }

  get progressPercent(): number {
    if (this.totalSeconds === 0) { return 100; }
    return Math.round((this.remainingSeconds / this.totalSeconds) * 100);
  }

  get displayTime(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get isUrgent(): boolean {
    return this.remainingSeconds <= 60 && this.remainingSeconds > 0;
  }

  get isExpired(): boolean {
    return this.remainingSeconds === 0;
  }

  private reset(): void {
    this.stop();
    this.totalSeconds = this.durationMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
  }

  private start(): void {
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.cdr.markForCheck();
      } else {
        this.stop();
      }
    }, 1000);
  }

  private stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

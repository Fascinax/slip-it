import {
  Component,
  Input,
  Output,
  EventEmitter,
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

  /** Émis une seule fois quand il reste ≤ 60 s */
  @Output() timerUrgent = new EventEmitter<void>();
  /** Émis quand le compte à rebours atteint 0 */
  @Output() timerExpired = new EventEmitter<void>();

  remainingSeconds = 0;
  totalSeconds = 0;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private urgentEmitted = false;
  private expiredEmitted = false;

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
    return this.remainingSeconds === 0 && this.totalSeconds > 0;
  }

  /** stroke-dashoffset pour l'arc SVG circulaire (circumférence ≈ 113.10) */
  get ringDashoffset(): number {
    const circumference = 2 * Math.PI * 18; // r=18
    if (this.totalSeconds === 0) { return 0; }
    return circumference * (1 - this.remainingSeconds / this.totalSeconds);
  }

  private reset(): void {
    this.stop();
    this.totalSeconds = this.durationMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.urgentEmitted = false;
    this.expiredEmitted = false;
  }

  private start(): void {
    this.intervalId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.cdr.markForCheck();
        if (this.isUrgent && !this.urgentEmitted) {
          this.urgentEmitted = true;
          this.timerUrgent.emit();
        }
      } else {
        this.stop();
        if (!this.expiredEmitted) {
          this.expiredEmitted = true;
          this.timerExpired.emit();
          this.cdr.markForCheck();
        }
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

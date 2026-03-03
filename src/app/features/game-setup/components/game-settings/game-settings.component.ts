import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { GameSettings } from '../../../../core/models/game-settings.model';
import { GameMode } from '../../../../core/models/enums';
import { DEFAULT_GAME_SETTINGS } from '../../../../core/models/game-settings.model';
import { WordService } from '../../../../core/services/word.service';

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('250ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class GameSettingsComponent implements OnInit, OnDestroy {
  @Input() settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };
  @Output() settingsChanged = new EventEmitter<GameSettings>();

  readonly GameMode = GameMode;
  form!: FormGroup;
  showAdvanced = false;

  /** v1.2 — liste dynamique des catégories disponibles */
  availableCategories: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(private wordService: WordService) {}

  ngOnInit(): void {
    this.availableCategories = this.wordService.getAvailableCategories();

    this.form = new FormGroup({
      mode: new FormControl<GameMode>(this.settings.mode, { nonNullable: true }),
      totalRounds: new FormControl<number>(this.settings.totalRounds, {
        nonNullable: true,
        validators: [Validators.min(1), Validators.max(10)],
      }),
      wordDifficulty: new FormControl<string>(this.settings.wordDifficulty, { nonNullable: true }),
      timerEnabled: new FormControl<boolean>(this.settings.timerEnabled ?? false, { nonNullable: true }),
      continuousMode: new FormControl<boolean>(this.settings.continuousMode ?? false, { nonNullable: true }),
      selectedCategories: new FormControl<string[]>(this.settings.selectedCategories ?? [], { nonNullable: true }),
      chainMode: new FormControl<boolean>(this.settings.chainMode ?? false, { nonNullable: true }),
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.settingsChanged.emit({ ...this.settings, ...this.form.getRawValue() });
    });
  }

  get isContinuousMode(): boolean {
    return this.form?.get('continuousMode')?.value === true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

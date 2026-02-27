import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GameSettings } from '../../../../core/models/game-settings.model';
import { GameMode } from '../../../../core/models/enums';
import { DEFAULT_GAME_SETTINGS } from '../../../../core/models/game-settings.model';

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSettingsComponent implements OnInit {
  @Input() settings: GameSettings = { ...DEFAULT_GAME_SETTINGS };
  @Output() settingsChanged = new EventEmitter<GameSettings>();

  readonly GameMode = GameMode;
  form!: FormGroup;

  ngOnInit(): void {
    this.form = new FormGroup({
      mode: new FormControl<GameMode>(this.settings.mode, { nonNullable: true }),
      totalRounds: new FormControl<number>(this.settings.totalRounds, {
        nonNullable: true,
        validators: [Validators.min(1), Validators.max(10)],
      }),
      wordDifficulty: new FormControl<string>(this.settings.wordDifficulty, { nonNullable: true }),
    });

    this.form.valueChanges.subscribe(() => {
      this.settingsChanged.emit({ ...this.settings, ...this.form.getRawValue() });
    });
  }
}

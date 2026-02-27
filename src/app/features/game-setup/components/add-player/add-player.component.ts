import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

interface AddPlayerForm {
  name: FormControl<string>;
  pin: FormControl<string>;
}

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlayerComponent implements OnInit {
  @Output() playerAdded = new EventEmitter<{ name: string; pin: string }>();

  form!: FormGroup<AddPlayerForm>;
  showPin = false;

  ngOnInit(): void {
    this.form = new FormGroup<AddPlayerForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
      }),
      pin: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(4), Validators.maxLength(6), Validators.pattern(/^\d+$/)],
      }),
    });
  }

  submit(): void {
    if (this.form.valid) {
      const { name, pin } = this.form.getRawValue();
      this.playerAdded.emit({ name, pin });
      this.form.reset();
    }
  }
}

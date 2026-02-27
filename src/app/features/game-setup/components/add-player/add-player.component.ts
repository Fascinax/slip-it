import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

interface AddPlayerForm {
  name: FormControl<string>;
}

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlayerComponent implements OnInit {
  @Output() playerAdded = new EventEmitter<string>();

  form!: FormGroup<AddPlayerForm>;

  ngOnInit(): void {
    this.form = new FormGroup<AddPlayerForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
      }),
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.playerAdded.emit(this.form.getRawValue().name);
      this.form.reset();
    }
  }
}

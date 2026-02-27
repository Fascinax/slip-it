import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-pin-input',
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PinInputComponent implements OnInit {
  @Input() label = 'PIN (4 chiffres)';
  @Input() playerName = '';
  /** Emits the entered PIN string when valid */
  @Output() pinSubmit = new EventEmitter<string>();

  pinControl!: FormControl<string>;
  showPin = false;

  ngOnInit(): void {
    this.pinControl = new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(6),
        Validators.pattern(/^\d+$/),
      ],
    });
  }

  submit(): void {
    if (this.pinControl.valid) {
      this.pinSubmit.emit(this.pinControl.value);
      this.pinControl.reset();
    }
  }
}

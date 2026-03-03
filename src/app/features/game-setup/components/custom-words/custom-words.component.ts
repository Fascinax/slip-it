import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-custom-words',
  templateUrl: './custom-words.component.html',
  styleUrls: ['./custom-words.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomWordsComponent {
  @Input() words: string[] = [];
  @Output() wordsChanged = new EventEmitter<string[]>();

  inputControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
  });

  constructor(private cdr: ChangeDetectorRef) {}

  addWord(): void {
    const raw = this.inputControl.value.trim();
    if (!raw || raw.length < 2) { return; }

    const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    if (!this.words.includes(normalized)) {
      const updated = [...this.words, normalized];
      this.wordsChanged.emit(updated);
    }
    this.inputControl.reset('');
    this.cdr.markForCheck();
  }

  removeWord(word: string): void {
    this.wordsChanged.emit(this.words.filter(w => w !== word));
    this.cdr.markForCheck();
  }

  trackByWord(_i: number, word: string): string {
    return word;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addWord();
    }
  }
}

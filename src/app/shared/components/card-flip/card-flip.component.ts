import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card-flip',
  templateUrl: './card-flip.component.html',
  styleUrls: ['./card-flip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFlipComponent {
  @Input() flipped = false;
  @Output() flipComplete = new EventEmitter<void>();

  onAnimationEnd(): void {
    if (this.flipped) {
      this.flipComplete.emit();
    }
  }
}

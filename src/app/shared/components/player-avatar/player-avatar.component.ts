import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-player-avatar',
  templateUrl: './player-avatar.component.html',
  styleUrls: ['./player-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAvatarComponent {
  @Input() name = '';
  @Input() color = '#457B9D';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() score: number | null = null;

  get initials(): string {
    return this.name
      .split(' ')
      .map(w => w[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

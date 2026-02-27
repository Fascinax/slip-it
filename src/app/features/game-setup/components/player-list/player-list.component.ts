import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Player } from '../../../../core/models';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListComponent {
  @Input() players: Player[] = [];
  @Output() playerRemoved = new EventEmitter<string>();

  trackById(_index: number, player: Player): string {
    return player.id;
  }
}

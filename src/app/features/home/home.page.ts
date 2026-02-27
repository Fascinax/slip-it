import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from '../../core/models';
import { GameStatus } from '../../core/models/enums';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  game$!: Observable<Game | null>;
  readonly GameStatus = GameStatus;

  constructor(
    private router: Router,
    private gameService: GameService,
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameService.game$;
  }

  newGame(): void {
    this.router.navigate(['/game-setup']);
  }

  resumeGame(): void {
    this.router.navigate(['/gameplay']);
  }
}

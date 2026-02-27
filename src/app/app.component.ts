import { Component, OnInit } from '@angular/core';
import { WordService } from './core/services/word.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {

  constructor(private wordService: WordService) {}

  ngOnInit(): void {
    // Pre-load word dictionary at app startup
    this.wordService.loadWords().subscribe();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { WordEntry, WordDifficulty } from '../models';

const WORDS_BASE = 'assets/words';

@Injectable({ providedIn: 'root' })
export class WordService {
  private _words$ = new BehaviorSubject<WordEntry[]>([]);

  readonly words$: Observable<WordEntry[]> = this._words$.asObservable();

  constructor(private http: HttpClient) {}

  /** Load all word files at startup */
  loadWords(): Observable<WordEntry[]> {
    const files = ['easy.json', 'medium.json', 'hard.json'];
    const requests = files.map(f =>
      this.http.get<WordEntry[]>(`${WORDS_BASE}/${f}`).pipe(
        catchError(() => of([] as WordEntry[]))
      )
    );

    // Sequential merge for simplicity (HttpClient is safe)
    return new Observable<WordEntry[]>(observer => {
      let allWords: WordEntry[] = [];
      let completed = 0;

      requests.forEach(req$ => {
        req$.subscribe({
          next: words => {
            allWords = allWords.concat(words);
            completed++;
            if (completed === requests.length) {
              this._words$.next(allWords);
              observer.next(allWords);
              observer.complete();
            }
          },
          error: err => observer.error(err),
        });
      });
    });
  }

  getByDifficulty(difficulty: WordDifficulty): Observable<WordEntry[]> {
    return this.words$.pipe(
      map(words => words.filter(w => w.difficulty === difficulty))
    );
  }

  /** v1.2 — Retourne la liste dédupliquée de toutes les catégories disponibles */
  getAvailableCategories(): string[] {
    const all = this._words$.value.map(w => w.category);
    return [...new Set(all)].sort((a, b) => a.localeCompare(b, 'fr'));
  }

  /** Pick N random words, optionally filtered by difficulty and/or categories.
   *  `customWords` (Phase 2) are always included in the pool regardless of filters. */
  pickRandom(
    count: number,
    difficulty?: WordDifficulty | 'MIXED',
    categories?: string[],
    customWords?: string[],
  ): WordEntry[] {
    let pool = difficulty && difficulty !== 'MIXED'
      ? this._words$.value.filter(w => w.difficulty === difficulty)
      : this._words$.value;

    if (categories && categories.length > 0) {
      pool = pool.filter(w => categories.includes(w.category));
    }

    // Inject custom words at HEAD of the pool with MIXED/custom metadata
    if (customWords && customWords.length > 0) {
      const custom: WordEntry[] = customWords
        .filter(w => w.trim().length > 0)
        .map(w => ({ word: w.trim(), category: 'Personnalisé', difficulty: 'EASY' as WordDifficulty }));
      pool = [...custom, ...pool];
    }

    if (pool.length === 0) { return []; }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

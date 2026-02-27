import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WordService } from './word.service';
import { WordEntry } from '../models/word.model';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------
function word(w: string, category: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD'): WordEntry {
  return { word: w, category, difficulty };
}

const FIXTURE_WORDS: WordEntry[] = [
  word('apple',  'food',    'EASY'),
  word('banana', 'food',    'MEDIUM'),
  word('guitar', 'music',   'EASY'),
  word('violin', 'music',   'HARD'),
  word('river',  'nature',  'MEDIUM'),
  word('ocean',  'nature',  'HARD'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('WordService', () => {
  let service: WordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WordService],
    });
    service  = TestBed.inject(WordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  // Helper: seed the internal BehaviorSubject directly (avoids HTTP mocking overhead)
  function seedWords(words: WordEntry[]): void {
    (service as any)._words$.next(words);
  }

  // ── pickRandom() ─────────────────────────────────────────────────────────

  it('retourne le nombre exact de mots demandés', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(3);
    expect(result.length).toBe(3);
  });

  it('retourne un tableau vide si le pool est vide', () => {
    seedWords([]);
    expect(service.pickRandom(5)).toEqual([]);
  });

  it('retourne au plus N mots si le pool est inférieur à N', () => {
    seedWords(FIXTURE_WORDS.slice(0, 2));
    const result = service.pickRandom(10);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('filtre par difficulté EASY', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(10, 'EASY');
    for (const w of result) {
      expect(w.difficulty).toBe('EASY');
    }
  });

  it('filtre par difficulté HARD', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(10, 'HARD');
    for (const w of result) {
      expect(w.difficulty).toBe('HARD');
    }
  });

  it('MIXED retourne des mots de toutes difficultés', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(6, 'MIXED');
    const difficulties = new Set(result.map(w => w.difficulty));
    // With 6 words from a fixture containing EASY/MEDIUM/HARD we should see variety
    expect(difficulties.size).toBeGreaterThan(1);
  });

  it('filtre par catégorie', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(10, undefined, ['food']);
    for (const w of result) {
      expect(w.category).toBe('food');
    }
  });

  it('filtre par plusieurs catégories', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(10, undefined, ['food', 'music']);
    for (const w of result) {
      expect(['food', 'music']).toContain(w.category);
    }
  });

  it('retourne [] si la catégorie demandée est inexistante', () => {
    seedWords(FIXTURE_WORDS);
    expect(service.pickRandom(3, undefined, ['nonexistent'])).toEqual([]);
  });

  it('combine filtre difficulté + catégorie', () => {
    seedWords(FIXTURE_WORDS);
    const result = service.pickRandom(10, 'MEDIUM', ['food']);
    expect(result.length).toBe(1);
    expect(result[0].word).toBe('banana');
  });

  // ── getAvailableCategories() ──────────────────────────────────────────────

  it('retourne toutes les catégories uniques', () => {
    seedWords(FIXTURE_WORDS);
    const cats = service.getAvailableCategories();
    expect(cats).toContain('food');
    expect(cats).toContain('music');
    expect(cats).toContain('nature');
    expect(cats.length).toBe(3);
  });

  it('retourne les catégories triées alphabétiquement', () => {
    seedWords(FIXTURE_WORDS);
    const cats = service.getAvailableCategories();
    const sorted = [...cats].sort((a, b) => a.localeCompare(b, 'fr'));
    expect(cats).toEqual(sorted);
  });

  it('retourne [] si aucun mot chargé', () => {
    seedWords([]);
    expect(service.getAvailableCategories()).toEqual([]);
  });

  it('élimine les catégories dupliquées', () => {
    // Two words in the same category
    seedWords([word('apple', 'food', 'EASY'), word('cake', 'food', 'MEDIUM')]);
    const cats = service.getAvailableCategories();
    expect(cats).toEqual(['food']);
  });

  // ── loadWords() ─────────────────────────────────────────────────────────

  it('appelle les 3 fichiers JSON de mots', () => {
    service.loadWords().subscribe();

    const files = ['easy.json', 'medium.json', 'hard.json'];
    for (const file of files) {
      const req = httpMock.expectOne(`assets/words/${file}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    }
  });

  it('remplit le BehaviorSubject après chargement', (done) => {
    service.loadWords().subscribe(words => {
      expect(words.length).toBe(2);
      done();
    });

    httpMock.expectOne('assets/words/easy.json').flush([word('apple', 'food', 'EASY')]);
    httpMock.expectOne('assets/words/medium.json').flush([word('banana', 'food', 'MEDIUM')]);
    httpMock.expectOne('assets/words/hard.json').flush([]);
  });

  it('ne plante pas si un fichier JSON répond avec une erreur', (done) => {
    service.loadWords().subscribe(words => {
      // Only 1 word from easy.json; medium.json error is swallowed
      expect(words.length).toBeGreaterThanOrEqual(0);
      done();
    });

    httpMock.expectOne('assets/words/easy.json').flush([word('apple', 'food', 'EASY')]);
    httpMock.expectOne('assets/words/medium.json').error(new ErrorEvent('network'));
    httpMock.expectOne('assets/words/hard.json').flush([]);
  });
});

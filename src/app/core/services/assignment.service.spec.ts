import { AssignmentService } from './assignment.service';
import { Player } from '../models/player.model';
import { WordEntry } from '../models/word.model';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${i}`,
    avatarColor: '#ffffff',
    score: 0,
  }));
}

function makeWords(count: number): WordEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    word: `word-${i}`,
    category: 'test',
    difficulty: 'EASY' as const,
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(() => {
    service = new AssignmentService();
  });

  // ── generate(): valid cases ─────────────────────────────────────────────

  it('retourne autant d\'assignements que de joueurs', () => {
    const players = makePlayers(4);
    const words = makeWords(10);
    const results = service.generate(players, words, 1);
    expect(results.length).toBe(4);
  });

  it('chaque assignment appartient à un joueur existant', () => {
    const players = makePlayers(3);
    const words = makeWords(5);
    const results = service.generate(players, words, 1);
    const playerIds = new Set(players.map(p => p.id));
    for (const a of results) {
      expect(playerIds.has(a.playerId)).toBeTrue();
    }
  });

  it('aucun joueur n\'est sa propre cible (pas d\'auto-assignation)', () => {
    // Run many times to cover random shuffles
    const players = makePlayers(4);
    const words = makeWords(10);
    for (let i = 0; i < 50; i++) {
      const results = service.generate(players, words, 1);
      for (const a of results) {
        expect(a.playerId).not.toBe(a.targetPlayerId);
      }
    }
  });

  it('le numéro de manche est propagé dans chaque assignement', () => {
    const players = makePlayers(3);
    const words = makeWords(5);
    const results = service.generate(players, words, 3);
    for (const a of results) {
      expect(a.round).toBe(3);
    }
  });

  it('tous les mots secrets sont distincts', () => {
    const players = makePlayers(4);
    const words = makeWords(10);
    const results = service.generate(players, words, 1);
    const secretWords = results.map(a => a.secretWord);
    const unique = new Set(secretWords);
    expect(unique.size).toBe(players.length);
  });

  it('tous les résultats ont revealed = false', () => {
    const players = makePlayers(3);
    const words = makeWords(5);
    const results = service.generate(players, words, 1);
    for (const a of results) {
      expect(a.revealed).toBeFalse();
    }
  });

  // ── generate(): error cases ──────────────────────────────────────────────

  it('lance une erreur avec moins de 2 joueurs', () => {
    const players = makePlayers(1);
    const words = makeWords(5);
    expect(() => service.generate(players, words, 1)).toThrowError(
      /minimum 2 joueurs/i,
    );
  });

  it('lance une erreur si les mots sont insuffisants', () => {
    const players = makePlayers(4);
    const words = makeWords(3); // fewer than players
    expect(() => service.generate(players, words, 1)).toThrowError(
      /pas assez de mots/i,
    );
  });

  it('fonctionne pour exactement 2 joueurs (cas limite inférieur)', () => {
    const players = makePlayers(2);
    const words = makeWords(2);
    expect(() => service.generate(players, words, 1)).not.toThrow();
    const results = service.generate(players, words, 1);
    expect(results.length).toBe(2);
  });
});

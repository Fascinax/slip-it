import { ScoreService } from './score.service';
import { Player } from '../models/player.model';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------
function makePlayer(id: string, name: string, score: number): Player {
  return { id, name, score, avatarColor: '#ffffff' };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    service = new ScoreService();
  });

  // ── getRanking() ────────────────────────────────────────────────────────

  it('trie les joueurs par score décroissant', () => {
    const players = [
      makePlayer('a', 'Alice', 2),
      makePlayer('b', 'Bob', 5),
      makePlayer('c', 'Charlie', 1),
    ];
    const ranking = service.getRanking(players);
    expect(ranking.map(e => e.player.name)).toEqual(['Bob', 'Alice', 'Charlie']);
  });

  it('le rang commence à 1', () => {
    const players = [makePlayer('a', 'Alice', 3), makePlayer('b', 'Bob', 1)];
    const ranking = service.getRanking(players);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(2);
  });

  it('retourne un tableau vide si aucun joueur', () => {
    expect(service.getRanking([])).toEqual([]);
  });

  it('ne mute pas le tableau original', () => {
    const players = [makePlayer('a', 'Alice', 3), makePlayer('b', 'Bob', 7)];
    const original = [...players];
    service.getRanking(players);
    expect(players[0].name).toBe(original[0].name);
  });

  it('gère un seul joueur', () => {
    const players = [makePlayer('a', 'Alice', 10)];
    const ranking = service.getRanking(players);
    expect(ranking.length).toBe(1);
    expect(ranking[0].rank).toBe(1);
  });

  it('attribue des rangs croissants consécutifs', () => {
    const players = [
      makePlayer('a', 'Alice', 4),
      makePlayer('b', 'Bob', 2),
      makePlayer('c', 'Charlie', 6),
      makePlayer('d', 'Dave', 1),
    ];
    const ranking = service.getRanking(players);
    expect(ranking.map(e => e.rank)).toEqual([1, 2, 3, 4]);
  });

  // ── getTopPlayer() ───────────────────────────────────────────────────────

  it('retourne le joueur avec le score le plus élevé', () => {
    const players = [
      makePlayer('a', 'Alice', 3),
      makePlayer('b', 'Bob', 8),
      makePlayer('c', 'Charlie', 5),
    ];
    expect(service.getTopPlayer(players)?.name).toBe('Bob');
  });

  it('retourne null quand le tableau est vide', () => {
    expect(service.getTopPlayer([])).toBeNull();
  });

  it('retourne le seul joueur si un seul joueur', () => {
    const players = [makePlayer('a', 'Alice', 0)];
    expect(service.getTopPlayer(players)?.name).toBe('Alice');
  });

  it('ne mute pas le tableau original', () => {
    const players = [makePlayer('a', 'Alice', 5), makePlayer('b', 'Bob', 2)];
    service.getTopPlayer(players);
    expect(players[0].name).toBe('Alice');
  });
});

import { PlayerService } from './player.service';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    service = new PlayerService();
  });

  // ── players getter ───────────────────────────────────────────────────────

  it('retourne une liste vide à la création', () => {
    expect(service.players).toEqual([]);
  });

  // ── addPlayer() ─────────────────────────────────────────────────────────

  it('ajoute un joueur avec le nom fourni', () => {
    const player = service.addPlayer('Alice');
    expect(player.name).toBe('Alice');
    expect(service.players.length).toBe(1);
  });

  it('génère un identifiant unique (uuid) pour chaque joueur', () => {
    const a = service.addPlayer('Alice');
    const b = service.addPlayer('Bob');
    expect(a.id).not.toBe(b.id);
    expect(a.id.length).toBeGreaterThan(0);
  });

  it('initialise le score à 0', () => {
    const player = service.addPlayer('Alice');
    expect(player.score).toBe(0);
  });

  it('assigne une couleur d\'avatar', () => {
    const player = service.addPlayer('Alice');
    expect(player.avatarColor).toBeTruthy();
  });

  it('rogne les espaces en début/fin de nom', () => {
    const player = service.addPlayer('  Bob  ');
    expect(player.name).toBe('Bob');
  });

  it('rejette un nom dupliqué (même casse)', () => {
    service.addPlayer('Alice');
    expect(() => service.addPlayer('Alice')).toThrowError(/Alice/);
  });

  it('rejette un nom dupliqué (casse différente)', () => {
    service.addPlayer('Alice');
    expect(() => service.addPlayer('alice')).toThrowError();
  });

  it('permet des noms différents', () => {
    service.addPlayer('Alice');
    service.addPlayer('Bob');
    expect(service.players.length).toBe(2);
  });

  // ── removePlayer() ───────────────────────────────────────────────────────

  it('supprime un joueur par son identifiant', () => {
    const player = service.addPlayer('Alice');
    service.removePlayer(player.id);
    expect(service.players.length).toBe(0);
  });

  it('ne supprime pas les autres joueurs', () => {
    service.addPlayer('Alice');
    const bob = service.addPlayer('Bob');
    service.removePlayer(bob.id);
    expect(service.players.length).toBe(1);
    expect(service.players[0].name).toBe('Alice');
  });

  it('ne plante pas si l\'id est inexistant', () => {
    service.addPlayer('Alice');
    expect(() => service.removePlayer('unknown-id')).not.toThrow();
    expect(service.players.length).toBe(1);
  });

  // ── addScore() ───────────────────────────────────────────────────────────

  it('incrémente le score du bon joueur', () => {
    const alice = service.addPlayer('Alice');
    service.addPlayer('Bob');
    service.addScore(alice.id, 1);
    expect(service.players.find(p => p.id === alice.id)!.score).toBe(1);
    expect(service.players.find(p => p.name === 'Bob')!.score).toBe(0);
  });

  it('valeur par défaut de addScore est 1', () => {
    const alice = service.addPlayer('Alice');
    service.addScore(alice.id);
    expect(service.players.find(p => p.id === alice.id)!.score).toBe(1);
  });

  it('cumule les appels successifs', () => {
    const alice = service.addPlayer('Alice');
    service.addScore(alice.id, 2);
    service.addScore(alice.id, 3);
    expect(service.players.find(p => p.id === alice.id)!.score).toBe(5);
  });

  // ── resetScores() ────────────────────────────────────────────────────────

  it('remet tous les scores à 0', () => {
    const alice = service.addPlayer('Alice');
    const bob   = service.addPlayer('Bob');
    service.addScore(alice.id, 3);
    service.addScore(bob.id,   2);
    service.resetScores();
    for (const p of service.players) {
      expect(p.score).toBe(0);
    }
  });

  // ── setPlayers() ─────────────────────────────────────────────────────────

  it('remplace la liste de joueurs', () => {
    service.addPlayer('Alice');
    const newPlayers = [
      { id: 'x1', name: 'Xavier', avatarColor: '#f00', score: 0 },
      { id: 'x2', name: 'Yara',   avatarColor: '#0f0', score: 5 },
    ];
    service.setPlayers(newPlayers);
    expect(service.players.length).toBe(2);
    expect(service.players[0].name).toBe('Xavier');
  });
});

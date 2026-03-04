import { test, expect } from '../fixtures/base.fixture';

test.describe('Gestion des joueurs (/game-setup) — limites', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('ajouter 10 joueurs atteint la limite maximale', async ({ gameSetupPage }) => {
    const names = Array.from({ length: 10 }, (_, i) => `Joueur${i + 1}`);
    for (const name of names) {
      await gameSetupPage.addPlayer(name);
    }
    await expect(gameSetupPage.playerCountBadge).toContainText('10');
  });

  test('le formulaire d\'ajout disparaît à 10 joueurs', async ({ gameSetupPage }) => {
    const names = Array.from({ length: 10 }, (_, i) => `Joueur${i + 1}`);
    for (const name of names) {
      await gameSetupPage.addPlayer(name);
    }
    await expect(gameSetupPage.addPlayerComponent).not.toBeVisible();
  });

  test('un nom d\'un seul caractère laisse le bouton "Ajouter" désactivé', async ({ page, gameSetupPage }) => {
    await gameSetupPage.fillIonInput('[data-testid="input-player-name"]', 'A');
    await page.waitForTimeout(200);
    await expect(gameSetupPage.btnAddPlayer).toHaveAttribute('disabled');
    await expect(gameSetupPage.playerCountBadge).toContainText('0');
  });
});

test.describe('Gestion des joueurs (/game-setup) — suppression', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('supprimer un joueur met à jour le compteur', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await expect(gameSetupPage.playerCountBadge).toContainText('2');

    await gameSetupPage.removePlayer('Alice');
    await page.waitForTimeout(300);

    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('supprimer un joueur puis le re-ajouter fonctionne', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');

    await gameSetupPage.removePlayer('Alice');
    await page.waitForTimeout(300);
    await expect(gameSetupPage.playerCountBadge).toContainText('0');

    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('le bouton démarrer se désactive après suppression sous 3 joueurs', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await gameSetupPage.addPlayer('Charlie');
    await expect(gameSetupPage.btnStartGame).not.toHaveAttribute('disabled');

    await gameSetupPage.removePlayer('Charlie');
    await page.waitForTimeout(300);

    await expect(gameSetupPage.btnStartGame).toHaveAttribute('disabled');
  });
});

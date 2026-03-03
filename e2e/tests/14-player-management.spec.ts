import { test, expect } from '../fixtures/base.fixture';

// --------------------------------------------------------------------------
// Gestion des joueurs — limites et suppression
// --------------------------------------------------------------------------
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

  test('le formulaire d\'ajout disparaît à 10 joueurs', async ({ page, gameSetupPage }) => {
    const names = Array.from({ length: 10 }, (_, i) => `Joueur${i + 1}`);
    for (const name of names) {
      await gameSetupPage.addPlayer(name);
    }
    // Le composant d'ajout est caché
    await expect(page.locator('app-add-player')).not.toBeVisible();
  });

  test('un nom d\'un seul caractère laisse le bouton "Ajouter" désactivé', async ({ page, gameSetupPage }) => {
    // Remplir le champ avec un seul caractère
    await gameSetupPage.fillIonInput('[data-testid="input-player-name"]', 'A');
    await page.waitForTimeout(200);
    // Le bouton "Ajouter" reste désactivé (validation minLength(2))
    await expect(gameSetupPage.btnAddPlayer).toHaveAttribute('disabled');
    await expect(gameSetupPage.playerCountBadge).toContainText('0');
  });
});

// --------------------------------------------------------------------------
// Suppression de joueurs
// --------------------------------------------------------------------------
test.describe('Gestion des joueurs (/game-setup) — suppression', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('supprimer un joueur met à jour le compteur', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await expect(gameSetupPage.playerCountBadge).toContainText('2');

    // Cliquer sur le bouton de suppression du premier joueur (Alice)
    const removeBtn = page
      .locator('app-player-list ion-item')
      .filter({ hasText: 'Alice' })
      .locator('ion-button[color="danger"]');
    await removeBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('supprimer un joueur puis le re-ajouter fonctionne', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');

    // Supprimer Alice
    const removeBtn = page
      .locator('app-player-list ion-item')
      .filter({ hasText: 'Alice' })
      .locator('ion-button[color="danger"]');
    await removeBtn.dispatchEvent('click');
    await page.waitForTimeout(300);
    await expect(gameSetupPage.playerCountBadge).toContainText('0');

    // Re-ajouter Alice
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('le bouton démarrer se désactive après suppression sous 3 joueurs', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await gameSetupPage.addPlayer('Charlie');
    await expect(gameSetupPage.btnStartGame).not.toHaveAttribute('disabled');

    // Supprimer Charlie → retour à 2 joueurs
    const removeBtn = page
      .locator('app-player-list ion-item')
      .filter({ hasText: 'Charlie' })
      .locator('ion-button[color="danger"]');
    await removeBtn.dispatchEvent('click');
    await page.waitForTimeout(300);

    await expect(gameSetupPage.btnStartGame).toHaveAttribute('disabled');
  });
});

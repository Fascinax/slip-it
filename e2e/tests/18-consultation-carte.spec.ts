import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Consultation de carte pendant le gameplay
// --------------------------------------------------------------------------
test.describe('Consultation de carte (/gameplay)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('le bouton "Ma carte" est désactivé après consultation et fermeture', async ({ page, gameplayPage }) => {
    // Consulter la carte d'Alice
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);

    // Le bouton "Ma carte" d'Alice doit être désactivé
    const myCardBtn = gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name);
    await expect(myCardBtn).toHaveClass(/button-disabled/, { timeout: 5_000 });
  });

  test('la carte révélée affiche la cible et le mot non vides', async ({ page, gameplayPage }) => {
    const { target, word } = await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);
    expect(target.trim().length).toBeGreaterThan(0);
    expect(word.trim().length).toBeGreaterThan(0);
  });

  test('la cible n\'est jamais le joueur lui-même', async ({ page, gameplayPage }) => {
    const { target } = await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);
    expect(target.trim()).not.toBe(DEFAULT_PLAYERS[0].name);
  });

  test('fermer la carte puis déclarer un piège fonctionne', async ({ page, gameplayPage }) => {
    // Consulter puis fermer la carte d'Alice
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);

    // Déclarer un piège pour Alice
    await gameplayPage.declareTrap(DEFAULT_PLAYERS[0].name);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });

    // La modale est bien ouverte
    await expect(modal).toContainText(DEFAULT_PLAYERS[0].name);
    // Valider le piège
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    // Le score est bien mis à jour
    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('les autres joueurs conservent leur bouton "Ma carte" actif', async ({ page, gameplayPage }) => {
    // Alice consulte sa carte
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);

    // Les boutons de Bob et Charlie sont toujours actifs
    const bobBtn = gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[1].name);
    const charlieBtn = gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[2].name);
    await expect(bobBtn).not.toHaveClass(/button-disabled/);
    await expect(charlieBtn).not.toHaveClass(/button-disabled/);
  });

  test('ouvrir la section "Passage de téléphone" puis annuler', async ({ page, gameplayPage }) => {
    // Cliquer "Ma carte" pour Alice — affiche le passage de téléphone
    await gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name).click();
    await expect(page.locator('.pass-phone-card')).toBeVisible({ timeout: 5_000 });

    // Cliquer "Annuler"
    await page.locator('.pass-phone-card').getByText('Annuler').click();
    await page.waitForTimeout(300);

    // La section de passage est fermée
    await expect(page.locator('.pass-phone-card')).not.toBeVisible();

    // Le bouton "Ma carte" d'Alice reste actif (pas consommé)
    const aliceBtn = gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name);
    await expect(aliceBtn).not.toHaveClass(/button-disabled/);
  });
});

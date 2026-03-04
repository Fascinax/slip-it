import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

test.describe('Consultation de carte (/gameplay)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('le bouton "Ma carte" est désactivé après consultation et fermeture', async ({ gameplayPage }) => {
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).toHaveClass(/button-disabled/, { timeout: 5_000 });
  });

  test('la carte révélée affiche la cible et le mot non vides', async ({ gameplayPage }) => {
    const { target, word } = await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);
    expect(target.trim().length).toBeGreaterThan(0);
    expect(word.trim().length).toBeGreaterThan(0);
  });

  test('la cible n\'est jamais le joueur lui-même', async ({ gameplayPage }) => {
    const { target } = await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);
    expect(target.trim()).not.toBe(DEFAULT_PLAYERS[0].name);
  });

  test('fermer la carte puis déclarer un piège fonctionne', async ({ gameplayPage }) => {
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);

    await gameplayPage.declareTrap(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'visible', timeout: 5_000 });

    await expect(gameplayPage.ionModal).toContainText(DEFAULT_PLAYERS[0].name);
    await gameplayPage.confirmTrapModal();

    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
  });

  test('les autres joueurs conservent leur bouton "Ma carte" actif', async ({ gameplayPage }) => {
    await gameplayPage.viewMyCard(DEFAULT_PLAYERS[0].name);

    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[1].name)).not.toHaveClass(/button-disabled/);
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[2].name)).not.toHaveClass(/button-disabled/);
  });

  test('ouvrir la section "Passage de téléphone" puis annuler', async ({ page, gameplayPage }) => {
    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await expect(gameplayPage.passPhoneCard).toBeVisible({ timeout: 5_000 });

    await gameplayPage.cancelPassPhone();
    await page.waitForTimeout(300);

    await expect(gameplayPage.passPhoneCard).not.toBeVisible();
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).not.toHaveClass(/button-disabled/);
  });
});

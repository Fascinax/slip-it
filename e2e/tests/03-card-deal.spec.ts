import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, setupGame } from '../helpers/game.helper';

test.describe('Distribution des cartes (/card-deal)', () => {
  test.beforeEach(async ({ page }) => {
    await setupGame(page, DEFAULT_PLAYERS);
  });

  // ── État initial (WAITING) ──────────────────────────────────────────

  test('affiche le bouton "Voir ma carte" pour le premier joueur', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-im-ready"]')).toBeVisible();
  });

  test('affiche le nom du premier joueur (Alice)', async ({ page }) => {
    await expect(page.locator('.deal-invite__name')).toContainText('Alice');
  });

  // ── Carte face cachée après "Voir ma carte" ────────────────────────

  test('la carte est face cachée après clic sur "Voir ma carte"', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();

    await expect(cardDealPage.cardFlip).toBeVisible();
    await expect(cardDealPage.cardScene).not.toHaveClass(/card--flipped/);
  });

  test('le bouton confirmer est caché avant le retournement', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();

    await expect(cardDealPage.btnConfirmCard).not.toBeVisible();
  });

  test('le contenu secret est masqué par backface-visibility avant le retournement', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();

    // The card back face is in the DOM but hidden by CSS 3D backface-visibility.
    // Playwright can't detect backface-visibility, so we verify the card is NOT flipped.
    await expect(cardDealPage.cardScene).not.toHaveClass(/card--flipped/);

    // And the confirm button (gated by *ngIf="flipped") is truly absent
    await expect(cardDealPage.btnConfirmCard).not.toBeVisible();
  });

  // ── Retournement de la carte ────────────────────────────────────────

  test('cliquer la carte la retourne et affiche la cible et le mot', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();
    await cardDealPage.flipCard();

    await expect(cardDealPage.cardScene).toHaveClass(/card--flipped/);
    await expect(cardDealPage.cardTarget).toBeVisible();
    await expect(cardDealPage.cardWord).toBeVisible();
  });

  test('le mot secret et la cible ne sont pas vides après flip', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();
    await cardDealPage.flipCard();

    const word = await cardDealPage.cardWord.innerText();
    const target = await cardDealPage.cardTarget.innerText();
    expect(word.trim().length).toBeGreaterThan(0);
    expect(target.trim().length).toBeGreaterThan(0);
  });

  test('le bouton confirmer apparaît seulement après le retournement', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();

    await expect(cardDealPage.btnConfirmCard).not.toBeVisible();

    await cardDealPage.flipCard();

    await expect(cardDealPage.btnConfirmCard).toBeVisible();
  });

  // ── Accessibilité clavier ───────────────────────────────────────────

  test('la touche Enter retourne la carte', async ({ cardDealPage }) => {
    await cardDealPage.clickShowCard();

    await cardDealPage.cardFlip.focus();
    await cardDealPage.cardFlip.press('Enter');
    await cardDealPage.page.waitForTimeout(800);

    await expect(cardDealPage.cardScene).toHaveClass(/card--flipped/);
    await expect(cardDealPage.cardWord).toBeVisible();
  });

  // ── Flux complet ────────────────────────────────────────────────────

  test('distribue les cartes aux 3 joueurs puis navigue vers /gameplay', async ({ page, cardDealPage }) => {
    for (const _player of DEFAULT_PLAYERS) {
      await cardDealPage.dealCardForPlayer();
    }
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  test('chaque joueur reçoit une cible différente de lui-même', async ({ cardDealPage }) => {
    for (const player of DEFAULT_PLAYERS) {
      const { target } = await cardDealPage.dealCardForPlayer();
      expect(target).not.toBe(player.name);
    }
  });
});

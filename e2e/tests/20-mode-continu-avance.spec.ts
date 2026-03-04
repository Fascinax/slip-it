import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

test.describe('Mode continu avancé — cycles multiples', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async p => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-continuous-mode');
    });
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  test('piège → nouvelle carte → second piège → score à 2', async ({ page, gameplayPage }) => {
    const playerName = DEFAULT_PLAYERS[0].name;

    await gameplayPage.validateTrapFor(playerName);
    await gameplayPage.distributeNewCardViaAlert();

    await expect(gameplayPage.declareTrapButtonFor(playerName)).not.toHaveClass(/button-disabled/, { timeout: 5_000 });

    await gameplayPage.validateTrapFor(playerName);
    await page.waitForTimeout(400);

    await expect(gameplayPage.scoreBadgeFor(playerName)).toContainText('2', { timeout: 5_000 });
  });

  test('deux joueurs piègent en alternance — scores incrémentés correctement', async ({ gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.distributeNewCardViaAlert();

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[1].name);
    await gameplayPage.distributeNewCardViaAlert();

    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[1].name)).toContainText('1', { timeout: 5_000 });
  });

  test('terminer immédiatement sans piège affiche un podium à scores nuls', async ({ page, gameplayPage, gameEndPage }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });

    const badges = await gameEndPage.podiumScoreBadges.allInnerTexts();
    for (const badge of badges) {
      expect(badge).toMatch(/0/);
    }
  });

  test('la cible de chaque nouvelle carte n\'est jamais le piégeur', async ({ gameplayPage }) => {
    const playerName = DEFAULT_PLAYERS[0].name;

    await gameplayPage.validateTrapFor(playerName);
    await gameplayPage.distributeNewCardViaAlert();

    await gameplayPage.openPassPhoneFor(playerName);
    await gameplayPage.revealCard();

    const cardTarget = await gameplayPage.cardTarget.last().innerText();
    expect(cardTarget.trim()).not.toBe(playerName);

    await gameplayPage.closeCard();
  });

  test('la nouvelle carte a un mot secret différent de l\'ancien', async ({ gameplayPage }) => {
    const playerName = DEFAULT_PLAYERS[0].name;

    await gameplayPage.openPassPhoneFor(playerName);
    await gameplayPage.revealCard();
    await gameplayPage.cardWord.last().waitFor({ state: 'visible', timeout: 5_000 });
    const firstWord = (await gameplayPage.cardWord.last().innerText()).trim();
    await gameplayPage.closeCard();
    await gameplayPage.btnCloseCard.waitFor({ state: 'hidden', timeout: 3_000 });

    await gameplayPage.validateTrapFor(playerName);
    await gameplayPage.distributeNewCardViaAlert();

    await gameplayPage.openPassPhoneFor(playerName);
    await gameplayPage.revealCard();
    await gameplayPage.cardWord.last().waitFor({ state: 'visible', timeout: 5_000 });
    const secondWord = (await gameplayPage.cardWord.last().innerText()).trim();

    expect(secondWord).not.toBe(firstWord);
  });
});

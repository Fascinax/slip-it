import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';
import { GameplayPage } from '../pages/gameplay.page';
import { CardDealPage } from '../pages/card-deal.page';
import { ScoreboardPage } from '../pages/scoreboard.page';

async function proceedToRound2(page: import('@playwright/test').Page): Promise<void> {
  const gp = new GameplayPage(page);
  await gp.nextRound();

  const sb = new ScoreboardPage(page);
  await sb.dealNextRound();
  await page.waitForURL(/card-deal/, { timeout: 10_000 });

  const deal = new CardDealPage(page);
  for (const _ of DEFAULT_PLAYERS) {
    await deal.dealCardForPlayer();
  }
  await page.waitForURL(/gameplay/, { timeout: 10_000 });
}

test.describe('Flux multi-manche — mode normal (R1 → R2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('après card-deal R2 on atterrit sur /gameplay', async ({ page }) => {
    await proceedToRound2(page);
    await expect(page).toHaveURL(/gameplay/);
  });

  test('le titre de la page indique "Manche 2" en round 2', async ({ page, gameplayPage }) => {
    await proceedToRound2(page);
    await expect(gameplayPage.title).toContainText('Manche 2', { timeout: 5_000 });
  });

  test('btn-my-card est ré-activé en manche 2 après avoir été consulté en manche 1', async ({ page, gameplayPage }) => {
    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.revealCard();
    await gameplayPage.closeCard();
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).toHaveAttribute('aria-disabled', 'true');

    await proceedToRound2(page);

    const gp2 = new GameplayPage(page);
    await expect(
      gp2.myCardButtonFor(DEFAULT_PLAYERS[0].name),
    ).not.toHaveAttribute('aria-disabled', { timeout: 5_000 });
  });

  test('le score d\'un joueur est préservé entre les manches', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToRound2(page);

    const gp2 = new GameplayPage(page);
    await expect(gp2.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
  });
});

test.describe('Dernière manche (totalRounds = 1) → /game-end direct', () => {
  test('"Manche suivante" sur la dernière manche navigue vers /game-end, pas /scoreboard', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.setIonSelectValue('Nombre de manches', '1');
    });

    await gameplayPage.btnNextRound.dispatchEvent('click');
    await gameplayPage.ionAlert.waitFor({ state: 'visible', timeout: 5_000 });
    await gameplayPage.ionAlert.getByRole('button', { name: 'Suivant' }).click();

    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/scoreboard/);
  });
});

test.describe('Mode continu — invariant cible nouvelle carte', () => {
  test('la cible de la nouvelle carte distribuée n\'est jamais le piégeur lui-même', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-continuous-mode');
    });

    const trapperName = DEFAULT_PLAYERS[0].name;

    await gameplayPage.validateTrapFor(trapperName);
    await gameplayPage.distributeNewCardViaAlert();

    await gameplayPage.openPassPhoneFor(trapperName);
    await gameplayPage.revealCard();

    await expect(gameplayPage.cardTarget).toBeVisible({ timeout: 5_000 });
    const targetName = await gameplayPage.cardTarget.innerText();
    expect(targetName.trim()).not.toBe(trapperName);
  });
});

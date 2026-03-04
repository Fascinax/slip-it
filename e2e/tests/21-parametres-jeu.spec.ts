import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

test.describe('Paramètres de jeu — impact gameplay', () => {

  test('changer la difficulté en EASY lance une partie valide', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.setIonSelectValue('Difficulté des mots', 'EASY');
    });
    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.rankingCard).toBeVisible({ timeout: 5_000 });
  });

  test('changer la difficulté en HARD lance une partie valide', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.setIonSelectValue('Difficulté des mots', 'HARD');
    });
    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.rankingCard).toBeVisible({ timeout: 5_000 });
  });

  test('configurer 5 manches affiche "Manche 1/5" dans le titre', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.setIonSelectValue('Nombre de manches', '5');
    });
    await expect(gameplayPage.title).toContainText('Manche 1/5', { timeout: 5_000 });
  });

  test('configurer 1 manche affiche "Manche 1/1" dans le titre', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.setIonSelectValue('Nombre de manches', '1');
    });
    await expect(gameplayPage.title).toContainText('Manche 1/1', { timeout: 5_000 });
  });

  test('le mode de jeu DRINK ne bloque pas le déroulement complet', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, {
      beforeStart: async (p) => {
        const setup = new GameSetupPage(p);
        await setup.setIonSelectValue('Mode de jeu', 'DRINK');
      },
    });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.podiumHeader).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Mode chaîne — cibles en ordre fixe', () => {

  test('en mode chaîne, chaque joueur piège le suivant dans l\'ordre d\'inscription', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-chain-mode');
    });

    const targets: string[] = [];
    for (const player of DEFAULT_PLAYERS) {
      const { target } = await gameplayPage.viewMyCard(player.name);
      targets.push(target.trim());
    }

    expect(targets[0]).toBe('Bob');
    expect(targets[1]).toBe('Charlie');
    expect(targets[2]).toBe('Alice');
  });
});

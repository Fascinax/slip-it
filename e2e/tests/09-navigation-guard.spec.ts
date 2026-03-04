import { test, expect } from '../fixtures/base.fixture';

test.describe('Accès direct aux pages sans partie active — sad paths (navigation guard)', () => {
  test('accès /gameplay sans partie — aucun bouton "Ma carte" affiché', async ({ gameplayPage }) => {
    await gameplayPage.goto();
    await expect(gameplayPage.allMyCardButtons).toHaveCount(0);
  });

  test('accès /gameplay sans partie — aucun bouton "Piégé !" affiché', async ({ gameplayPage }) => {
    await gameplayPage.goto();
    await expect(gameplayPage.allDeclareTrapButtons).toHaveCount(0);
  });

  test('accès /gameplay sans partie — la page ne plante pas', async ({ page, gameplayPage }) => {
    await gameplayPage.goto();
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /scoreboard sans partie — classement vide', async ({ scoreboardPage }) => {
    await scoreboardPage.goto();
    await expect(scoreboardPage.entries).toHaveCount(0);
  });

  test('accès /scoreboard sans partie — la page ne plante pas', async ({ page, scoreboardPage }) => {
    await scoreboardPage.goto();
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /game-end sans partie — la page ne plante pas', async ({ page, gameEndPage }) => {
    await gameEndPage.goto();
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /game-end sans partie — aucun nom de vainqueur affiché', async ({ gameEndPage }) => {
    await gameEndPage.goto();
    const count = await gameEndPage.winnerName.count();
    if (count > 0) {
      const text = await gameEndPage.winnerName.innerText().catch(() => '');
      expect(text.trim()).toBe('');
    }
  });

  test('accès /card-deal sans partie — la page ne plante pas', async ({ page, cardDealPage }) => {
    await cardDealPage.goto();
    await expect(page).not.toHaveURL(/error/);
  });
});

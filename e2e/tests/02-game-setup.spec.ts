import { test, expect } from '../fixtures/base.fixture';

test.describe('Configuration de la partie (/game-setup)', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('affiche le titre "Nouvelle partie"', async ({ gameSetupPage }) => {
    await expect(gameSetupPage.title).toContainText('Nouvelle partie');
  });

  test('le bouton "Distribuer les cartes" est désactivé sans joueurs', async ({ gameSetupPage }) => {
    // ion-button shadow DOM means toBeDisabled() doesn't work — check host attribute
    await expect(gameSetupPage.btnStartGame).toHaveAttribute('disabled');
  });

  test('affiche l\'avertissement "Minimum 3 joueurs requis"', async ({ gameSetupPage }) => {
    await expect(gameSetupPage.warningText).toBeVisible();
  });

  test('peut ajouter un joueur — le compteur passe à 1', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('le bouton reste désactivé avec seulement 2 joueurs', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await expect(gameSetupPage.btnStartGame).toHaveAttribute('disabled');
  });

  test('le bouton est activé dès 3 joueurs', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await gameSetupPage.addPlayer('Charlie');
    await expect(gameSetupPage.btnStartGame).not.toHaveAttribute('disabled');
  });

  test('l\'avertissement disparaît dès 3 joueurs', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await gameSetupPage.addPlayer('Charlie');
    await expect(gameSetupPage.warningText).not.toBeVisible();
  });

  test('navigue vers /card-deal après avoir ajouté 3 joueurs et cliqué démarrer', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Bob');
    await gameSetupPage.addPlayer('Charlie');
    await gameSetupPage.clickStartGame();
    await expect(page).toHaveURL(/card-deal/);
  });
});

// --------------------------------------------------------------------------
// Sad paths — noms dupliqués
// --------------------------------------------------------------------------
test.describe('Configuration de la partie (/game-setup) — sad paths (noms dupliqués)', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('ajouter un nom dupliqué affiche un toast d\'erreur', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.ionToast).toBeVisible({ timeout: 5_000 });
  });

  test('ajouter un nom dupliqué ne l\'ajoute pas à la liste (compteur reste 1)', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('la vérification des doublons est insensible à la casse', async ({ gameSetupPage }) => {
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('alice');
    await expect(gameSetupPage.ionToast).toBeVisible({ timeout: 5_000 });
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });

  test('un nom vide ou espace ne s\'ajoute pas', async ({ gameSetupPage }) => {
    // The add button stays disabled when the input is empty/whitespace
    await expect(gameSetupPage.btnAddPlayer).toHaveAttribute('disabled');
    // Player count remains 0
    await expect(gameSetupPage.playerCountBadge).toContainText('0');
  });
});

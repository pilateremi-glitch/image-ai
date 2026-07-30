/**
 * Main menu UI rendering
 * Imported by: main.js for initialization
 */

/**
 * Create main menu DOM structure
 * This is called by index.html (already present in template)
 * This file documents the structure for reference
 */

/**
 * Show main menu screen
 */
export function showMenu() {
  const menu = document.getElementById('main-menu');
  const container = document.getElementById('game-container');
  if (menu) menu.style.display = 'flex';
  if (container) container.style.display = 'none';
}

/**
 * Hide main menu and show game
 */
export function hideMenu() {
  const menu = document.getElementById('main-menu');
  const container = document.getElementById('game-container');
  if (menu) menu.style.display = 'none';
  if (container) container.style.display = 'flex';
}

/**
 * Show game over screen
 */
export function showGameOver(wave) {
  const goScreen = document.getElementById('gameover-screen');
  const goWave = document.getElementById('go-wave');

  if (goScreen) goScreen.classList.add('open');
  if (goWave) goWave.textContent = wave;
}

/**
 * Hide game over screen
 */
export function hideGameOver() {
  const goScreen = document.getElementById('gameover-screen');
  if (goScreen) goScreen.classList.remove('open');
}

/**
 * Enable/disable continue button based on save state
 */
export function updateContinueButton(hasSave) {
  const btn = document.getElementById('btn-continue');
  if (btn) {
    btn.disabled = !hasSave;
  }
}

/**
 * Enable menu buttons after game initialized
 */
export function enableMenuButtons() {
  const buttons = [
    'btn-continue',
    'btn-tech-tree-menu',
    'btn-stats-menu'
  ];

  for (const btnId of buttons) {
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = false;
  }
}

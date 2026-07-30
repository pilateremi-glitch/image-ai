/**
 * Main entry point for the modularized zombie tower defense game
 * Coordinates all modules and runs the game loop
 */

import { defaultState } from './game/state.js';
import { COLS, ROWS, CW, CH, CELL } from './config.js';
import { hasSave, loadGame, saveGame } from './save/storage.js';
import { showMenu, hideMenu, showGameOver } from './ui/menu.js';
import { updateTopBar, setMsg } from './ui/topbar.js';

let G = null; // Global game state
let canvas = null;
let ctx = null;
let animFrame = null;
let lastTimestamp = 0;
let animTime = 0;

/**
 * Initialize the game
 */
export function initGame() {
  // Setup canvas
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = CW;
  canvas.height = CH;

  // Check for save
  if (hasSave()) {
    G = loadGame();
    if (!G) {
      G = defaultState();
    }
  } else {
    G = defaultState();
  }

  // Update UI
  updateTopBar(G);

  // Setup event listeners
  setupEventListeners();

  // Show/hide menus
  hideMenu();

  console.log('Game initialized', G);
}

/**
 * Setup event listeners for UI
 */
function setupEventListeners() {
  // New game
  const btnNewGame = document.getElementById('btn-new-game');
  if (btnNewGame) {
    btnNewGame.addEventListener('click', startNewGame);
  }

  // Continue game
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', continueGame);
  }

  // Erase save
  const btnErase = document.getElementById('btn-erase');
  if (btnErase) {
    btnErase.addEventListener('click', eraseSaveConfirm);
  }

  // Menu buttons in game
  const btnMenuIngame = document.getElementById('btn-menu-ingame');
  if (btnMenuIngame) {
    btnMenuIngame.addEventListener('click', returnToMenu);
  }

  // Canvas events
  if (canvas) {
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousemove', onCanvasMouseMove);
  }

  // Building tabs
  const buildTabs = document.querySelectorAll('.build-tab');
  for (const tab of buildTabs) {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      // Update active tab
      for (const t of buildTabs) t.classList.remove('active');
      tab.classList.add('active');
    });
  }
}

/**
 * Start a new game
 */
function startNewGame() {
  G = defaultState();
  hideMenu();
  updateTopBar(G);
  console.log('New game started');
}

/**
 * Continue existing game
 */
function continueGame() {
  if (!hasSave()) {
    setMsg('No save found!');
    return;
  }
  G = loadGame();
  if (!G) {
    setMsg('Failed to load game');
    return;
  }
  hideMenu();
  updateTopBar(G);
  console.log('Game continued');
}

/**
 * Erase save confirmation
 */
function eraseSaveConfirm() {
  if (confirm('Êtes-vous sûr de vouloir effacer la sauvegarde ?')) {
    // eraseSave();
    showMenu();
    setMsg('Sauvegarde supprimée');
  }
}

/**
 * Return to main menu
 */
function returnToMenu() {
  if (confirm('Retourner au menu principal ? Le jeu non sauvegardé sera perdu.')) {
    saveGame(G);
    showMenu();
  }
}

/**
 * Canvas click handler
 */
function onCanvasClick(event) {
  // TODO: Implement building placement, selection, etc.
  console.log('Canvas clicked', event);
}

/**
 * Canvas mouse move handler
 */
function onCanvasMouseMove(event) {
  // TODO: Implement hover highlighting
}

/**
 * Main game loop
 */
function gameLoop(timestamp) {
  if (lastTimestamp === 0) lastTimestamp = timestamp;
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  animTime += dt;

  // Update game state
  // updateGame(dt);

  // Render
  // renderFrame();

  animFrame = requestAnimationFrame(gameLoop);
}

/**
 * Start the game loop
 */
export function startGameLoop() {
  animFrame = requestAnimationFrame(gameLoop);
}

/**
 * Stop the game loop
 */
export function stopGameLoop() {
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

/**
 * Export for browser console access
 */
if (typeof window !== 'undefined') {
  window.G = G;
  window.gameInit = initGame;
  window.gameStart = startGameLoop;
  window.gameStop = stopGameLoop;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

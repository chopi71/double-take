// Boot and the one loop of DOUBLE TAKE: it builds the game state, wires the header buttons,
// the canvas clicks and the keys to the rules in game-state.js, and paints with panels.js on
// every animation frame while the clock runs.
//
// ?shot=start|play|play2|end (with &seed=N) stages one deterministic frame instead of
// running the loop: the state is arranged by shots.js, painted twice, and flagged with
// window.__shotReady so a screenshot can be taken of the real game.

import {
  clickAt,
  createGame,
  nextScene,
  restartScene,
  sceneOf,
  startRun,
  tick,
  useHint,
  SCREEN_DONE,
  SCREEN_FAILED,
  SCREEN_GAME_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
} from './game-state.js';
import { drawGame } from './panels.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import { applyShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const sceneNameEl = document.getElementById('scene-name');
const hintButton = document.getElementById('btn-hint');
const pauseButton = document.getElementById('btn-pause');
const restartButton = document.getElementById('btn-restart');
const soundButton = document.getElementById('btn-sound');

const game = createGame();
const sound = createSound();

/** Keep the page's own chrome (scene name, button labels) in step with the game state. */
function refreshChrome() {
  sceneNameEl.textContent = sceneOf(game).name;
  hintButton.textContent = `Hint (${game.hintsLeft})`;
  pauseButton.textContent = game.screen === SCREEN_PAUSED ? 'Resume' : 'Pause';
  soundButton.textContent = sound.enabled ? 'Sound: On' : 'Sound: Off';
}

/** Screen readers hear the moments that matter: a find, a completion, a failure. */
function announce(message) {
  status.textContent = message;
}

function doHint(now) {
  const shown = useHint(game, now);
  if (shown !== null) {
    sound.click();
    announce(`Hint: look near where ${shown.label}.`);
  }
  refreshChrome();
}

function togglePause() {
  if (game.screen === SCREEN_PLAY) {
    game.screen = SCREEN_PAUSED;
    announce('Paused.');
  } else if (game.screen === SCREEN_PAUSED) {
    game.screen = SCREEN_PLAY;
    announce('Playing.');
  }
  refreshChrome();
}

function toggleSound() {
  sound.toggle();
  refreshChrome();
}

function doRestart() {
  if (game.screen === SCREEN_GAME_DONE || game.screen === SCREEN_TITLE) startRun(game);
  else restartScene(game);
  sound.click();
  announce(`Scene ${game.sceneIndex + 1}: ${sceneOf(game).name}. Find 8 differences.`);
  refreshChrome();
}

/** One tap on the canvas: what it means depends on the screen, as the overlays promise. */
function handleTap(x, y, panel) {
  sound.unlock();
  const now = performance.now();
  if (game.screen === SCREEN_TITLE) {
    startRun(game);
    sound.jingle();
    announce('Find 8 differences in Coral Cove.');
  } else if (game.screen === SCREEN_PLAY && panel !== null) {
    const foundDiff = clickAt(game, panel.px, panel.py, x, y, now);
    if (foundDiff !== null) {
      if (game.screen === SCREEN_DONE || game.screen === SCREEN_GAME_DONE) {
        sound.jingle();
        announce(game.screen === SCREEN_GAME_DONE ? `Game complete. Final score ${game.score}.` : 'Scene complete!');
      } else {
        sound.ding();
        announce(`Found: ${foundDiff.label}.`);
      }
    } else {
      sound.buzz();
      announce('Not a difference. Five seconds gone.');
    }
  } else if (game.screen === SCREEN_DONE) {
    nextScene(game);
    sound.click();
    announce(`Scene ${game.sceneIndex + 1}: ${sceneOf(game).name}.`);
  } else if (game.screen === SCREEN_FAILED || game.screen === SCREEN_GAME_DONE) {
    doRestart();
  } else if (game.screen === SCREEN_PAUSED) {
    togglePause();
  }
  refreshChrome();
}

/** The keys: H hint, P pause, R restart or retry, M sound, N next scene, Enter to start. */
function handleKey(key) {
  sound.unlock();
  const now = performance.now();
  if (key === 'h') doHint(now);
  else if (key === 'p') togglePause();
  else if (key === 'm') toggleSound();
  else if (key === 'r') doRestart();
  else if (key === 'n' && game.screen === SCREEN_DONE) {
    nextScene(game);
    sound.click();
    refreshChrome();
  } else if ((key === 'enter' || key === ' ') && game.screen === SCREEN_TITLE) {
    startRun(game);
    sound.jingle();
    refreshChrome();
  }
}

function runShot(name) {
  applyShot(game, name);
  refreshChrome();
  let painted = 0;
  function paint() {
    drawGame(ctx, game, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  createInput(canvas, { onTap: handleTap, onKey: handleKey });
  hintButton.addEventListener('click', () => doHint(performance.now()));
  pauseButton.addEventListener('click', togglePause);
  restartButton.addEventListener('click', doRestart);
  soundButton.addEventListener('click', toggleSound);

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    tick(game, dt);
    drawGame(ctx, game, now);
  }
  announce('Double Take. Click anywhere to start.');
  refreshChrome();
  requestAnimationFrame(frame);
}

if (shotName !== null) runShot(shotName);
else runGame();

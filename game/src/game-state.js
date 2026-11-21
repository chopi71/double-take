// The rules of DOUBLE TAKE, with no drawing in them: the score, the countdown, the mistakes,
// the hints and the flow from title to scene to scene to the final screen. main.js drives this
// state from the clock and the player's clicks; panels.js only reads it to paint.

import { SCENES } from './differences.js';

export const SCENE_SECONDS = 240;
export const FOUND_POINTS = 100;
export const TIME_BONUS_PER_SECOND = 2;
export const HINT_COST = 25;
export const HINT_PULSE_MS = 1600;
export const HINTS_PER_SCENE = 3;
export const MISTAKE_SECONDS = 5;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_DONE = 'scene-done';
export const SCREEN_FAILED = 'scene-failed';
export const SCREEN_GAME_DONE = 'game-done';

/** A fresh game, sitting on the title screen over the first scene. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    score: 0,
    scoreAtSceneStart: 0,
    mistakes: 0,
    totalMistakes: 0,
    timeLeft: SCENE_SECONDS,
    hintsLeft: HINTS_PER_SCENE,
    hint: null,
    flashes: [],
    popups: [],
    lastBonus: 0,
  };
}

/** The scene the game is currently showing. */
export function sceneOf(game) {
  return SCENES[game.sceneIndex];
}

/** Begin one scene: nothing found, a full clock, three hints, the run's score carried in. */
export function startScene(game, index) {
  game.sceneIndex = index;
  game.scoreAtSceneStart = game.score;
  game.found = new Set();
  game.mistakes = 0;
  game.timeLeft = SCENE_SECONDS;
  game.hintsLeft = HINTS_PER_SCENE;
  game.hint = null;
  game.flashes = [];
  game.popups = [];
  game.screen = SCREEN_PLAY;
}

/** Begin a whole run again from the first scene, score and mistakes reset. */
export function startRun(game) {
  game.score = 0;
  game.totalMistakes = 0;
  startScene(game, 0);
}

/** Restart the current scene: its finds are handed back, so its points are too. */
export function restartScene(game) {
  game.score = game.scoreAtSceneStart;
  startScene(game, game.sceneIndex);
}

/** Move on to the next scene after a completed one. */
export function nextScene(game) {
  startScene(game, game.sceneIndex + 1);
}

/** The scene is complete: bank the time bonus and move to the right "done" screen. */
function completeScene(game) {
  game.lastBonus = Math.ceil(game.timeLeft) * TIME_BONUS_PER_SECOND;
  game.score += game.lastBonus;
  game.screen = game.sceneIndex === SCENES.length - 1 ? SCREEN_GAME_DONE : SCREEN_DONE;
}

/**
 * Judge one click, given in panel coordinates (px, py) with the click's canvas position
 * (canvasX, canvasY) for the feedback marks. Returns the difference found, or null for a
 * miss. A find scores and, when it is the scene's last, completes the scene; a miss costs
 * time and, at zero, fails it.
 */
export function clickAt(game, px, py, canvasX, canvasY, now) {
  const scene = sceneOf(game);
  for (const d of scene.differences) {
    if (game.found.has(d.id)) continue;
    const dx = px - d.x;
    const dy = py - d.y;
    if (dx * dx + dy * dy <= d.radius * d.radius) {
      game.found.add(d.id);
      game.score += FOUND_POINTS;
      game.popups.push({ x: canvasX, y: canvasY - 16, text: `+${FOUND_POINTS}`, until: now + 900 });
      if (game.found.size === scene.differences.length) completeScene(game);
      return d;
    }
  }
  game.mistakes += 1;
  game.totalMistakes += 1;
  game.timeLeft = Math.max(0, game.timeLeft - MISTAKE_SECONDS);
  game.flashes.push({ x: canvasX, y: canvasY, until: now + 450 });
  if (game.timeLeft <= 0) game.screen = SCREEN_FAILED;
  return null;
}

/**
 * Spend one hint: pulse a ring around the first unfound difference for a moment, at a cost of
 * HINT_COST points (the score never drops below zero). Returns the difference shown, or null
 * when no hint is left or none is needed.
 */
export function useHint(game, now) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
  const next = sceneOf(game).differences.find((d) => !game.found.has(d.id));
  if (next === undefined) return null;
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.hint = { id: next.id, until: now + HINT_PULSE_MS };
  return next;
}

/** Advance the countdown; running out of time fails the scene. */
export function tick(game, dt) {
  if (game.screen !== SCREEN_PLAY) return;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_FAILED;
  }
}

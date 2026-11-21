// The deterministic screenshot states behind ?shot=start|play|play2|end&seed=1. Each one
// arranges the game's own state — the scene, the found set, the clock, the score — and the
// ordinary renderer then paints it, so a screenshot is a real frame of the game with the
// timer stopped. The seed is accepted for symmetry with the game's URL scheme; the scenes
// are drawn deterministically, so the same shot always renders the same frame.

import { SCENES } from './differences.js';
import { SCENE_SECONDS, SCREEN_GAME_DONE, SCREEN_PLAY, SCREEN_TITLE } from './game-state.js';

/** Mark the first `count` differences of scene `sceneIndex` as found. */
function preFound(game, sceneIndex, count) {
  game.sceneIndex = sceneIndex;
  game.found = new Set(SCENES[sceneIndex].differences.slice(0, count).map((d) => d.id));
}

/**
 * Put `game` into the named shot's state: start is the title over the first scene, play is
 * Coral Cove under way with three finds, play2 is Lantern Lane with four, and end is the
 * final screen over the attic with all eight of its differences ringed. Any other name
 * stages the title.
 */
export function applyShot(game, name) {
  game.hintsLeft = 3;
  game.lastBonus = 0;
  if (name === 'play') {
    preFound(game, 0, 3);
    game.score = 300;
    game.mistakes = 1;
    game.totalMistakes = 1;
    game.timeLeft = 187;
    game.screen = SCREEN_PLAY;
  } else if (name === 'play2') {
    preFound(game, 1, 4);
    game.score = 1140;
    game.mistakes = 2;
    game.totalMistakes = 3;
    game.timeLeft = 161;
    game.hintsLeft = 2;
    game.screen = SCREEN_PLAY;
  } else if (name === 'end') {
    preFound(game, 2, 8);
    game.score = 2710;
    game.mistakes = 1;
    game.totalMistakes = 4;
    game.timeLeft = 96;
    game.screen = SCREEN_GAME_DONE;
  } else {
    preFound(game, 0, 0);
    game.score = 0;
    game.mistakes = 0;
    game.totalMistakes = 0;
    game.timeLeft = SCENE_SECONDS;
    game.screen = SCREEN_TITLE;
  }
}

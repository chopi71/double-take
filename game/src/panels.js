// Everything DOUBLE TAKE paints: the HUD strip across the top of the canvas (scene name,
// timer, the found counter, mistakes and score), the two 600x600 pictures side by side, the
// ring markers on the differences found, the hint pulse, the red cross of a miss, the rising
// +100 of a find, and the overlay screens (title, pause, scene complete, time up, and the
// final score). The left picture is the scene painted plain; the right is the same scene
// with every difference switched on.

import { allDiffIds } from './differences.js';
import {
  sceneOf,
  SCREEN_DONE,
  SCREEN_FAILED,
  SCREEN_GAME_DONE,
  SCREEN_PAUSED,
  SCREEN_TITLE,
} from './game-state.js';
import { paintScene } from './scenes.js';

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 800;
export const PANEL_SIZE = 600;
export const PANEL_Y = 150;
export const LEFT_X = 24;
export const RIGHT_X = 656;

const NO_DIFFS = new Set();
const INK = '#f4f1de';
const MUTED = '#9aa3c0';
const ACCENT = '#ffd23f';
const GOOD = '#3ddc84';
const BAD = '#ff5d5d';

/** The countdown as m:ss (187 seconds reads 3:07). */
export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function text(ctx, value, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

/** The HUD strip: everything the player needs to know, always on show above the pictures. */
function drawHud(ctx, game) {
  ctx.fillStyle = '#161a2c';
  ctx.fillRect(0, 0, VIEW_WIDTH, 140);
  ctx.fillStyle = '#2a3050';
  ctx.fillRect(0, 140, VIEW_WIDTH, 2);
  const scene = sceneOf(game);
  const total = scene.differences.length;
  const remaining = total - game.found.size;

  text(ctx, `Scene ${game.sceneIndex + 1} of 3 · ${scene.name}`, 24, 42, '700 26px system-ui, sans-serif', '#a8dadc');
  text(ctx, `Hints left: ${game.hintsLeft} (H)`, 24, 80, '20px system-ui, sans-serif', MUTED);
  text(ctx, 'Find every difference between the two pictures', 24, 112, '17px system-ui, sans-serif', MUTED);

  text(ctx, formatTime(game.timeLeft), 640, 52, '700 46px system-ui, sans-serif', game.timeLeft <= 30 ? BAD : INK, 'center');
  text(ctx, `Found ${game.found.size} of ${total} — ${remaining} to go`, 640, 106, '700 33px system-ui, sans-serif', ACCENT, 'center');

  text(ctx, `Score ${game.score}`, 1256, 42, '700 26px system-ui, sans-serif', INK, 'right');
  text(ctx, `Mistakes: ${game.totalMistakes}`, 1256, 80, '20px system-ui, sans-serif', MUTED, 'right');
  text(ctx, '+100 a find · hint −25 · miss −5s', 1256, 112, '17px system-ui, sans-serif', MUTED, 'right');
}

/** One picture: the scene painted into its panel, clipped, with a frame and a caption. */
function drawPanel(ctx, game, originX, applied, caption) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(originX, PANEL_Y, PANEL_SIZE, PANEL_SIZE);
  ctx.clip();
  ctx.translate(originX, PANEL_Y);
  paintScene(ctx, game.sceneIndex, applied);
  ctx.restore();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3d4468';
  ctx.strokeRect(originX, PANEL_Y, PANEL_SIZE, PANEL_SIZE);
  text(ctx, caption, originX + PANEL_SIZE / 2, PANEL_Y + PANEL_SIZE + 28, '600 16px system-ui, sans-serif', MUTED, 'center');
}

/** A found-ring: a bold green circle with a dark under-stroke, readable on any picture. */
function drawRing(ctx, x, y, r, color = GOOD, width = 4) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = width + 3.5;
  ctx.strokeStyle = 'rgba(8,10,18,0.55)';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/** The rings on every found difference, mirrored on both pictures, plus the hint pulse. */
function drawMarkers(ctx, game, now) {
  const scene = sceneOf(game);
  for (const d of scene.differences) {
    if (!game.found.has(d.id)) continue;
    drawRing(ctx, LEFT_X + d.x, PANEL_Y + d.y, d.radius + 6);
    drawRing(ctx, RIGHT_X + d.x, PANEL_Y + d.y, d.radius + 6);
  }
  if (game.hint !== null && now < game.hint.until) {
    const d = scene.differences.find((item) => item.id === game.hint.id);
    if (d !== undefined) {
      const pulse = d.radius + 11 + 4 * Math.sin(now / 85);
      drawRing(ctx, LEFT_X + d.x, PANEL_Y + d.y, pulse, ACCENT, 5);
      drawRing(ctx, RIGHT_X + d.x, PANEL_Y + d.y, pulse, ACCENT, 5);
    }
  }
}

/** The red crosses of recent misses and the rising +100 of recent finds. */
function drawFeedback(ctx, game, now) {
  for (const flash of game.flashes) {
    if (now >= flash.until) continue;
    ctx.lineCap = 'round';
    for (const [width, color] of [[8, 'rgba(8,10,18,0.55)'], [5, BAD]]) {
      ctx.beginPath();
      ctx.moveTo(flash.x - 11, flash.y - 11);
      ctx.lineTo(flash.x + 11, flash.y + 11);
      ctx.moveTo(flash.x - 11, flash.y + 11);
      ctx.lineTo(flash.x + 11, flash.y - 11);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }
  for (const popup of game.popups) {
    const left = popup.until - now;
    if (left <= 0) continue;
    const risen = (900 - left) / 900;
    ctx.globalAlpha = Math.min(1, left / 350);
    text(ctx, popup.text, popup.x, popup.y - risen * 26, '700 23px system-ui, sans-serif', GOOD, 'center');
    ctx.globalAlpha = 1;
  }
}

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(6,8,16,${alpha})`;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

function centerText(ctx, value, y, font, color) {
  text(ctx, value, VIEW_WIDTH / 2, y, font, color, 'center');
}

/** The overlay for the current screen, if the screen has one. */
function drawOverlay(ctx, game) {
  if (game.screen === SCREEN_TITLE) {
    dim(ctx, 0.45);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 14;
    centerText(ctx, 'DOUBLE TAKE', 356, '800 88px system-ui, sans-serif', ACCENT);
    ctx.restore();
    centerText(ctx, 'Spot the Difference', 412, '600 34px system-ui, sans-serif', INK);
    centerText(ctx, 'Three scenes · eight differences each · four minutes a scene', 458, '21px system-ui, sans-serif', '#a8dadc');
    centerText(ctx, 'Click anywhere to start', 516, '700 26px system-ui, sans-serif', GOOD);
  } else if (game.screen === SCREEN_PAUSED) {
    dim(ctx, 0.6);
    centerText(ctx, 'Paused', 392, '800 52px system-ui, sans-serif', INK);
    centerText(ctx, 'Press P to keep hunting', 442, '23px system-ui, sans-serif', ACCENT);
  } else if (game.screen === SCREEN_DONE) {
    dim(ctx, 0.6);
    centerText(ctx, 'Scene complete!', 348, '800 48px system-ui, sans-serif', GOOD);
    centerText(ctx, `Time bonus +${game.lastBonus}`, 402, '28px system-ui, sans-serif', INK);
    centerText(ctx, `Score ${game.score}`, 442, '28px system-ui, sans-serif', INK);
    centerText(ctx, 'Press N for the next scene', 500, '700 24px system-ui, sans-serif', ACCENT);
  } else if (game.screen === SCREEN_FAILED) {
    dim(ctx, 0.6);
    centerText(ctx, "Time's up!", 356, '800 52px system-ui, sans-serif', BAD);
    centerText(ctx, 'The last differences stay hidden — for now.', 410, '23px system-ui, sans-serif', INK);
    centerText(ctx, 'Press R to retry this scene', 470, '700 24px system-ui, sans-serif', ACCENT);
  } else if (game.screen === SCREEN_GAME_DONE) {
    dim(ctx, 0.62);
    centerText(ctx, 'You found all 24 differences!', 330, '800 46px system-ui, sans-serif', ACCENT);
    centerText(ctx, `Final score: ${game.score}`, 392, '30px system-ui, sans-serif', INK);
    centerText(ctx, `Mistakes: ${game.totalMistakes}`, 434, '30px system-ui, sans-serif', INK);
    centerText(ctx, 'Press R to play again', 496, '700 24px system-ui, sans-serif', GOOD);
  }
}

/** Paint the whole game for the current state: background, HUD, pictures, marks, overlay. */
export function drawGame(ctx, game, now) {
  ctx.fillStyle = '#10131f';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawHud(ctx, game);
  const scene = sceneOf(game);
  drawPanel(ctx, game, LEFT_X, NO_DIFFS, 'THE ORIGINAL');
  drawPanel(ctx, game, RIGHT_X, new Set(allDiffIds(scene)), 'SAME SCENE — WITH 8 CHANGES');
  drawMarkers(ctx, game, now);
  drawFeedback(ctx, game, now);
  text(ctx, 'Click a difference in either picture · H hint · P pause · R restart · M sound', 640, 792, '15px system-ui, sans-serif', '#6b7194', 'center');
  drawOverlay(ctx, game);
}

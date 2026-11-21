// Mouse and keyboard handling for DOUBLE TAKE. A click anywhere on the canvas is reported
// in canvas coordinates; a click inside either picture is also reported in that picture's
// own 600x600 panel coordinates, so a difference can be clicked in the left picture or the
// right and counts exactly the same. Keys are reported lowercased: h, p, r, m and n do the
// work, and main.js decides what each means on the current screen.

import { LEFT_X, PANEL_SIZE, PANEL_Y, RIGHT_X, VIEW_HEIGHT, VIEW_WIDTH } from './panels.js';

/** A mouse event's position in the canvas's own 1280x800 coordinates, whatever its CSS size. */
export function toCanvasCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) * VIEW_WIDTH) / rect.width,
    y: ((clientY - rect.top) * VIEW_HEIGHT) / rect.height,
  };
}

/** The panel point a canvas position falls on: { side, px, py }, or null outside both pictures. */
export function panelPoint(x, y) {
  if (y < PANEL_Y || y >= PANEL_Y + PANEL_SIZE) return null;
  if (x >= LEFT_X && x < LEFT_X + PANEL_SIZE) return { side: 'left', px: x - LEFT_X, py: y - PANEL_Y };
  if (x >= RIGHT_X && x < RIGHT_X + PANEL_SIZE) return { side: 'right', px: x - RIGHT_X, py: y - PANEL_Y };
  return null;
}

/**
 * Wire the canvas and the keyboard to the handlers: onTap(canvasX, canvasY, panelOrNull)
 * for a pointer press, onKey(key) for a key press. Returns nothing; the listeners live as
 * long as the page does.
 */
export function createInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toCanvasCoords(canvas, event.clientX, event.clientY);
    handlers.onTap(x, y, panelPoint(x, y));
  });
  window.addEventListener('keydown', (event) => {
    handlers.onKey(event.key.toLowerCase());
  });
}

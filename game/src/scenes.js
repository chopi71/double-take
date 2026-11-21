// The three scene painters of DOUBLE TAKE. Each painter draws one 600x600 picture onto a
// context already translated to the panel's corner and clipped to the panel. `applied` holds
// the ids of the differences switched on for this panel: the left picture is painted with an
// empty set and the right with every id in the scene, so one painter draws both pictures and
// a difference is exactly the branch it names. Every element that can differ sits on the
// anchor differences.js gives it. All art is Canvas 2D shapes — no images, no assets.

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.stroke();
}

function poly(ctx, points, color) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** A pointed star (or starfish): spikes points out, valleys between them. */
function starShape(ctx, cx, cy, spikes, outer, inner, color) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** A puffy cloud: three circles on a rounded base. */
function cloud(ctx, x, y, s, color) {
  circle(ctx, x, y, 26 * s, color);
  circle(ctx, x + 30 * s, y + 4 * s, 20 * s, color);
  circle(ctx, x - 30 * s, y + 6 * s, 18 * s, color);
  ellipse(ctx, x, y + 10 * s, 44 * s, 14 * s, color);
}

/** A small fish facing right: ellipse body, triangle tail, one eye. */
function fish(ctx, x, y, color) {
  ellipse(ctx, x, y, 26, 13, color);
  poly(ctx, [[x - 24, y], [x - 42, y - 12], [x - 42, y + 12]], color);
  circle(ctx, x + 14, y - 3, 3.5, '#10384a');
}

/** A scallop shell: a half-disc with ridge lines fanning from its base. */
function shell(ctx, x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 17, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  for (const dx of [-11, -5.5, 0, 5.5, 11]) line(ctx, x, y, x + dx, y - 15, 2, 'rgba(120,60,40,0.45)');
  line(ctx, x - 17, y, x + 17, y, 3, 'rgba(120,60,40,0.45)');
}

// ------------------------------------------------------------------ Coral Cove

function paintCoralCove(ctx, applied) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#6ec1f5');
  sky.addColorStop(1, '#cfF2fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 300);
  const sea = ctx.createLinearGradient(0, 240, 0, 430);
  sea.addColorStop(0, '#2aa5c4');
  sea.addColorStop(1, '#177e9c');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 240, 600, 190);
  rect(ctx, 0, 408, 600, 192, '#f4d98c');
  ellipse(ctx, 300, 412, 330, 20, '#f4d98c');

  // The sun and its eight rays; on the changed picture one ray is missing.
  for (let i = 0; i < 8; i += 1) {
    if (applied.has('sun-ray') && i === 1) continue;
    const a = (Math.PI * i) / 4 - Math.PI / 2;
    line(ctx, 480 + Math.cos(a) * 50, 90 + Math.sin(a) * 50, 480 + Math.cos(a) * 70, 90 + Math.sin(a) * 70, 6, '#ffb703');
  }
  circle(ctx, 480, 90, 40, '#ffd23f');
  circle(ctx, 480, 90, 40, 'rgba(255,176,3,0.35)');

  cloud(ctx, 120, 84, 1, '#ffffff');
  if (!applied.has('cloud-gone')) cloud(ctx, 300, 58, 0.8, '#ffffff');

  // Wavelets on the sea.
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineCap = 'round';
  for (const [wx, wy] of [[60, 300], [185, 332], [420, 298], [520, 344], [255, 372], [90, 386], [350, 322]]) {
    ctx.beginPath();
    ctx.arc(wx, wy, 13, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // The sailboat: hull, two sails, and a flag the changed picture has lost.
  poly(ctx, [[105, 330], [195, 330], [180, 354], [120, 354]], '#9c6644');
  line(ctx, 150, 330, 150, 224, 5, '#7f5539');
  poly(ctx, [[150, 232], [150, 318], [197, 318]], '#ffffff');
  poly(ctx, [[150, 242], [150, 310], [111, 310]], '#ffe8a3');
  if (!applied.has('boat-flag')) poly(ctx, [[150, 224], [150, 242], [173, 233]], '#ef476f');

  fish(ctx, 428, 318, '#ff8c42');
  fish(ctx, 460, 362, applied.has('fish-color') ? '#b388ff' : '#2ec4a6');
  fish(ctx, 296, 388, '#ffd23f');

  // The palm tree: a curved trunk and five fronds.
  ctx.beginPath();
  ctx.moveTo(88, 600);
  ctx.quadraticCurveTo(96, 480, 118, 392);
  ctx.lineWidth = 17;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#8a5a2b';
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#2a9d4f';
  for (const [ex, ey, cx, cy] of [[48, 356, 78, 368], [82, 338, 100, 356], [132, 330, 128, 354], [178, 348, 152, 360], [188, 382, 156, 380]]) {
    ctx.beginPath();
    ctx.moveTo(118, 392);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  circle(ctx, 108, 402, 9, '#6f4518');
  circle(ctx, 128, 406, 8, '#6f4518');

  // The beach umbrella: a tilted pole and a striped dome.
  line(ctx, 352, 442, 338, 352, 5, '#8d99ae');
  ctx.beginPath();
  ctx.arc(338, 352, 58, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = '#ef476f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(338, 352, 58, Math.PI * (7 / 6), Math.PI * (11 / 6));
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // The crab: body, eyes, legs, and two claws — one of them optional.
  ellipse(ctx, 300, 505, 31, 20, '#e4572e');
  line(ctx, 288, 488, 284, 474, 4, '#e4572e');
  line(ctx, 312, 488, 316, 474, 4, '#e4572e');
  circle(ctx, 284, 470, 5, '#ffffff');
  circle(ctx, 316, 470, 5, '#ffffff');
  circle(ctx, 284, 470, 2.4, '#22223b');
  circle(ctx, 316, 470, 2.4, '#22223b');
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      line(ctx, 300 + s * 26, 496 + i * 8, 300 + s * (44 + i * 3), 504 + i * 9, 4, '#c7431f');
    }
  }
  circle(ctx, 340, 484, 13, '#e4572e');
  line(ctx, 340, 484, 350, 474, 4, '#c7431f');
  if (!applied.has('crab-claw')) {
    circle(ctx, 262, 484, 13, '#e4572e');
    line(ctx, 262, 484, 252, 474, 4, '#c7431f');
  }

  // The beach ball: six wedges whose colours are swapped on the changed picture.
  const ballColors = applied.has('ball-stripes')
    ? ['#06d6a0', '#8338ec', '#ff8c42']
    : ['#ef476f', '#ffd23f', '#118ab2'];
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(520, 470);
    ctx.arc(520, 470, 30, (Math.PI * i) / 3, (Math.PI * (i + 1)) / 3);
    ctx.closePath();
    ctx.fillStyle = ballColors[i % 3];
    ctx.fill();
  }
  circle(ctx, 520, 470, 7, '#ffffff');

  shell(ctx, 180, 545, '#ffb4a2');
  shell(ctx, 425, 558, '#ffc8dd');
  if (applied.has('extra-shell')) shell(ctx, 500, 520, '#a2d2ff');

  starShape(ctx, 120, 480, applied.has('starfish-arm') ? 4 : 5, 34, 16, '#ff9f1c');
  circle(ctx, 120, 480, 4, '#e07b00');
  circle(ctx, 112, 470, 2.6, '#e07b00');
  circle(ctx, 130, 474, 2.6, '#e07b00');
}

// ---------------------------------------------------------------- Lantern Lane

/** A paper lantern: a hanger string, a ribbed glowing body and a tassel. */
function lantern(ctx, x, y, color) {
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 30);
  glow.addColorStop(0, 'rgba(255,214,120,0.5)');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 30, y - 30, 60, 60);
  line(ctx, x, y - 26, x, y - 15, 2, '#0a0a12');
  ellipse(ctx, x, y, 14, 17, color);
  line(ctx, x - 7, y - 15, x - 7, y + 15, 1.6, 'rgba(90,20,20,0.5)');
  line(ctx, x + 7, y - 15, x + 7, y + 15, 1.6, 'rgba(90,20,20,0.5)');
  rect(ctx, x - 5, y - 19, 10, 4, '#5c374c');
  line(ctx, x, y + 17, x, y + 24, 2, '#ffd23f');
}

/** A crescent moon: a disc with an offset disc cut out of it; flip turns it the other way. */
function crescent(ctx, x, y, r, flip, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + (flip ? -r * 0.48 : r * 0.48), y - r * 0.18, r * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill('evenodd');
}

/** One market stall: posts, a counter of goods, and an awning striped one way or the other. */
function stall(ctx, x, baseColor, verticalStripes) {
  rect(ctx, x, 452, 12, 62, '#3a2a20');
  rect(ctx, x + 208, 452, 12, 62, '#3a2a20');
  rect(ctx, x - 6, 452, 232, 16, '#5b3a29');
  rect(ctx, x - 6, 468, 232, 46, '#4a2e20');
  for (let i = 0; i < 5; i += 1) circle(ctx, x + 22 + i * 44, 446, 10, ['#ef476f', '#ffb703', '#06d6a0', '#ff8c42', '#ffd23f'][i]);
  ctx.save();
  poly(ctx, [[x - 10, 452], [x + 230, 452], [x + 210, 402], [x + 10, 402]], baseColor);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  if (verticalStripes) {
    for (let sx = x + 6; sx < x + 230; sx += 36) ctx.fillRect(sx, 396, 16, 62);
  } else {
    for (let sy = 408; sy < 452; sy += 20) ctx.fillRect(x - 12, sy, 256, 9);
  }
  ctx.restore();
}

/** A potted plant on the street: a trapezoid pot and a spray of leaves. */
function pottedPlant(ctx, x, y, potColor) {
  poly(ctx, [[x - 16, y - 18], [x + 16, y - 18], [x + 11, y + 14], [x - 11, y + 14]], potColor);
  rect(ctx, x - 18, y - 24, 36, 8, potColor);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2a9d4f';
  for (const [ex, ey] of [[-16, -48], [-5, -56], [7, -54], [17, -44]]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.quadraticCurveTo(x + ex * 0.4, y - 38, x + ex, y + ey + 22);
    ctx.stroke();
  }
  circle(ctx, x - 10, y - 44, 6, '#3ecf6f');
  circle(ctx, x + 9, y - 48, 6, '#3ecf6f');
}

function paintLanternLane(ctx, applied) {
  const sky = ctx.createLinearGradient(0, 0, 0, 420);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(1, '#27355f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 480);
  rect(ctx, 0, 470, 600, 130, '#14182e');

  // Stars: two fixed clusters; the changed picture has lost the left one.
  const starPoints = [[250, 60], [330, 110], [430, 48], [560, 150], [215, 132], [386, 150], [60, 150], [292, 168]];
  if (!applied.has('stars-gone')) starPoints.push([120, 55], [150, 80], [105, 85], [170, 50], [140, 38]);
  for (const [sx, sy] of starPoints) {
    circle(ctx, sx, sy, 2.2, '#f4f1de');
    line(ctx, sx - 5, sy, sx + 5, sy, 1.2, 'rgba(244,241,222,0.5)');
    line(ctx, sx, sy - 5, sx, sy + 5, 1.2, 'rgba(244,241,222,0.5)');
  }

  crescent(ctx, 510, 80, 30, applied.has('moon-flip'), '#f4f1de');

  // Buildings behind the stalls, with lit windows — one of which can go dark.
  rect(ctx, 20, 210, 190, 262, '#232946');
  rect(ctx, 230, 190, 150, 282, '#1f2542');
  rect(ctx, 400, 140, 180, 332, '#262c4a');
  const litWindows = [[52, 250], [104, 250], [156, 250], [52, 320], [156, 320], [262, 232], [314, 232], [262, 302], [314, 302], [470, 195], [522, 195], [470, 320], [522, 320]];
  for (const [wx, wy] of litWindows) rect(ctx, wx, wy, 24, 32, '#ffd97a');
  const darkWindows = [[104, 320], [314, 372], [522, 255]];
  for (const [wx, wy] of darkWindows) rect(ctx, wx, wy, 24, 32, '#12172e');
  if (applied.has('window-dark')) rect(ctx, 395, 195, 24, 32, '#12172e');
  else rect(ctx, 395, 195, 24, 32, '#ffd97a');

  // The roof on the left building.
  poly(ctx, [[14, 214], [216, 214], [115, 166]], '#171c33');

  // Hanging signs: a star on one, a circle on the other; the star can change.
  line(ctx, 480, 246, 480, 260, 4, '#0d0f1c');
  rect(ctx, 452, 260, 56, 44, '#3a2e5f');
  if (applied.has('sign-symbol')) circle(ctx, 480, 282, 11, '#06d6a0');
  else starShape(ctx, 480, 282, 5, 13, 6, '#ffd23f');
  line(ctx, 200, 264, 200, 280, 4, '#0d0f1c');
  rect(ctx, 172, 280, 56, 44, '#134e4a');
  circle(ctx, 200, 302, 11, '#ffd23f');

  stall(ctx, 55, '#c44569', false);
  stall(ctx, 325, '#2a9d8f', applied.has('awning-stripes'));

  // The cat, asleep on the first stall's awning; its tail curls one way or the other.
  ellipse(ctx, 130, 386, 15, 12, '#b85c1e');
  circle(ctx, 130, 368, 10, '#b85c1e');
  poly(ctx, [[122, 362], [118, 349], [129, 357]], '#b85c1e');
  poly(ctx, [[138, 362], [142, 349], [131, 357]], '#b85c1e');
  circle(ctx, 126, 368, 1.8, '#ffd23f');
  circle(ctx, 134, 368, 1.8, '#ffd23f');
  ctx.beginPath();
  ctx.moveTo(143, 392);
  if (applied.has('cat-tail')) ctx.quadraticCurveTo(98, 390, 104, 366);
  else ctx.quadraticCurveTo(164, 390, 158, 368);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#b85c1e';
  ctx.stroke();

  pottedPlant(ctx, 70, 548, '#b5651d');
  pottedPlant(ctx, 300, 556, applied.has('pot-color') ? '#8338ec' : '#b5651d');
  pottedPlant(ctx, 530, 548, '#b5651d');

  // The lantern string, drawn last so its glow sits over the rooftops.
  ctx.beginPath();
  ctx.moveTo(30, 110);
  ctx.quadraticCurveTo(300, 190, 570, 110);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#05070f';
  ctx.stroke();
  const lanternSpots = [[111, 146], [192, 160], [273, 166], [354, 164], [435, 156], [516, 140]];
  const lanternColors = ['#ef476f', '#ff8c42', '#ffb703', '#06d6a0', '#ef476f', '#ffd23f'];
  lanternSpots.forEach(([lx, ly], index) => {
    const color = index === 2 && applied.has('lantern-color') ? '#118ab2' : lanternColors[index];
    lantern(ctx, lx, ly, color);
  });
}

// ------------------------------------------------------------- The Wizard's Attic

/** One potion bottle: a round body, a neck and a cork, filled with a glowing brew. */
function potion(ctx, x, baseY, height, color) {
  ellipse(ctx, x, baseY - height * 0.32, 17, height * 0.32, color);
  rect(ctx, x - 6, baseY - height, 12, height * 0.4, color);
  rect(ctx, x - 7, baseY - height - 8, 14, 9, '#c89f6a');
  circle(ctx, x - 5, baseY - height * 0.4, 3, 'rgba(255,255,255,0.65)');
  circle(ctx, x + 6, baseY - height * 0.22, 2.2, 'rgba(255,255,255,0.65)');
}

/** A row of books standing on one shelf board; slot `gapAt` (or -1) is left empty. */
function bookRow(ctx, xs, topY, shelfY, colors, gapAt) {
  let x = xs;
  colors.forEach((color, index) => {
    const w = 15 + ((index * 7) % 9);
    const h = shelfY - topY - ((index * 11) % 16);
    if (index !== gapAt) {
      rect(ctx, x, shelfY - h, w, h, color);
      rect(ctx, x, shelfY - h + 6, w, 4, 'rgba(255,255,255,0.35)');
    }
    x += w + 3;
  });
}

function paintWizardsAttic(ctx, applied) {
  const wall = ctx.createLinearGradient(0, 0, 0, 600);
  wall.addColorStop(0, '#8d6e63');
  wall.addColorStop(1, '#6d4c41');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 600, 600);
  rect(ctx, 0, 470, 600, 130, '#5d4037');
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) line(ctx, 0, 470 + i * 32, 600, 470 + i * 32, 2, 'rgba(0,0,0,0.18)');
  poly(ctx, [[0, 0], [245, 0], [0, 175]], '#4e342e');
  poly(ctx, [[600, 0], [355, 0], [600, 175]], '#4e342e');

  // The pointed hat on its hook: purple, unless it has changed.
  circle(ctx, 92, 116, 4, '#3e2723');
  poly(ctx, [[64, 168], [98, 114], [120, 168]], applied.has('hat-color') ? '#0a9396' : '#5a189a');
  ellipse(ctx, 92, 170, 36, 8, applied.has('hat-color') ? '#0a9396' : '#5a189a');
  rect(ctx, 76, 152, 34, 7, '#ffd23f');

  // The round window: night sky, a small moon, stars — one of them optional — and cross bars.
  circle(ctx, 300, 120, 88, '#4e342e');
  circle(ctx, 300, 120, 80, '#1b2a4a');
  crescent(ctx, 262, 96, 16, false, '#f4f1de');
  const windowStars = [[330, 80], [318, 140], [275, 152], [352, 132]];
  if (!applied.has('window-star')) windowStars.push([345, 95]);
  for (const [sx, sy] of windowStars) circle(ctx, sx, sy, 2.4, '#f4f1de');
  line(ctx, 300, 40, 300, 200, 8, '#4e342e');
  line(ctx, 220, 120, 380, 120, 8, '#4e342e');

  // The bookshelf: three boards of books, with one book that can go missing.
  rect(ctx, 36, 226, 168, 260, '#4e342e');
  rect(ctx, 46, 236, 148, 240, '#3e2723');
  const bookColors = ['#c44569', '#ffb703', '#2a9d8f', '#4361ee', '#f4845f', '#8338ec', '#e4572e'];
  bookRow(ctx, 52, 244, 300, bookColors, -1);
  bookRow(ctx, 52, 316, 380, [...bookColors].reverse(), applied.has('book-missing') ? 3 : -1);
  bookRow(ctx, 52, 396, 460, bookColors, -1);
  rect(ctx, 46, 294, 148, 8, '#4e342e');
  rect(ctx, 46, 374, 148, 8, '#4e342e');
  rect(ctx, 46, 454, 148, 8, '#4e342e');

  // The globe on its stand: blue seas and lands that can change colour.
  line(ctx, 232, 448, 232, 486, 7, '#3e2723');
  line(ctx, 210, 486, 254, 486, 7, '#3e2723');
  circle(ctx, 232, 414, 31, '#118ab2');
  const land = applied.has('globe-color') ? '#ef476f' : '#06d6a0';
  ellipse(ctx, 220, 402, 12, 8, land);
  ellipse(ctx, 244, 428, 10, 7, land);
  ellipse(ctx, 238, 398, 5, 4, land);
  line(ctx, 208, 446, 256, 382, 3, '#c89f6a');

  // The table with its potions and the candle that can go out.
  rect(ctx, 268, 436, 224, 14, '#4e342e');
  rect(ctx, 280, 450, 12, 44, '#3e2723');
  rect(ctx, 468, 450, 12, 44, '#3e2723');
  potion(ctx, 296, 436, 52, '#06d6a0');
  potion(ctx, 340, 436, 64, applied.has('potion-color') ? '#ff8c42' : '#8338ec');
  potion(ctx, 392, 436, 46, '#118ab2');
  rect(ctx, 454, 404, 16, 32, '#f4f1de');
  rect(ctx, 446, 432, 32, 6, '#c89f6a');
  line(ctx, 462, 404, 462, 396, 2.4, '#3e2723');
  if (!applied.has('candle-out')) {
    ellipse(ctx, 462, 386, 7, 12, '#ffb703');
    ellipse(ctx, 462, 390, 3.6, 6, '#ff8c42');
    const glow = ctx.createRadialGradient(462, 386, 2, 462, 386, 34);
    glow.addColorStop(0, 'rgba(255,183,3,0.35)');
    glow.addColorStop(1, 'rgba(255,183,3,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(428, 352, 68, 68);
  } else {
    ctx.beginPath();
    ctx.moveTo(462, 394);
    ctx.quadraticCurveTo(456, 382, 464, 374);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(220,220,220,0.7)';
    ctx.stroke();
  }

  // The owl on its perch: wide awake, unless its eyes have closed.
  rect(ctx, 514, 306, 9, 180, '#3e2723');
  line(ctx, 492, 486, 546, 486, 8, '#3e2723');
  line(ctx, 478, 300, 558, 300, 9, '#4e342e');
  ellipse(ctx, 517, 264, 27, 35, '#8d6e63');
  ellipse(ctx, 517, 276, 17, 22, '#d7ccc8');
  ellipse(ctx, 492, 262, 8, 24, '#6d4c41');
  ellipse(ctx, 542, 262, 8, 24, '#6d4c41');
  poly(ctx, [[498, 238], [492, 222], [508, 232]], '#6d4c41');
  poly(ctx, [[536, 238], [542, 222], [526, 232]], '#6d4c41');
  if (applied.has('owl-eyes')) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(508, 252, 6, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(526, 252, 6, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else {
    circle(ctx, 508, 252, 7.5, '#ffffff');
    circle(ctx, 526, 252, 7.5, '#ffffff');
    circle(ctx, 508, 252, 3.6, '#22223b');
    circle(ctx, 526, 252, 3.6, '#22223b');
  }
  poly(ctx, [[517, 258], [512, 264], [522, 264]], '#ffb703');
  line(ctx, 506, 300, 506, 308, 3, '#ffb703');
  line(ctx, 528, 300, 528, 308, 3, '#ffb703');

  // The telescope, angled up at the window.
  line(ctx, 470, 548, 448, 492, 6, '#3e2723');
  line(ctx, 470, 548, 492, 492, 6, '#3e2723');
  line(ctx, 470, 548, 470, 492, 6, '#3e2723');
  ctx.save();
  ctx.translate(470, 492);
  ctx.rotate(-0.9);
  rect(ctx, -52, -9, 74, 18, '#4361ee');
  rect(ctx, 22, -6, 14, 12, '#c89f6a');
  rect(ctx, -58, -11, 8, 22, '#c89f6a');
  ctx.restore();

  // The rug: striped, unless its pattern has turned to dots.
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(300, 532, 115, 36, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#a4133c';
  ctx.fill();
  ctx.clip();
  if (applied.has('rug-pattern')) {
    for (let ry = 508; ry <= 556; ry += 16) {
      for (let rx = 204; rx <= 396; rx += 24) circle(ctx, rx + ((ry / 16) % 2) * 12, ry, 5, '#ffd23f');
    }
  } else {
    for (let rx = 200; rx <= 400; rx += 26) rect(ctx, rx, 492, 11, 80, '#ffd23f');
  }
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(300, 532, 115, 36, 0, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7f1d1d';
  ctx.stroke();
}

/** Paint scene `sceneIndex` with the differences in `applied` switched on. */
export function paintScene(ctx, sceneIndex, applied) {
  if (sceneIndex === 1) paintLanternLane(ctx, applied);
  else if (sceneIndex === 2) paintWizardsAttic(ctx, applied);
  else paintCoralCove(ctx, applied);
}

// DOUBLE TAKE — the hand-in program for make.fun's best spot-the-difference game bounty.
//
// The game itself is the game/ folder beside this file: plain static files (an index.html and
// its ES modules) that a desktop browser plays offline, no library, no network. This program
// hands it in: it first checks the entry the way the scorer will (screenshots within their
// count and byte caps, game/ within its file and byte caps), then copies game/ and
// screenshots/ into the output directory and writes dossier.json there with the vendored
// make.fun library, which is what the judge reads.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The scorer's caps, restated here so this program refuses anything the scorer would refuse
// instead of handing in an entry that comes back invalid.
const SHOT_COUNT_MIN = 3;
const SHOT_COUNT_MAX = 4;
const SHOT_MAX_BYTES = 262144;
const GAME_MAX_FILES = 993;
const GAME_MAX_BYTES = 48 * 1024 * 1024;
const IMAGE_NAME = /\.(?:png|jpe?g)$/i;

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');

/**
 * Pre-flight check of screenshots/: the hand-in needs 3 or 4 image files and each must fit
 * the per-image byte cap. Returns the image names, in name order (the first is the cover).
 * Throws a clear error naming the offending file when the folder cannot be handed in.
 */
function checkScreenshots(dir: string): string[] {
  if (!existsSync(dir)) {
    throw new Error('screenshots/: no such folder — the hand-in needs 3 or 4 screenshots of the game');
  }
  const names = readdirSync(dir)
    .filter((name) => IMAGE_NAME.test(name))
    .sort();
  if (names.length < SHOT_COUNT_MIN || names.length > SHOT_COUNT_MAX) {
    throw new Error(
      `screenshots/: holds ${names.length} image files — the hand-in needs ${SHOT_COUNT_MIN} to ${SHOT_COUNT_MAX}`,
    );
  }
  for (const name of names) {
    const bytes = statSync(join(dir, name)).size;
    if (bytes > SHOT_MAX_BYTES) {
      throw new Error(`screenshots/${name}: ${bytes} bytes, over the ${SHOT_MAX_BYTES} a screenshot may be`);
    }
  }
  return names;
}

/**
 * Walk game/ once and measure it: how many entries it holds (files and directories counted
 * alike, as the platform counts them), how many files, and how many bytes the files come to.
 * Throws when either total is past the scorer's cap.
 */
function measureGame(dir: string): { entries: number; files: number; bytes: number } {
  let entries = 0;
  let files = 0;
  let bytes = 0;
  const stack: string[] = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const name of readdirSync(current)) {
      const path = join(current, name);
      const info = statSync(path);
      entries += 1;
      if (info.isDirectory()) {
        stack.push(path);
      } else {
        files += 1;
        bytes += info.size;
      }
    }
  }
  if (entries > GAME_MAX_FILES) {
    throw new Error(`game/: ${entries} files and directories, over the ${GAME_MAX_FILES} allowed`);
  }
  if (bytes > GAME_MAX_BYTES) {
    throw new Error(`game/: its files come to ${bytes} bytes, over the ${GAME_MAX_BYTES} allowed`);
  }
  return { entries, files, bytes };
}

const shotNames = checkScreenshots(shotsDir);
const gameStats = measureGame(gameDir);

// A one-line manifest of what is about to be handed in, so a run says what it did.
console.log(
  `double-take: ${gameStats.files} game files (${gameStats.bytes} bytes), screenshots: ${shotNames.join(', ')}`,
);

mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The caps handed to buildDossier are the scorer's own (its gate.json): only text_max_bytes
// shapes the dossier's bytes; the rest make this program fail where the scorer would refuse.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

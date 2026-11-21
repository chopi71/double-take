# double-take
[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/chopi71/double-take/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/chopi71/double-take/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**DOUBLE TAKE** is an original spot-the-difference game. Two near-identical pictures sit side by side; the right-hand one hides eight small changes, and you hunt them against a four-minute clock. Three scenes carry the hunt: **Coral Cove**, a sunny beach where a crab can lose a claw and a starfish an arm; **Lantern Lane**, a night-market street of paper lanterns, market stalls and a cat asleep on an awning; and **The Wizard's Attic**, a cozy room of potions, books and a watchful owl. Finds score 100 points and ring both pictures, finishing a scene banks a time bonus, a miss costs five seconds, and three hints a scene will pulse one unfound difference — for a price. The whole game is plain static files with no build step and no libraries: every picture is drawn with Canvas 2D code, every sound is synthesized with WebAudio oscillators, and the source is split into small modules with one job each (`scenes.js` paints, `differences.js` defines, `game-state.js` holds the rules, `panels.js` renders, `input.js`, `sound.js` and `shots.js` do what their names say).

## Run it

```sh
node serve.ts
# then open http://localhost:8080 to play; node main.ts hands the game in (copies game/ + screenshots/ and writes dossier.json)
```

## How to play

- Click a difference in **either** picture — the mirrored spot on the other panel works identically. A find rings the spot on both pictures, scores +100 and updates the counter ("Found X of 8 — Z to go").
- A click that hits nothing is a mistake: a red ✗ flashes, mistakes go up by one and five seconds come off the clock. Run out of time and the scene fails — retry it.
- Find all eight to complete the scene: the seconds left turn into a time bonus (×2) and the next scene opens. Finish all three scenes to see your final score.
- **H** — hint (or the Hint button): pulses a ring around one unfound difference on both panels; at most 3 per scene, each costs 25 points.
- **P** — pause (freezes the timer), **R** — restart the current scene, **M** — sound on/off. The header buttons do the same jobs.

<sub>Entered on [make.fun](https://make.fun/?ref=xhz2cc0t&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>

# Labirin Angka

A browser-based Indonesian arithmetic adventure. Solve the question, then guide your
light through a generated maze to the matching exit.

## Development

Use Node.js 20 or newer and npm.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview -- --host 0.0.0.0
```

`typecheck` checks the shared JavaScript game engine and its JSDoc profile/result
types. ESLint checks all JavaScript/JSX, including React hook dependencies.
`npm run format` formats the source. No pre-commit hooks are configured.

Deploy the generated `dist` directory to a static host that rewrites unknown paths
to `index.html`. `public/_redirects` includes the Netlify-compatible SPA fallback.
No backend, account, or environment secrets are required.

## Play

- Move with arrow keys, WASD, on-screen direction buttons, or drag along a corridor.
- Each expedition has five questions. Correct answers award 20 points.
- Scores of 60, 80, and 100 award one, two, and three stars. One star unlocks the next world.
- Santai, Petualang, and Ahli use 7×7, 9×9, and 11×11 mazes, with increasing arithmetic difficulty.
  Ahli mazes are covered in fog that lifts only around cells you have walked through.
- Every maze hides three crystals in dead ends. Each collected crystal is worth 3 XP
  before the difficulty multiplier.
- There is no time limit. Escape pauses play; hiding the browser tab also pauses.
- Hints illuminate the correct route. Each hint deducts 10 XP before the difficulty multiplier.
- XP is `max(0, round((score + bestStreak * 5 + crystals * 3 - hints * 10) * multiplier))`.
- Total XP determines the explorer rank: Pemula, Penjelajah (200), Pemandu Jalur (600),
  Penjaga Gerbang (1400), Ahli Labirin (3000), Legenda Hutan (6000).
- Daily expeditions use a UTC-date seed and fixed Petualang difficulty. They cover
  all five operations; the first completion awards normal XP plus 50 bonus XP.
  Further attempts that day are practice and award no XP. Consecutive daily
  completions build a streak shown on the daily page.
- The result screen shows a per-gate pattern and can share a three-line summary
  via the Web Share API or the clipboard.
- Sound is off initially. Enable it with the header sound button.

## Persistence and assets

Progress is stored locally under `labirin-expedition-v1`; browser storage is not
an online account. Existing `math-game-react` names and `math-game-hs-*` scores are
imported on first launch. Old storage keys are not deleted. Active expeditions are
not saved, but completed results survive reload.

The generated forest and realm illustrations are bundled WebP assets in `public`.
Fonts and the original background music are bundled locally; no external asset
service is required at runtime.

## Game engine

`src/Components/gameEngine.js` contains seeded question/maze generation, pathfinding,
progression, persistence validation, and achievement rules. The maze generator
builds a spanning tree while reserving each answer exit as a leaf; reaching one
exit never requires passing through another. Unit tests check connectivity,
reciprocal walls, legal movement, exact arithmetic, deterministic daily runs,
crystal placement, ranks, daily streaks, share text, progression, reward
deduplication, and corrupt/legacy storage.

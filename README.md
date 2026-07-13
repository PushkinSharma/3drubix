# 3dRubix

A playable 3×3 Rubik’s Cube in the browser. Drag to look around, turn faces with buttons or the keyboard, scramble, and reset.

Built with React, TypeScript, Vite, and Three.js.

**Live demo:** [pushkinsharma.github.io/3drubix](https://pushkinsharma.github.io/3drubix/)

## Try it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

| Command | What it does |
|---------|----------------|
| `npm run dev` | Local development server |
| `npm run build` | Type-check and production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run cube logic unit tests |

Needs a recent Node.js (Vite 7).

## How to play

| Action | How |
|--------|-----|
| Orbit the camera | Drag on the cube |
| Turn a face | Click `U` `D` `L` `R` `F` `B` (or the primed buttons) |
| Reverse a turn | Hold **Shift** + the same key, or click the `'` button |
| Scramble | **Scramble** (20 random moves, animated in sequence) |
| Reset to solved | **Reset** |
| Reset camera | **Snap view** or press `0` |

Face letters: **U**p, **D**own, **L**eft, **R**ight, **F**ront, **B**ack. Turns queue if you click while one is still animating.

## What’s in the box

- Procedural 3D cube (27 cubies, sticker colors)
- Smooth face-turn animations with a move queue
- Correct face-turn logic for all 12 basic moves
- Scramble + reset
- Move history and solved / in-progress status
- Orbit camera with snap-to-default view
- Unit tests for cube math (`npm test`)

Cube math lives in `src/lib/cube.ts`. The 3D scene is in `src/components/RubiksCubeScene.tsx`. UI and controls are in `src/App.tsx`.

## Not done yet

Useful next steps:

1. **Drag / touch to turn faces** — today turns are buttons and keys only
2. **Timer and move counter**
3. **Undo**

Multiplayer (shared rooms, race modes) is a later idea once solo play feels solid.

## Project layout

```
src/
  App.tsx                      # Controls, move queue, app state
  components/RubiksCubeScene.tsx
  lib/cube.ts                  # Moves, scramble, solved check
  lib/cube.test.ts
  styles.css
```

## License

MIT — see [LICENSE](LICENSE).

## Contributing

Issues and PRs are welcome. Keep changes focused; timer, undo, or face drag gestures are clear wins.

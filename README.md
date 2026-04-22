# 3dRubix

An MVP scaffold for a browser-based Rubik's Cube experience that can grow into a multiplayer puzzle game.

## Recommended stack

- `React + TypeScript`: fast UI iteration and a clean component model.
- `Vite`: the simplest modern frontend setup for local development.
- `three` + `@react-three/fiber` + `@react-three/drei`: browser 3D rendering, camera controls, and scene helpers without building a game engine from scratch.

## Why this stack fits your experience level

If you are new to 3D projects, the most forgiving path is **web-first 3D**, not Unity or Unreal.

- You stay in familiar frontend tooling.
- You can ship an MVP in the browser quickly.
- Multiplayer later is easier because the game state can be shared as move events over WebSockets.

## How the 3D modelling will be done

For the MVP, do **procedural modelling in code** instead of making a detailed model in Blender.

- The cube is built from 27 smaller cubies.
- Each cubie has sticker colors assigned to visible faces.
- Rotations update cubie positions and sticker orientation in code.
- Camera orbit gives the "swipe in 360 degrees" experience.
- Face-turn buttons are a temporary control mechanism until we add in-scene arrows or touch gestures.

This is the right choice because a Rubik's Cube is mostly logic and interaction, not complex artistic modelling.

## Multiplayer direction after MVP

When the solo prototype feels good, add:

- `Socket.IO` or `Colyseus` for rooms and synchronized moves.
- A shared cube state on the server.
- Timers, matchmaking, leaderboards, and race modes.

The clean boundary is:

- client: rendering, input, animations
- server: room state, authoritative move stream, game rules

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Current scaffold includes

- Vite + React + TypeScript project setup
- 3D cube scene with orbit controls
- Deterministic cube move logic
- Face rotation buttons for MVP gameplay
- Scramble and reset controls

## Next recommended steps

1. Add smooth turn animations instead of instant state swaps.
2. Replace buttons with face arrows and drag gestures.
3. Add a timer and move counter.
4. Extract cube state into a store for replay and multiplayer sync.
5. Add a Node.js realtime server once the solo gameplay feels right.

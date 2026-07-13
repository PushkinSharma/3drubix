import { useEffect, useState } from "react";
import { RubiksCubeScene } from "./components/RubiksCubeScene";
import {
  applyMove,
  createScrambleMoves,
  createSolvedCube,
  isSolved,
  type Move,
} from "./lib/cube";

const MOVE_PAIRS: Array<{ forward: Move; reverse: Move }> = [
  { forward: "U", reverse: "U'" },
  { forward: "D", reverse: "D'" },
  { forward: "L", reverse: "L'" },
  { forward: "R", reverse: "R'" },
  { forward: "F", reverse: "F'" },
  { forward: "B", reverse: "B'" },
];

const KEY_TO_MOVE: Record<string, { forward: Move; reverse: Move }> = {
  u: { forward: "U", reverse: "U'" },
  d: { forward: "D", reverse: "D'" },
  l: { forward: "L", reverse: "L'" },
  r: { forward: "R", reverse: "R'" },
  f: { forward: "F", reverse: "F'" },
  b: { forward: "B", reverse: "B'" },
};

const NORMAL_TURN_MS = 220;
const QUEUE_TURN_MS = 130;

export default function App() {
  const [cubies, setCubies] = useState(createSolvedCube);
  const [moveQueue, setMoveQueue] = useState<Move[]>([]);
  const [animatingMove, setAnimatingMove] = useState<Move | null>(null);
  const [lastMoves, setLastMoves] = useState<Move[]>([]);
  const [snapVersion, setSnapVersion] = useState(0);
  const solved = isSolved(cubies) && !animatingMove && moveQueue.length === 0;
  const queuedAhead = moveQueue.length + (animatingMove ? 1 : 0);
  const animationDurationMs =
    queuedAhead > 1 ? QUEUE_TURN_MS : NORMAL_TURN_MS;

  useEffect(() => {
    if (animatingMove !== null || moveQueue.length === 0) {
      return;
    }

    const [next, ...rest] = moveQueue;
    setAnimatingMove(next);
    setMoveQueue(rest);
  }, [animatingMove, moveQueue]);

  function enqueueMoves(moves: Move[]) {
    if (moves.length === 0) {
      return;
    }

    setMoveQueue((current) => [...current, ...moves]);
    setLastMoves((current) => [...current, ...moves].slice(-16));
  }

  function enqueueMove(move: Move) {
    enqueueMoves([move]);
  }

  function handleMoveAnimationComplete(move: Move) {
    setCubies((current) => applyMove(current, move));
    setAnimatingMove(null);
  }

  function resetCube() {
    setMoveQueue([]);
    setAnimatingMove(null);
    setCubies(createSolvedCube());
    setLastMoves([]);
  }

  function scrambleCube() {
    enqueueMoves(createScrambleMoves(20));
  }

  function snapView() {
    setSnapVersion((current) => current + 1);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const mapping = KEY_TO_MOVE[key];

      if (mapping) {
        event.preventDefault();
        const move = event.shiftKey ? mapping.reverse : mapping.forward;

        enqueueMove(move);
        return;
      }

      if (key === "0") {
        event.preventDefault();
        snapView();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="workspace-grid">
        <div className="scene-panel">
          <div className="scene-topbar">
            <p className="brand-mark">3dRubix</p>
            <span className={`status-pill ${solved ? "solved" : "mixing"}`}>
              {solved ? "Solved" : "In progress"}
            </span>
          </div>

          <RubiksCubeScene
            cubies={cubies}
            animatingMove={animatingMove}
            animationDurationMs={animationDurationMs}
            onMoveAnimationComplete={handleMoveAnimationComplete}
            snapVersion={snapVersion}
          />

          <div className="scene-footer">
            <p className="move-history">
              {lastMoves.length > 0 ? lastMoves.join(" ") : "No moves yet"}
            </p>
          </div>
        </div>

        <aside className="control-panel">
          <div className="control-header">
            <p className="panel-label">Controls</p>
            <h2>Play</h2>
          </div>

          <div className="action-stack">
            <button type="button" onClick={scrambleCube}>
              Scramble
            </button>
            <button type="button" className="ghost-button" onClick={resetCube}>
              Reset
            </button>
            <button type="button" className="ghost-button" onClick={snapView}>
              Snap view
            </button>
          </div>

          <div className="moves-grid">
            {MOVE_PAIRS.map((pair) => (
              <div className="move-pair" key={pair.forward}>
                <button
                  type="button"
                  className={
                    animatingMove === pair.forward ? "active-button" : undefined
                  }
                  onClick={() => enqueueMove(pair.forward)}
                >
                  {pair.forward}
                </button>
                <button
                  type="button"
                  className={`ghost-button ${animatingMove === pair.reverse ? "active-button" : ""}`.trim()}
                  onClick={() => enqueueMove(pair.reverse)}
                >
                  {pair.reverse}
                </button>
              </div>
            ))}
          </div>

          <p className="control-hint">
            Keys: U D L R F B, Shift + key, 0 to snap. Turns queue while one is
            animating.
          </p>
        </aside>
      </section>
    </main>
  );
}

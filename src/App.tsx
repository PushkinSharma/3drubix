import { useEffect, useState } from "react";
import { RubiksCubeScene } from "./components/RubiksCubeScene";
import {
  applyMove,
  applyMoves,
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

export default function App() {
  const [cubies, setCubies] = useState(createSolvedCube);
  const [lastMoves, setLastMoves] = useState<Move[]>([]);
  const [activeMove, setActiveMove] = useState<Move | null>(null);
  const [snapVersion, setSnapVersion] = useState(0);
  const solved = isSolved(cubies);

  function runMove(move: Move) {
    setCubies((current) => applyMove(current, move));
    setLastMoves((current) => [...current, move].slice(-16));
    setActiveMove(move);
  }

  function resetCube() {
    setCubies(createSolvedCube());
    setLastMoves([]);
    setActiveMove(null);
  }

  function scrambleCube() {
    const moves = createScrambleMoves(20);

    setCubies((current) => applyMoves(current, moves));
    setLastMoves(moves.slice(-16));
    setActiveMove(moves.at(-1) ?? null);
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

        runMove(move);
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
            highlightedMove={activeMove}
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
                  className={activeMove === pair.forward ? "active-button" : undefined}
                  onClick={() => runMove(pair.forward)}
                >
                  {pair.forward}
                </button>
                <button
                  type="button"
                  className={`ghost-button ${activeMove === pair.reverse ? "active-button" : ""}`.trim()}
                  onClick={() => runMove(pair.reverse)}
                >
                  {pair.reverse}
                </button>
              </div>
            ))}
          </div>

          <p className="control-hint">Keys: U D L R F B, Shift + key, 0 to snap.</p>
        </aside>
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { RubiksCubeScene } from "./components/RubiksCubeScene";
import {
  ALL_MOVES,
  applyMove,
  applyMoves,
  createScrambleMoves,
  createSolvedCube,
  FACE_INFO,
  getFaceInfoForMove,
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
  const [previewMove, setPreviewMove] = useState<Move | null>(null);
  const [snapVersion, setSnapVersion] = useState(0);
  const solved = isSolved(cubies);
  const previewFace = previewMove ? getFaceInfoForMove(previewMove) : null;

  function runMove(move: Move) {
    setCubies((current) => applyMove(current, move));
    setLastMoves((current) => [...current, move].slice(-16));
  }

  function resetCube() {
    setCubies(createSolvedCube());
    setLastMoves([]);
  }

  function scrambleCube() {
    const moves = createScrambleMoves(20);

    setCubies((current) => applyMoves(current, moves));
    setLastMoves(moves.slice(-16));
  }

  function snapView() {
    setSnapVersion((current) => current + 1);
  }

  useEffect(() => {
    let previewTimeout = 0;

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

        setCubies((current) => applyMove(current, move));
        setLastMoves((current) => [...current, move].slice(-16));
        setPreviewMove(move);
        window.clearTimeout(previewTimeout);
        previewTimeout = window.setTimeout(() => {
          setPreviewMove((current) => (current === move ? null : current));
        }, 280);
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
      window.clearTimeout(previewTimeout);
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">3dRubix MVP</p>
          <h1>Start with a browser puzzle, not a full 3D game pipeline.</h1>
          <p className="lede">
            This first scaffold uses procedural 3D pieces, orbit controls for
            360-degree viewing, and layer-rotation buttons so we can validate
            gameplay before adding drag gestures, timers, and multiplayer rooms.
          </p>
        </div>

        <div className="status-card">
          <span className={`status-pill ${solved ? "solved" : "mixing"}`}>
            {solved ? "Solved state" : "Puzzle in progress"}
          </span>
          <p>
            Drag anywhere in the scene to orbit. Face notation stays fixed to the
            cube itself, not to the camera, so the scene now labels each side for
            you.
          </p>
          <div className="action-row">
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
          <p className="move-history">
            Recent moves: {lastMoves.length > 0 ? lastMoves.join(" ") : "none yet"}
          </p>
        </div>
      </section>

      <section className="workspace-grid">
        <RubiksCubeScene
          cubies={cubies}
          highlightedMove={previewMove}
          snapVersion={snapVersion}
        />

        <aside className="control-panel">
          <div>
            <p className="panel-label">Move controls</p>
            <h2>Face turns</h2>
            <p className="panel-text">
              Hover a move to preview the affected layer. Press the matching key
              to turn that face, or hold Shift for the reverse turn.
            </p>
          </div>

          <div className="legend-card focus-card">
            <p className="panel-label">Active face</p>
            {previewFace ? (
              <>
                <p className="focus-title">
                  {previewFace.notation} = {previewFace.name}
                </p>
                <p className="focus-copy">
                  This move rotates the {previewFace.name.toLowerCase()} face,
                  which starts as the {previewFace.color} side in the solved cube.
                </p>
              </>
            ) : (
              <>
                <p className="focus-title">Pick a move or press a key</p>
                <p className="focus-copy">
                  The cube labels show the fixed faces: U, D, L, R, F, and B.
                  If you get lost after orbiting, use Snap view or press `0`.
                </p>
              </>
            )}
          </div>

          <div className="moves-grid">
            {MOVE_PAIRS.map((pair) => (
              <div className="move-pair" key={pair.forward}>
                <button
                  type="button"
                  className={previewMove === pair.forward ? "active-button" : undefined}
                  onClick={() => runMove(pair.forward)}
                  onMouseEnter={() => setPreviewMove(pair.forward)}
                  onMouseLeave={() => setPreviewMove(null)}
                  onFocus={() => setPreviewMove(pair.forward)}
                  onBlur={() => setPreviewMove(null)}
                >
                  {pair.forward}
                </button>
                <button
                  type="button"
                  className={`ghost-button ${previewMove === pair.reverse ? "active-button" : ""}`.trim()}
                  onClick={() => runMove(pair.reverse)}
                  onMouseEnter={() => setPreviewMove(pair.reverse)}
                  onMouseLeave={() => setPreviewMove(null)}
                  onFocus={() => setPreviewMove(pair.reverse)}
                  onBlur={() => setPreviewMove(null)}
                >
                  {pair.reverse}
                </button>
              </div>
            ))}
          </div>

          <div className="legend-card">
            <p className="panel-label">Keyboard</p>
            <p className="move-list">U D L R F B = forward turns</p>
            <p className="move-list">Shift + key = reverse turns</p>
            <p className="move-list">0 = snap back to the default view</p>
          </div>

          <div className="legend-card">
            <p className="panel-label">Fixed face map</p>
            <p className="move-list">
              {[
                FACE_INFO.py,
                FACE_INFO.ny,
                FACE_INFO.nx,
                FACE_INFO.px,
                FACE_INFO.pz,
                FACE_INFO.nz,
              ]
                .map((face) => `${face.notation}=${face.name}`)
                .join("  ")}
            </p>
            <p className="move-list">Moves: {ALL_MOVES.join("  ")}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

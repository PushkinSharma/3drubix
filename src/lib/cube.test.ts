import { describe, expect, it } from "vitest";
import {
  ALL_MOVES,
  applyMove,
  applyMoves,
  createScrambleMoves,
  createSolvedCube,
  getFaceInfoForMove,
  getMoveFace,
  getMoveRotation,
  invertMove,
  isCubieInMoveLayer,
  isSolved,
  type Cubie,
  type Move,
} from "./cube";

function sortedCubieSnapshot(cubies: Cubie[]) {
  return [...cubies]
    .map((cubie) => ({
      id: cubie.id,
      position: cubie.position,
      stickers: cubie.stickers,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

describe("createSolvedCube", () => {
  it("builds 27 cubies and reports solved", () => {
    const cube = createSolvedCube();

    expect(cube).toHaveLength(27);
    expect(isSolved(cube)).toBe(true);
  });
});

describe("applyMove", () => {
  it("keeps every face turn invertible", () => {
    for (const move of ALL_MOVES) {
      const after = applyMove(createSolvedCube(), move);
      const restored = applyMove(after, invertMove(move));

      expect(isSolved(restored)).toBe(true);
      expect(sortedCubieSnapshot(restored)).toEqual(
        sortedCubieSnapshot(createSolvedCube()),
      );
    }
  });

  it("returns a solved cube after four identical quarter turns", () => {
    for (const move of ALL_MOVES) {
      const after = applyMoves(createSolvedCube(), [move, move, move, move]);

      expect(isSolved(after)).toBe(true);
    }
  });

  it("marks the cube unsolved after a single turn", () => {
    expect(isSolved(applyMove(createSolvedCube(), "R"))).toBe(false);
  });
});

describe("createScrambleMoves", () => {
  it("returns the requested length with no consecutive same-face moves", () => {
    const moves = createScrambleMoves(40);

    expect(moves).toHaveLength(40);

    for (let index = 1; index < moves.length; index += 1) {
      expect(moves[index][0]).not.toBe(moves[index - 1][0]);
    }
  });

  it("scrambles into an unsolved state for typical length", () => {
    const moves = createScrambleMoves(20);
    const scrambled = applyMoves(createSolvedCube(), moves);

    expect(isSolved(scrambled)).toBe(false);
  });
});

describe("move helpers", () => {
  it("maps moves to faces and layer membership", () => {
    expect(getMoveFace("U")).toBe("py");
    expect(getFaceInfoForMove("R").notation).toBe("R");
    expect(getMoveRotation("F")).toEqual({
      axis: "z",
      layer: 1,
      turns: -1,
    });

    const cube = createSolvedCube();
    const topLayer = cube.filter((cubie) => isCubieInMoveLayer(cubie, "U"));

    expect(topLayer).toHaveLength(9);
    expect(topLayer.every((cubie) => cubie.position.y === 1)).toBe(true);
  });

  it("inverts primed and unprimed moves", () => {
    expect(invertMove("U")).toBe("U'");
    expect(invertMove("U'")).toBe("U");
  });
});

describe("applyMoves", () => {
  it("applies a sequence in order", () => {
    const sequence: Move[] = ["R", "U", "R'", "U'"];
    const once = applyMoves(createSolvedCube(), sequence);
    const twice = applyMoves(once, sequence);
    const thrice = applyMoves(twice, sequence);
    const four = applyMoves(thrice, sequence);

    // Sexy move has order 6; after 6 cycles we are solved — smoke-check partial.
    expect(isSolved(once)).toBe(false);
    expect(sortedCubieSnapshot(four)).not.toEqual(
      sortedCubieSnapshot(createSolvedCube()),
    );

    const six = applyMoves(four, [...sequence, ...sequence]);
    expect(isSolved(six)).toBe(true);
  });
});

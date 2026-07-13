export type Direction = "px" | "nx" | "py" | "ny" | "pz" | "nz";

export type StickerColor =
  | "white"
  | "yellow"
  | "red"
  | "orange"
  | "green"
  | "blue";

export type Move =
  | "U"
  | "U'"
  | "D"
  | "D'"
  | "L"
  | "L'"
  | "R"
  | "R'"
  | "F"
  | "F'"
  | "B"
  | "B'";

export type Axis = "x" | "y" | "z";

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type MoveRotation = {
  axis: Axis;
  layer: -1 | 0 | 1;
  /** Quarter-turns using the right-hand rule (+1 = 90° around the axis). */
  turns: -1 | 1;
};

export type FaceInfo = {
  direction: Direction;
  notation: "U" | "D" | "L" | "R" | "F" | "B";
  name: string;
  color: StickerColor;
};

export type Cubie = {
  id: string;
  position: Vector3;
  stickers: Partial<Record<Direction, StickerColor>>;
};

export const ALL_MOVES: Move[] = [
  "U",
  "U'",
  "D",
  "D'",
  "L",
  "L'",
  "R",
  "R'",
  "F",
  "F'",
  "B",
  "B'",
];

const FACE_COLORS: Record<Direction, StickerColor> = {
  px: "red",
  nx: "orange",
  py: "white",
  ny: "yellow",
  pz: "green",
  nz: "blue",
};

const MOVE_TO_ROTATION: Record<Move, MoveRotation> = {
  U: { axis: "y", layer: 1, turns: -1 },
  "U'": { axis: "y", layer: 1, turns: 1 },
  D: { axis: "y", layer: -1, turns: 1 },
  "D'": { axis: "y", layer: -1, turns: -1 },
  L: { axis: "x", layer: -1, turns: 1 },
  "L'": { axis: "x", layer: -1, turns: -1 },
  R: { axis: "x", layer: 1, turns: -1 },
  "R'": { axis: "x", layer: 1, turns: 1 },
  F: { axis: "z", layer: 1, turns: -1 },
  "F'": { axis: "z", layer: 1, turns: 1 },
  B: { axis: "z", layer: -1, turns: 1 },
  "B'": { axis: "z", layer: -1, turns: -1 },
};

export const FACE_INFO: Record<Direction, FaceInfo> = {
  px: { direction: "px", notation: "R", name: "Right", color: "red" },
  nx: { direction: "nx", notation: "L", name: "Left", color: "orange" },
  py: { direction: "py", notation: "U", name: "Up", color: "white" },
  ny: { direction: "ny", notation: "D", name: "Down", color: "yellow" },
  pz: { direction: "pz", notation: "F", name: "Front", color: "green" },
  nz: { direction: "nz", notation: "B", name: "Back", color: "blue" },
};

const MOVE_FACE_BY_LETTER: Record<FaceInfo["notation"], Direction> = {
  U: "py",
  D: "ny",
  L: "nx",
  R: "px",
  F: "pz",
  B: "nz",
};

export const COLOR_HEX: Record<StickerColor, string> = {
  white: "#f8fafc",
  yellow: "#facc15",
  red: "#ef4444",
  orange: "#f97316",
  green: "#22c55e",
  blue: "#3b82f6",
};

const DIRECTION_VECTORS: Record<Direction, Vector3> = {
  px: { x: 1, y: 0, z: 0 },
  nx: { x: -1, y: 0, z: 0 },
  py: { x: 0, y: 1, z: 0 },
  ny: { x: 0, y: -1, z: 0 },
  pz: { x: 0, y: 0, z: 1 },
  nz: { x: 0, y: 0, z: -1 },
};

export function createSolvedCube(): Cubie[] {
  const cubies: Cubie[] = [];

  for (const x of [-1, 0, 1] as const) {
    for (const y of [-1, 0, 1] as const) {
      for (const z of [-1, 0, 1] as const) {
        const stickers: Partial<Record<Direction, StickerColor>> = {};

        if (x === 1) stickers.px = FACE_COLORS.px;
        if (x === -1) stickers.nx = FACE_COLORS.nx;
        if (y === 1) stickers.py = FACE_COLORS.py;
        if (y === -1) stickers.ny = FACE_COLORS.ny;
        if (z === 1) stickers.pz = FACE_COLORS.pz;
        if (z === -1) stickers.nz = FACE_COLORS.nz;

        cubies.push({
          id: `${x}${y}${z}`,
          position: { x, y, z },
          stickers,
        });
      }
    }
  }

  return cubies;
}

export function applyMove(cubies: Cubie[], move: Move): Cubie[] {
  const rotation = MOVE_TO_ROTATION[move];

  return cubies.map((cubie) => {
    if (cubie.position[rotation.axis] !== rotation.layer) {
      return {
        ...cubie,
        position: { ...cubie.position },
        stickers: { ...cubie.stickers },
      };
    }

    const nextStickers: Partial<Record<Direction, StickerColor>> = {};

    for (const [direction, color] of Object.entries(cubie.stickers) as [
      Direction,
      StickerColor,
    ][]) {
      nextStickers[rotateDirection(direction, rotation.axis, rotation.turns)] =
        color;
    }

    return {
      ...cubie,
      position: rotateVector(cubie.position, rotation.axis, rotation.turns),
      stickers: nextStickers,
    };
  });
}

export function applyMoves(cubies: Cubie[], moves: Move[]): Cubie[] {
  return moves.reduce((current, move) => applyMove(current, move), cubies);
}

export function createScrambleMoves(length = 20): Move[] {
  const moves: Move[] = [];

  while (moves.length < length) {
    const candidate = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];
    const previous = moves.at(-1);

    if (previous && previous[0] === candidate[0]) {
      continue;
    }

    moves.push(candidate);
  }

  return moves;
}

export function isSolved(cubies: Cubie[]): boolean {
  return cubies.every((cubie) => {
    if (cubie.position.x === 1 && cubie.stickers.px !== FACE_COLORS.px) {
      return false;
    }
    if (cubie.position.x === -1 && cubie.stickers.nx !== FACE_COLORS.nx) {
      return false;
    }
    if (cubie.position.y === 1 && cubie.stickers.py !== FACE_COLORS.py) {
      return false;
    }
    if (cubie.position.y === -1 && cubie.stickers.ny !== FACE_COLORS.ny) {
      return false;
    }
    if (cubie.position.z === 1 && cubie.stickers.pz !== FACE_COLORS.pz) {
      return false;
    }
    if (cubie.position.z === -1 && cubie.stickers.nz !== FACE_COLORS.nz) {
      return false;
    }

    return true;
  });
}

export function getMoveFace(move: Move): Direction {
  return MOVE_FACE_BY_LETTER[move[0] as FaceInfo["notation"]];
}

export function getMoveRotation(move: Move): MoveRotation {
  return MOVE_TO_ROTATION[move];
}

export function getFaceInfoForMove(move: Move): FaceInfo {
  return FACE_INFO[getMoveFace(move)];
}

export function isCubieInMoveLayer(cubie: Cubie, move: Move): boolean {
  const rotation = MOVE_TO_ROTATION[move];

  return cubie.position[rotation.axis] === rotation.layer;
}

/** Inverse of a face turn (U ↔ U', etc.). */
export function invertMove(move: Move): Move {
  return move.endsWith("'")
    ? (move.slice(0, -1) as Move)
    : (`${move}'` as Move);
}

function rotateDirection(
  direction: Direction,
  axis: Axis,
  turns: -1 | 1,
): Direction {
  const rotated = rotateVector(DIRECTION_VECTORS[direction], axis, turns);

  return vectorToDirection(rotated);
}

function rotateVector(
  vector: Vector3,
  axis: Axis,
  turns: -1 | 1,
): Vector3 {
  let next = { ...vector };
  const steps = Math.abs(turns);

  for (let index = 0; index < steps; index += 1) {
    next = turns > 0 ? rotatePositive(next, axis) : rotateNegative(next, axis);
  }

  return next;
}

function rotatePositive(vector: Vector3, axis: Axis): Vector3 {
  switch (axis) {
    case "x":
      return { x: vector.x, y: -vector.z, z: vector.y };
    case "y":
      return { x: vector.z, y: vector.y, z: -vector.x };
    case "z":
      return { x: -vector.y, y: vector.x, z: vector.z };
    default:
      return vector;
  }
}

function rotateNegative(vector: Vector3, axis: Axis): Vector3 {
  switch (axis) {
    case "x":
      return { x: vector.x, y: vector.z, z: -vector.y };
    case "y":
      return { x: -vector.z, y: vector.y, z: vector.x };
    case "z":
      return { x: vector.y, y: -vector.x, z: vector.z };
    default:
      return vector;
  }
}

function vectorToDirection(vector: Vector3): Direction {
  if (vector.x === 1) return "px";
  if (vector.x === -1) return "nx";
  if (vector.y === 1) return "py";
  if (vector.y === -1) return "ny";
  if (vector.z === 1) return "pz";
  return "nz";
}

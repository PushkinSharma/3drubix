import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Cubie, Direction, Move, StickerColor } from "../lib/cube";
import {
  COLOR_HEX,
  FACE_INFO,
  getMoveFace,
  isCubieInMoveLayer,
} from "../lib/cube";

type RubiksCubeSceneProps = {
  cubies: Cubie[];
  highlightedMove: Move | null;
  snapVersion: number;
};

type StickerTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
};

const STICKER_TRANSFORMS: Record<Direction, StickerTransform> = {
  px: { position: [0.49, 0, 0], rotation: [0, Math.PI / 2, 0] },
  nx: { position: [-0.49, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  py: { position: [0, 0.49, 0], rotation: [-Math.PI / 2, 0, 0] },
  ny: { position: [0, -0.49, 0], rotation: [Math.PI / 2, 0, 0] },
  pz: { position: [0, 0, 0.49], rotation: [0, 0, 0] },
  nz: { position: [0, 0, -0.49], rotation: [0, Math.PI, 0] },
};

const FACE_LABEL_TRANSFORMS: Record<
  Direction,
  { position: [number, number, number]; color: string }
> = {
  px: { position: [4.15, 0, 0], color: COLOR_HEX.red },
  nx: { position: [-4.15, 0, 0], color: COLOR_HEX.orange },
  py: { position: [0, 4.15, 0], color: COLOR_HEX.white },
  ny: { position: [0, -4.15, 0], color: COLOR_HEX.yellow },
  pz: { position: [0, 0, 4.15], color: COLOR_HEX.green },
  nz: { position: [0, 0, -4.15], color: COLOR_HEX.blue },
};

export function RubiksCubeScene({
  cubies,
  highlightedMove,
  snapVersion,
}: RubiksCubeSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const highlightedFace = highlightedMove ? getMoveFace(highlightedMove) : null;

  useEffect(() => {
    controlsRef.current?.reset();
  }, [snapVersion]);

  return (
    <div className="scene-shell">
      <Canvas
        camera={{ position: [6.5, 6, 7], fov: 42 }}
        shadows
      >
        <color attach="background" args={["#0b1120"]} />
        <ambientLight intensity={1.3} />
        <directionalLight
          castShadow
          intensity={2.1}
          position={[7, 10, 6]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight intensity={0.7} position={[-5, -2, -6]} />

        <group rotation={[-0.35, 0.55, 0]}>
          {cubies.map((cubie) => (
            <CubieMesh
              key={cubie.id}
              cubie={cubie}
              isHighlighted={highlightedMove ? isCubieInMoveLayer(cubie, highlightedMove) : false}
            />
          ))}
          <FaceLabels highlightedFace={highlightedFace} />
        </group>

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
          <planeGeometry args={[18, 18]} />
          <shadowMaterial transparent opacity={0.25} />
        </mesh>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          enablePan={false}
          minDistance={5}
          maxDistance={14}
          rotateSpeed={0.9}
        />
      </Canvas>
    </div>
  );
}

function CubieMesh({
  cubie,
  isHighlighted,
}: {
  cubie: Cubie;
  isHighlighted: boolean;
}) {
  return (
    <group
      position={[cubie.position.x * 1.08, cubie.position.y * 1.08, cubie.position.z * 1.08]}
      scale={isHighlighted ? 1.04 : 1}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.94, 0.94, 0.94]} />
        <meshStandardMaterial
          color={isHighlighted ? "#1f2937" : "#111827"}
          emissive={isHighlighted ? "#0ea5e9" : "#000000"}
          emissiveIntensity={isHighlighted ? 0.35 : 0}
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      {(Object.entries(cubie.stickers) as [Direction, StickerColor][]).map(
        ([direction, color]) => {
          const transform = STICKER_TRANSFORMS[direction];

          return (
            <mesh
              key={`${cubie.id}-${direction}`}
              position={transform.position}
              rotation={transform.rotation}
            >
              <planeGeometry args={[0.66, 0.66]} />
              <meshStandardMaterial
                color={COLOR_HEX[color]}
                emissive={isHighlighted ? COLOR_HEX[color] : "#000000"}
                emissiveIntensity={isHighlighted ? 0.1 : 0}
                metalness={0.12}
                roughness={0.28}
              />
            </mesh>
          );
        },
      )}
    </group>
  );
}

function FaceLabels({ highlightedFace }: { highlightedFace: Direction | null }) {
  return (
    <>
      {(Object.entries(FACE_INFO) as [Direction, (typeof FACE_INFO)[Direction]][]).map(
        ([direction, face]) => {
          const transform = FACE_LABEL_TRANSFORMS[direction];
          const active = highlightedFace === direction;

          return (
            <group key={direction} position={transform.position}>
              <Text
                color={active ? "#f8fafc" : transform.color}
                fontSize={active ? 0.54 : 0.44}
                anchorX="center"
                anchorY="middle"
                outlineColor="#020617"
                outlineWidth={0.06}
              >
                {`${face.notation} ${face.name}`}
              </Text>
            </group>
          );
        },
      )}
    </>
  );
}

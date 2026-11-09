"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import {
  sectionColors,
  themes,
  type SectionId,
  type ThemeName,
} from "@design/tokens";
import type { DiagramVisual } from "@data/slides";

interface Palette {
  accent: string;
  line: string;
  text: string;
  muted: string;
  surface: string;
}

const paletteFor = (theme: ThemeName, sectionId: SectionId): Palette => ({
  accent: sectionColors[theme][sectionId],
  line: themes[theme].lineStrong,
  text: themes[theme].text,
  muted: themes[theme].muted,
  surface: themes[theme].surface,
});

interface SceneProps {
  active: boolean;
  palette: Palette;
}

function Rig({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!active || !ref.current) {
      return;
    }
    const time = clock.elapsedTime;
    ref.current.rotation.y = Math.sin(time * 0.11) * 0.18 + pointer.x * 0.2;
    ref.current.rotation.x = -0.06 + Math.cos(time * 0.09) * 0.05 + pointer.y * 0.1;
  });

  return (
    <group ref={ref} rotation={[-0.06, 0, 0]}>
      {children}
    </group>
  );
}

function PersonaShell({
  index,
  active,
  palette,
}: SceneProps & { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const size = 0.52 + index * 0.3;

  useFrame(({ clock }) => {
    if (!active || !ref.current) {
      return;
    }
    const time = clock.elapsedTime;
    ref.current.rotation.y = time * (0.06 + index * 0.014) * (index % 2 === 0 ? 1 : -1);
    ref.current.rotation.z = Math.sin(time * 0.1 + index) * 0.14;
  });

  return (
    <mesh ref={ref} scale={size}>
      <icosahedronGeometry args={[1, index === 0 ? 2 : 1]} />
      <meshBasicMaterial
        color={index === 0 ? palette.text : palette.accent}
        wireframe
        transparent
        opacity={0.12 + index * 0.06}
        depthWrite={false}
      />
    </mesh>
  );
}

function PersonaField({ active, palette }: SceneProps) {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((index) => (
        <PersonaShell key={index} index={index} active={active} palette={palette} />
      ))}

      <mesh>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial
          color={palette.text}
          emissive={palette.accent}
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh rotation={[1.34, 0.18, 0]}>
        <torusGeometry args={[1.92, 0.006, 6, 160]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[1.62, -0.4, 0.4]}>
        <torusGeometry args={[2.08, 0.004, 6, 160]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function OrbitNode({
  index,
  active,
  palette,
}: SceneProps & { index: number }) {
  const node = useRef<THREE.Mesh>(null);
  const radius = 1.05 + index * 0.28;
  const speed = 0.3 + index * 0.035;

  useFrame(({ clock }) => {
    if (!active || !node.current) {
      return;
    }
    const angle = clock.elapsedTime * speed + index * 1.27;
    node.current.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });

  return (
    <group rotation={[1.2 + index * 0.13, index * 0.62, index * 0.5]}>
      <mesh>
        <torusGeometry args={[radius, 0.006, 6, 128]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.48} />
      </mesh>
      <mesh ref={node} position={[radius, 0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

function PurposeField({ active, palette }: SceneProps) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.46, 32, 32]} />
        <meshStandardMaterial
          color={palette.surface}
          emissive={palette.accent}
          emissiveIntensity={0.5}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>

      {[0, 1, 2, 3, 4].map((index) => (
        <OrbitNode key={index} index={index} active={active} palette={palette} />
      ))}

      <mesh rotation={[1.4, 0, 0]}>
        <torusGeometry args={[2.5, 0.003, 6, 180]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

type Point = readonly [number, number, number];

const TREE_EDGES: readonly { from: Point; to: Point; emphasis: boolean }[] = [
  { from: [0, -1.55, 0], to: [0, -0.75, 0], emphasis: false },
  { from: [0, -0.75, 0], to: [0, 0.05, 0], emphasis: false },
  { from: [0, 0.05, 0], to: [-1.35, 0.62, 0], emphasis: false },
  { from: [0, 0.05, 0], to: [1.35, 0.62, 0], emphasis: false },
  { from: [-1.35, 0.62, 0], to: [-2.1, 1.35, 0.18], emphasis: true },
  { from: [-1.35, 0.62, 0], to: [-1.05, 1.48, -0.18], emphasis: true },
  { from: [1.35, 0.62, 0], to: [1.05, 1.48, -0.18], emphasis: true },
  { from: [1.35, 0.62, 0], to: [2.1, 1.35, 0.18], emphasis: true },
  { from: [0, 0.05, 0], to: [0, 1.55, 0], emphasis: false },
];

const TREE_NODES: readonly Point[] = [
  [0, -1.55, 0],
  [0, -0.75, 0],
  [0, 0.05, 0],
  [-1.35, 0.62, 0],
  [1.35, 0.62, 0],
  [-2.1, 1.35, 0.18],
  [-1.05, 1.48, -0.18],
  [0, 1.55, 0],
  [1.05, 1.48, -0.18],
  [2.1, 1.35, 0.18],
];

function TreeBranch({
  from,
  to,
  emphasis,
  palette,
}: {
  from: Point;
  to: Point;
  emphasis: boolean;
  palette: Palette;
}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return { midpoint, quaternion, length };
  }, [from, to]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[0.014, 0.022, transform.length, 6]} />
      <meshBasicMaterial
        color={emphasis ? palette.accent : palette.line}
        transparent
        opacity={emphasis ? 0.8 : 0.55}
      />
    </mesh>
  );
}

function ClassificationField({ active, palette }: SceneProps) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.position.y = Math.sin(time * 0.55) * 0.035;
  });

  return (
    <group ref={group} scale={1.18}>
      {TREE_EDGES.map((edge, index) => (
        <TreeBranch
          key={index}
          from={edge.from}
          to={edge.to}
          emphasis={edge.emphasis}
          palette={palette}
        />
      ))}

      {TREE_NODES.map((node, index) => (
        <mesh key={index} position={node}>
          <sphereGeometry args={[index === 2 ? 0.085 : 0.048, 14, 14]} />
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={index === 2 ? 1.5 : 0.6}
          />
        </mesh>
      ))}

      <mesh position={[0, -1.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.38, 0.4, 64]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function ProjectiveField({ active, palette }: SceneProps) {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 240;

    for (let index = 0; index <= points; index += 1) {
      const angle = (index / points) * Math.PI * 2;
      const radius =
        1.52 *
        (1 +
          0.16 * Math.cos(angle * 2) +
          0.12 * Math.cos(angle * 4) +
          0.06 * Math.cos(angle * 6) +
          0.035 * Math.cos(angle * 8));
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 1.14;

      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    shape.closePath();

    for (const side of [-1, 1]) {
      const hole = new THREE.Path();
      hole.absellipse(side * 0.52, 0.38, 0.24, 0.34, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }

    const form = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.1,
      bevelSegments: 3,
      curveSegments: 48,
    });
    form.center();
    form.computeVertexNormals();
    return form;
  }, []);

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 24), [geometry]);

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.rotation.y = Math.sin(time * 0.12) * 0.2;
    group.current.rotation.z = Math.sin(time * 0.08) * 0.055;
    const scale = 1 + Math.sin(time * 0.5) * 0.018;
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} scale={[1.08, 1.08, 1]}>
        <meshBasicMaterial color={palette.surface} />
      </mesh>
      <mesh geometry={geometry} scale={[1.045, 1.045, 1.02]}>
        <meshBasicMaterial
          color={palette.accent}
          side={THREE.BackSide}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges} scale={[1.082, 1.082, 1.002]}>
        <lineBasicMaterial color={palette.accent} transparent opacity={0.65} />
      </lineSegments>
      <mesh position={[0, 0.2, -2.8]} rotation={[1.35, 0.2, 0.1]}>
        <torusGeometry args={[2.25, 0.004, 6, 180]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.24} />
      </mesh>
    </group>
  );
}

const TRAIT_BARS = [0, 1, 2, 3, 4] as const;

function TraitBar({
  index,
  active,
  palette,
}: SceneProps & { index: number }) {
  const bar = useRef<THREE.Mesh>(null);
  const cap = useRef<THREE.Mesh>(null);
  const x = (index - 2) * 0.86;

  useFrame(({ clock }) => {
    if (!active || !bar.current || !cap.current) {
      return;
    }
    const time = clock.elapsedTime;
    const height = 1.15 + index * 0.14 + Math.sin(time * 0.7 + index * 0.9) * 0.32;
    bar.current.scale.y = height;
    bar.current.position.y = -1.5 + height / 2;
    cap.current.position.y = -1.5 + height;
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={bar} position={[0, -1.5, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial
          color={index === 3 ? palette.accent : palette.line}
          emissive={palette.accent}
          emissiveIntensity={index === 3 ? 0.4 : 0.1}
          metalness={0.55}
          roughness={0.32}
          transparent
          opacity={index === 3 ? 0.9 : 0.68}
        />
      </mesh>
      <mesh ref={cap} position={[0, -1.5 + 1.2, 0]}>
        <sphereGeometry args={[0.065, 14, 14]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
    </group>
  );
}

function Sweep({ active, palette }: SceneProps) {
  const sweep = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!active || !sweep.current) {
      return;
    }
    sweep.current.position.x = Math.sin(clock.elapsedTime * 0.55) * 2.15;
  });

  return (
    <mesh ref={sweep} position={[0, -0.1, 0]}>
      <boxGeometry args={[0.025, 2.9, 2.2]} />
      <meshBasicMaterial color={palette.accent} transparent opacity={0.09} depthWrite={false} />
    </mesh>
  );
}

function ObjectiveField({ active, palette }: SceneProps) {
  return (
    <group position={[0, 0.24, 0]}>
      {TRAIT_BARS.map((index) => (
        <TraitBar key={index} index={index} active={active} palette={palette} />
      ))}

      <mesh position={[0, -1.52, 0]}>
        <boxGeometry args={[4.6, 0.025, 0.62]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.8} />
      </mesh>

      <gridHelper
        args={[6.6, 13, palette.line, palette.line]}
        position={[0, -1.58, 0.6]}
      />

      <Sweep active={active} palette={palette} />

      <mesh position={[0, -1.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.57, 96]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

const GRID_LINES = [-0.58, 0, 0.58] as const;

function FormalInformalField({ active, palette }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Mesh>(null);

  const ribbon = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.85, -0.9, 0.05),
        new THREE.Vector3(-0.52, 0.45, 0.18),
        new THREE.Vector3(-0.12, -0.2, 0),
        new THREE.Vector3(0.32, 0.85, -0.14),
        new THREE.Vector3(0.72, -0.1, 0.08),
        new THREE.Vector3(0.95, 0.55, 0),
      ]),
    [],
  );

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.rotation.y = Math.sin(time * 0.1) * 0.16;
    group.current.rotation.x = -0.05 + Math.cos(time * 0.08) * 0.04;
    if (marker.current) {
      marker.current.position.x = Math.sin(time * 0.5) * 2.15;
    }
  });

  return (
    <group ref={group} scale={1.06}>
      <group position={[-1.62, 0.06, 0]}>
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial color={palette.surface} transparent opacity={0.35} />
        </mesh>
        {GRID_LINES.map((x) =>
          GRID_LINES.map((y) => {
            const centre = x === 0 && y === 0;
            return (
              <mesh key={`grid-${x}-${y}`} position={[x, y, 0]}>
                <boxGeometry args={[0.36, 0.36, 0.36]} />
                <meshBasicMaterial
                  color={centre ? palette.accent : palette.line}
                  wireframe
                  transparent
                  opacity={centre ? 0.9 : 0.55}
                />
              </mesh>
            );
          }),
        )}
      </group>

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.006, 3.2, 0.006]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.7} />
      </mesh>

      <group position={[1.62, 0.06, 0]} scale={1.1}>
        <mesh>
          <tubeGeometry args={[ribbon, 72, 0.018, 6, false]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.72} />
        </mesh>
        {[0.05, 0.22, 0.39, 0.56, 0.73, 0.9].map((t, index) => {
          const point = ribbon.getPoint(t);
          return (
            <mesh key={`ribbon-node-${index}`} position={point}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial color={palette.accent} transparent opacity={0.9} />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, -1.72, 0]}>
        <boxGeometry args={[4.6, 0.008, 0.008]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.8} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={`spectrum-tick-${index}`} position={[-2.1 + index * 0.525, -1.68, 0]}>
          <boxGeometry args={[0.008, index % 4 === 0 ? 0.14 : 0.07, 0.008]} />
          <meshBasicMaterial color={palette.line} transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh ref={marker} position={[0, -1.62, 0.02]}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshBasicMaterial color={palette.accent} />
      </mesh>
    </group>
  );
}

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const INK_CARD_BLOBS = 8;

function InkCard({
  index,
  active,
  palette,
  position,
  rotation,
  scale,
  featured = false,
}: SceneProps & {
  index: number;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  scale: number;
  featured?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const blobs = useMemo(() => {
    const generated: { x: number; y: number; s: number; rot: number }[] = [];

    for (let blob = 0; blob < INK_CARD_BLOBS; blob += 1) {
      const offset = 0.045 + pseudoRandom(index * 31 + blob * 7) * 0.19;
      const y = (pseudoRandom(index * 57 + blob * 13) - 0.5) * 0.6;
      const s = 0.035 + pseudoRandom(index * 17 + blob * 5) * 0.06;
      const rot = pseudoRandom(index * 11 + blob * 3) * Math.PI;
      generated.push({ x: -offset, y, s, rot }, { x: offset, y, s, rot: -rot });
    }

    generated.push({ x: 0, y: 0.12, s: 0.09, rot: 0.2 });
    generated.push({ x: 0, y: -0.2, s: 0.07, rot: -0.4 });
    return generated;
  }, [index]);

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.position.y = position[1] + Math.sin(time * 0.45 + index) * 0.035;
    group.current.rotation.y = rotation[1] + Math.sin(time * 0.2 + index * 0.7) * 0.025;
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[0.62, 0.86]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={featured ? 0.32 : 0.18}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[0.56, 0.78]} />
        <meshBasicMaterial color={palette.surface} transparent opacity={featured ? 0.92 : 0.72} />
      </mesh>
      {blobs.map((blob, blobIndex) => (
        <mesh
          key={`ink-${index}-${blobIndex}`}
          position={[blob.x, blob.y, 0.012]}
          rotation={[0, 0, blob.rot]}
          scale={[blob.s, blob.s * 1.45, blob.s * 0.45]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={featured ? 0.9 : 0.72} />
        </mesh>
      ))}
    </group>
  );
}

function RorschachField({ active, palette }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.rotation.y = Math.sin(time * 0.1) * 0.14;
    group.current.rotation.x = -0.04 + Math.cos(time * 0.08) * 0.035;
    if (scan.current) {
      scan.current.position.y = Math.sin(time * 0.7) * 0.3;
    }
  });

  return (
    <group ref={group} scale={1.02}>
      {Array.from({ length: 9 }, (_, index) => {
        const offset = index - 4;
        return (
          <InkCard
            key={`rorschach-card-${index}`}
            index={index}
            active={active}
            palette={palette}
            position={[offset * 0.68, 0.18 - Math.abs(offset) * 0.03, -0.5 - Math.abs(offset) * 0.1]}
            rotation={[0.03, -offset * 0.13, 0]}
            scale={0.9}
          />
        );
      })}

      <InkCard
        index={9}
        active={active}
        palette={palette}
        position={[0, -0.06, 1.2]}
        rotation={[0, 0, 0]}
        scale={1.68}
        featured
      />

      <mesh ref={scan} position={[0, 0, 1.27]}>
        <planeGeometry args={[0.72, 0.005]} />
        <meshBasicMaterial color={palette.text} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.52, 96]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

const SCENE_LABELS: Record<DiagramVisual, string> = {
  persona: "Persona",
  purpose: "Purpose",
  classification: "Methods",
  projective: "Projective",
  objective: "Objective",
  formalInformal: "Formal and informal",
  rorschach: "Rorschach cards",
};

interface SectionDiagramProps {
  scene: DiagramVisual;
  theme: ThemeName;
  sectionId: SectionId;
}

function DiagramFallback({
  scene,
  palette,
  reason = "Static figure · WebGL unavailable",
}: {
  scene: DiagramVisual;
  palette: Palette;
  reason?: string;
}) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      data-testid="section-diagram"
      data-scene={scene}
      data-animated="false"
      role="img"
      aria-label={`${SCENE_LABELS[scene]} diagram`}
    >
      <div
        className="absolute h-[460px] w-[460px] rounded-full border"
        style={{ borderColor: palette.accent, opacity: 0.28 }}
      />
      <div
        className="absolute h-[330px] w-[330px] rounded-full border"
        style={{ borderColor: palette.line, opacity: 0.7 }}
      />
      <div
        className="absolute h-[200px] w-[200px] rounded-full border"
        style={{ borderColor: palette.accent, opacity: 0.5 }}
      />
      <span
        className="font-display text-[210px] leading-none tracking-[-0.06em]"
        style={{ color: palette.accent, opacity: 0.14 }}
        aria-hidden
      >
        {scene.charAt(0).toUpperCase()}
      </span>
      <p className="absolute bottom-6 type-caption text-muted">{reason}</p>
    </div>
  );
}

/**
 * Five deterministic, animated section figures. Each scene is a single Canvas
 * that renders only while its slide is mounted. Reduced-motion users get the
 * same geometry in a static pose; missing WebGL gets a token-driven fallback.
 */
export function SectionDiagram({ scene, theme, sectionId }: SectionDiagramProps) {
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const palette = useMemo(() => paletteFor(theme, sectionId), [theme, sectionId]);

  useEffect(() => {
    let context: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      context = gl as WebGLRenderingContext | WebGL2RenderingContext | null;
    } catch {
      context = null;
    }
    setWebgl(context !== null);
    return () => {
      if (context && "getExtension" in context) {
        context.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  if (reducedMotion) {
    return (
      <DiagramFallback
        scene={scene}
        palette={palette}
        reason="Static figure · reduced motion"
      />
    );
  }

  if (webgl === null) {
    return <div className="h-full w-full" aria-hidden />;
  }

  if (!webgl) {
    return <DiagramFallback scene={scene} palette={palette} />;
  }

  const active = true;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-testid="section-diagram"
      data-scene={scene}
      data-animated={active ? "true" : "false"}
      aria-label={`${SCENE_LABELS[scene]} diagram`}
      role="img"
    >
      <Canvas
        dpr={[1, 1.6]}
        frameloop={active ? "always" : "demand"}
        resize={{ offsetSize: true }}
        camera={{ position: [0, 0.15, 6.4], fov: 42, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 7]} intensity={2.1} color={palette.text} />
        <pointLight position={[-4, -2, 3]} intensity={14} distance={14} color={palette.accent} />

        <Rig active={active}>
          {scene === "persona" ? <PersonaField active={active} palette={palette} /> : null}
          {scene === "purpose" ? <PurposeField active={active} palette={palette} /> : null}
          {scene === "classification" ? (
            <ClassificationField active={active} palette={palette} />
          ) : null}
          {scene === "projective" ? <ProjectiveField active={active} palette={palette} /> : null}
          {scene === "objective" ? <ObjectiveField active={active} palette={palette} /> : null}
          {scene === "formalInformal" ? (
            <FormalInformalField active={active} palette={palette} />
          ) : null}
          {scene === "rorschach" ? <RorschachField active={active} palette={palette} /> : null}
        </Rig>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 diagram-vignette" aria-hidden />
    </div>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { introPalette } from "@design/tokens";

const COUNT = 1800;

/**
 * A morphing persona sphere: particles arranged on a sphere that breathes and
 * distorts toward the cursor. It is the visual metaphor for the "persona" —
 * a stable core that still responds to the world.
 */
export function PersonaSphere({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT * 3);
    for (let index = 0; index < COUNT; index += 1) {
      const offset = index * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.55 + (Math.random() - 0.5) * 0.18;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      values[offset] = x;
      values[offset + 1] = y;
      values[offset + 2] = z;
      base[offset] = x;
      base[offset + 1] = y;
      base[offset + 2] = z;
    }
    return { values, base };
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!active || !points.current) {
      return;
    }
    const time = clock.elapsedTime;
    const geometry = points.current.geometry;
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const array = position.array as Float32Array;
    const base = positions.base;
    const mouse = new THREE.Vector2(pointer.x, pointer.y);

    for (let index = 0; index < COUNT; index += 1) {
      const offset = index * 3;
      const bx = base[offset] as number;
      const by = base[offset + 1] as number;
      const bz = base[offset + 2] as number;

      const breath = 1 + Math.sin(time * 0.6 + index * 0.01) * 0.06;
      let x = bx * breath;
      let y = by * breath;
      const z = bz * breath;

      // Distort toward the cursor in screen space.
      const dx = mouse.x * 2 - (x / 4);
      const dy = mouse.y * 2 - (y / 4);
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const influence = Math.max(0, 1 - dist * 0.35) * 0.35;
      x += dx * influence;
      y += dy * influence;

      array[offset] = x;
      array[offset + 1] = y;
      array[offset + 2] = z;
    }
    position.needsUpdate = true;

    points.current.rotation.y = time * 0.06;
    points.current.rotation.x = Math.sin(time * 0.12) * 0.08;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.values, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={introPalette.white}
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.72}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useReducedMotion } from "motion/react";
import * as THREE from "three";
import { themes, type ThemeName } from "@design/tokens";

const PARTICLE_COUNT = 1200;
const ANIMATION_MS = 7000;

const mulberry32 = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

interface DustFieldProps {
  theme: ThemeName;
  active: boolean;
}

function DustField({ theme, active }: DustFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const elapsed = useRef(0);

  const field = useMemo(() => {
    const random = mulberry32(0x0ff1ce);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const base = new Float32Array(PARTICLE_COUNT * 3);
    const phase = new Float32Array(PARTICLE_COUNT);
    const speed = new Float32Array(PARTICLE_COUNT);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 10.4;
      const x = Math.cos(angle) * radius * 1.16;
      const y = Math.sin(angle) * radius * 0.68;
      const z = (random() - 0.5) * 4.2;

      base[offset] = x;
      base[offset + 1] = y;
      base[offset + 2] = z;
      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;
      phase[index] = random() * Math.PI * 2;
      speed[index] = 0.55 + random() * 0.9;
    }

    return { positions, base, phase, speed };
  }, []);

  useFrame((_, delta) => {
    if (!active) {
      return;
    }

    const points = pointsRef.current;
    if (!points) {
      return;
    }

    elapsed.current += Math.min(delta, 0.05);
    const time = elapsed.current;
    const attribute = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    const { base, phase, speed } = field;

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const drift = speed[index] ?? 1;
      const seed = phase[index] ?? 0;
      array[offset] = (base[offset] ?? 0) + Math.sin(time * 0.16 * drift + seed) * 0.24;
      array[offset + 1] =
        (base[offset + 1] ?? 0) + Math.cos(time * 0.12 * drift + seed * 1.7) * 0.18;
      array[offset + 2] = (base[offset + 2] ?? 0) + Math.sin(time * 0.08 * drift + seed) * 0.12;
    }

    attribute.needsUpdate = true;
  });

  const color = theme === "dark" ? themes.dark.accent : themes.light.primary;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.018}
        sizeAttenuation
        transparent
        opacity={theme === "dark" ? 0.5 : 0.28}
        depthWrite={false}
        blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

interface AmbientBackgroundProps {
  theme: ThemeName;
  /** True while the presenter is hiding the deck or reading an overlay. */
  paused?: boolean;
}

/**
 * A quiet dust field behind the deck. It is decorative only, renders at most
 * 1,200 points, freezes after seven seconds, and falls back to a static
 * gradient when WebGL or motion is unavailable.
 */
export function AmbientBackground({ theme, paused = false }: AmbientBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [active, setActive] = useState(true);

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

  useEffect(() => {
    if (reducedMotion) {
      setActive(false);
      return;
    }

    const timeout = window.setTimeout(() => setActive(false), ANIMATION_MS);
    const onVisibility = (): void => {
      if (document.hidden) {
        setActive(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  const animate = webgl && !reducedMotion && active && !paused;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 ambient-static" />

      {webgl && !reducedMotion ? (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          <Canvas
            dpr={[1, 1.5]}
            frameloop={animate ? "always" : "demand"}
            resize={{ offsetSize: true }}
            camera={{ position: [0, 0, 9], fov: 50, near: 0.1, far: 30 }}
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <DustField theme={theme} active={animate} />
          </Canvas>
        </motion.div>
      ) : null}
    </div>
  );
}

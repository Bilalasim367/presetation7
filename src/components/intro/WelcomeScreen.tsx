"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PersonaSphere } from "./PersonaSphere";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";
import { meta } from "@data/meta";
import { easeBezier, introPalette } from "@design/tokens";

const PARTICLE_COUNT = 420;

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

const smokeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const smokeFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uInk;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(1.9, 1.15);
    p += uMouse * 0.03;

    float t = uTime * 0.028;
    float warp = fbm(p * 2.1 + vec2(t, -t * 0.7));
    float n = fbm(p * 2.8 + warp * 1.6 + vec2(-t * 0.45, t * 0.6));
    float smoke = smoothstep(0.46, 0.84, n);
    float radial = smoothstep(1.3, 0.15, length(p * vec2(1.0, 1.3)));
    float veil = smoke * radial * 0.24;
    float scan = 0.010 * sin((uv.y + t * 3.0) * 880.0);
    float grain = (hash(uv * 902.0 + fract(uTime) * 13.0) - 0.5) * 0.022;
    float alpha = clamp(veil + grain + scan, 0.0, 1.0);
    vec3 color = uInk * (0.45 + 0.55 * smoke) + vec3(scan);

    gl_FragColor = vec4(color, alpha);
  }
`;

function SmokeField({ active }: { active: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uInk: { value: new THREE.Color(introPalette.white) },
    }),
    [],
  );

  useFrame(({ clock, pointer }) => {
    if (!active || !material.current) {
      return;
    }
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uMouse.value.set(pointer.x, pointer.y);
  });

  return (
    <mesh position={[0, 0, -3]}>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={smokeVertex}
        fragmentShader={smokeFragment}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function MonochromeRings({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!active || !group.current) {
      return;
    }
    const time = clock.elapsedTime;
    group.current.rotation.y = time * 0.045;
    group.current.rotation.z = Math.sin(time * 0.08) * 0.08;
  });

  return (
    <group ref={group}>
      <mesh rotation={[1.22, 0.18, 0]}>
        <torusGeometry args={[2.62, 0.006, 6, 220]} />
        <meshBasicMaterial color={introPalette.white} transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[1.48, -0.34, 0.38]}>
        <torusGeometry args={[2.28, 0.004, 6, 200]} />
        <meshBasicMaterial color={introPalette.gray} transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[0.78, 0.52, -0.22]}>
        <torusGeometry args={[3.05, 0.003, 6, 220]} />
        <meshBasicMaterial color={introPalette.white} transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

function Dust({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const random = mulberry32(0xa55a1a);
    const values = new Float32Array(PARTICLE_COUNT * 3);
    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const angle = random() * Math.PI * 2;
      const radius = 1.8 + random() * 4.6;
      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = (random() - 0.5) * 4.4;
      values[offset + 2] = Math.sin(angle) * radius - 1.5;
    }
    return values;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!active || !points.current) {
      return;
    }
    points.current.rotation.y += delta * 0.012;
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.06) * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={introPalette.white}
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </points>
  );
}

function WelcomeScene({ active }: { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      resize={{ offsetSize: true }}
      camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 30 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%" }}
    >
      <SmokeField active={active} />
      <PersonaSphere active={active} />
      <MonochromeRings active={active} />
      <Dust active={active} />
    </Canvas>
  );
}

const lineReveal: Variants = {
  hidden: { opacity: 0, y: 64, filter: "blur(16px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const softReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

interface WelcomeScreenProps {
  onBegin: () => void;
}

export function WelcomeScreen({ onBegin }: WelcomeScreenProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animate = mounted && reducedMotion !== true;
  const initial = reducedMotion === true ? false : "hidden";

  return (
    <div
      className="intro-shell absolute inset-0 overflow-hidden"
      onClick={onBegin}
      data-testid="welcome-screen"
    >
      <div className="absolute inset-0 bg-[color:var(--t-intro-black)]" aria-hidden>
        <div className="intro-static-fog absolute inset-0" />
        {animate ? <WelcomeScene active /> : null}
      </div>

      <div className="intro-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="intro-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex h-full flex-col px-[100px] pb-[52px] pt-[46px]">
        <motion.header
          className="flex items-center justify-between border-b border-[color:var(--t-intro-dim)] pb-5"
          initial={initial}
          animate="visible"
          variants={softReveal}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: easeBezier }}
        >
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center border border-[color:var(--t-intro-gray)] font-display text-[22px] leading-none text-[color:var(--t-intro-white)]">
              P
            </span>
            <span className="type-figure text-[color:var(--t-intro-gray)]">
              {meta.deckTitle}
            </span>
          </div>
          <span className="type-figure text-[color:var(--t-intro-gray)]">
            {meta.course} · {meta.date}
          </span>
        </motion.header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <motion.p
            className="type-figure text-[color:var(--t-intro-gray)]"
            initial={initial}
            animate="visible"
            variants={softReveal}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.24 }}
          >
            Welcome · A lecture in five parts
          </motion.p>

          <motion.p
            className="mt-7 text-[32px] leading-none text-[color:var(--t-intro-gray)]"
            dir="rtl"
            lang="ar"
            initial={initial}
            animate="visible"
            variants={softReveal}
            transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.42 }}
          >
            السلام عليكم
          </motion.p>

          <h1 className="mt-6 text-center font-display text-[152px] font-medium italic leading-[0.82] tracking-[-0.055em] text-[color:var(--t-intro-white)]">
            <motion.span
              className="block"
              initial={initial}
              animate="visible"
              variants={lineReveal}
              transition={{ duration: reducedMotion ? 0 : 1.25, ease: easeBezier, delay: reducedMotion ? 0 : 0.6 }}
            >
              Assalam
            </motion.span>
            <motion.span
              className="block"
              initial={initial}
              animate="visible"
              variants={lineReveal}
              transition={{ duration: reducedMotion ? 0 : 1.25, ease: easeBezier, delay: reducedMotion ? 0 : 0.82 }}
            >
              o Alaikum
            </motion.span>
          </h1>

          <motion.span
            className="mt-10 h-[1px] w-[620px] origin-center bg-[color:var(--t-intro-gray)]"
            initial={reducedMotion === true ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.55 }}
            transition={{ duration: reducedMotion ? 0 : 1.1, ease: easeBezier, delay: reducedMotion ? 0 : 1.7 }}
            aria-hidden
          />

          <motion.p
            className="mt-8 type-figure text-[color:var(--t-intro-white)]"
            style={{ letterSpacing: "0.52em", paddingLeft: "0.52em" }}
            initial={initial}
            animate="visible"
            variants={softReveal}
            transition={{ duration: reducedMotion ? 0 : 1.1, delay: reducedMotion ? 0 : 2.05 }}
          >
            Personality Assessment
          </motion.p>

          <motion.p
            className="mt-5 type-hud text-[color:var(--t-intro-gray)]"
            initial={initial}
            animate="visible"
            variants={softReveal}
            transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 2.35 }}
          >
            Projective &amp; Objective · Five presenters · One human subject
          </motion.p>

          <motion.button
            type="button"
            className="intro-cta mt-11 inline-flex items-center gap-5 border border-[color:var(--t-intro-gray)] px-9 py-4 type-figure text-[color:var(--t-intro-white)] transition-colors duration-300"
            onClick={(event) => {
              event.stopPropagation();
              onBegin();
            }}
            initial={initial}
            animate="visible"
            variants={softReveal}
            transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 2.7 }}
          >
            Begin the presentation
            <ArrowRight size={18} strokeWidth={1.4} aria-hidden />
          </motion.button>
        </div>

        <motion.footer
          className="flex items-end justify-between border-t border-[color:var(--t-intro-dim)] pt-5"
          initial={initial}
          animate="visible"
          variants={softReveal}
          transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 2.9 }}
        >
          <p className="type-figure text-[color:var(--t-intro-gray)]">
            Press Enter or click to begin
          </p>
          <p className="type-figure text-[color:var(--t-intro-gray)]">
            16:9 opening film follows
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

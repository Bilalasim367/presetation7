"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { themes, type ThemeName } from "@design/tokens";
import { easeBezier } from "@design/tokens";

const WIDTH = 620;
const HEIGHT = 760;
const PARTICLE_COUNT = 3200;
const HOLD_MS = 1400;
const MORPH_MS = 2600;
const SESSION_KEY = "personality-assessment.mask-played.v1";

const MASK_PATH = [
  "M310 62",
  "C244 62 187 100 166 166",
  "C143 239 151 320 181 389",
  "C205 445 257 482 310 500",
  "C363 482 415 445 439 389",
  "C469 320 477 239 454 166",
  "C433 100 376 62 310 62 Z",
  "M225 225",
  "C244 203 281 200 300 220",
  "C283 246 246 252 225 225 Z",
  "M320 220",
  "C339 200 376 203 395 225",
  "C374 252 337 246 320 220 Z",
  "M275 365",
  "C295 382 325 382 345 365",
  "C342 398 328 414 310 414",
  "C292 414 278 398 275 365 Z",
].join(" ");

const NOSE_PATH = "M310 236 C301 274 300 303 311 320";

const WORDS = [
  { text: "Traits", x: 190, y: 220 },
  { text: "Emotions", x: 430, y: 300 },
  { text: "Values", x: 250, y: 390 },
  { text: "Behavior", x: 420, y: 490 },
  { text: "Interests", x: 300, y: 590 },
] as const;

const NETWORK_PATH = WORDS.map((word, index) => `${index === 0 ? "M" : "L"}${word.x} ${word.y}`).join(" ") + " Z";

type Mode = "pending" | "animate" | "static";

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  edge: boolean;
  delay: number;
  swirlX: number;
  swirlY: number;
  size: number;
}

interface RawPoint {
  x: number;
  y: number;
  edge: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

const shuffled = <T,>(values: readonly T[], random: () => number): T[] => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const temporary = copy[index];
    copy[index] = copy[other] as T;
    copy[other] = temporary as T;
  }
  return copy;
};

const sampleMask = (random: () => number): RawPoint[] => {
  const probe = document.createElement("canvas");
  probe.width = WIDTH;
  probe.height = HEIGHT;
  const context = probe.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return [];
  }

  context.fillStyle = themes.dark.text;
  context.fill(new Path2D(MASK_PATH), "evenodd");
  const pixels = context.getImageData(0, 0, WIDTH, HEIGHT).data;

  const inside = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
      return false;
    }
    return (pixels[(Math.floor(y) * WIDTH + Math.floor(x)) * 4 + 3] ?? 0) > 120;
  };

  const points: RawPoint[] = [];
  const band = 9;

  for (let y = 52; y <= 508; y += 4) {
    for (let x = 142; x <= 478; x += 4) {
      if (!inside(x, y)) {
        continue;
      }

      const edge =
        !inside(x - band, y) ||
        !inside(x + band, y) ||
        !inside(x, y - band) ||
        !inside(x, y + band);

      points.push({
        x: x + (random() - 0.5) * 2.4,
        y: y + (random() - 0.5) * 2.4,
        edge,
      });
    }
  }

  return points;
};

const sampleWordTargets = (random: () => number): RawPoint[] => {
  const probe = document.createElement("canvas");
  probe.width = WIDTH;
  probe.height = HEIGHT;
  const context = probe.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return [];
  }

  const font = '500 32px "Playfair Display", Georgia, serif';
  context.fillStyle = themes.dark.text;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";

  WORDS.forEach((word) => {
    context.fillText(word.text, word.x, word.y);
  });

  const pixels = context.getImageData(0, 0, WIDTH, HEIGHT).data;
  const perWord = Math.floor(PARTICLE_COUNT / WORDS.length);
  const chosen: RawPoint[] = [];
  const leftovers: RawPoint[] = [];

  context.font = font;

  WORDS.forEach((word) => {
    const measured = context.measureText(word.text);
    const halfWidth = measured.width / 2 + 8;
    const minX = Math.floor(word.x - halfWidth);
    const maxX = Math.ceil(word.x + halfWidth);
    const minY = Math.floor(word.y - 28);
    const maxY = Math.ceil(word.y + 28);

    const wordPixels: RawPoint[] = [];
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
          continue;
        }
        if ((pixels[(y * WIDTH + x) * 4 + 3] ?? 0) > 100) {
          wordPixels.push({ x, y, edge: false });
        }
      }
    }

    const mixed = shuffled(wordPixels, random);
    chosen.push(...mixed.slice(0, perWord));
    leftovers.push(...mixed.slice(perWord));
  });

  const remaining = PARTICLE_COUNT - chosen.length;
  if (remaining > 0) {
    chosen.push(...shuffled(leftovers, random).slice(0, remaining));
  }

  while (chosen.length < PARTICLE_COUNT) {
    const fallback = chosen[Math.floor(random() * chosen.length)];
    if (!fallback) {
      break;
    }
    chosen.push({
      x: fallback.x + (random() - 0.5) * 2,
      y: fallback.y + (random() - 0.5) * 2,
      edge: false,
    });
  }

  return chosen.slice(0, PARTICLE_COUNT);
};

const buildParticles = (random: () => number): Particle[] => {
  const mask = sampleMask(random);
  const edges = shuffled(
    mask.filter((point) => point.edge),
    random,
  );
  const interiors = shuffled(
    mask.filter((point) => !point.edge),
    random,
  );
  const targets = shuffled(sampleWordTargets(random), random);

  if (edges.length === 0 || interiors.length === 0 || targets.length === 0) {
    return [];
  }

  const edgeTarget = Math.min(edges.length, Math.floor(PARTICLE_COUNT * 0.52));
  const starts: RawPoint[] = [
    ...edges.slice(0, edgeTarget),
    ...interiors.slice(0, PARTICLE_COUNT - edgeTarget),
  ];

  while (starts.length < PARTICLE_COUNT) {
    const extras = edges.length > interiors.length ? edges : interiors;
    starts.push(extras[starts.length % extras.length] as RawPoint);
  }

  const mixedStarts = shuffled(starts, random).slice(0, PARTICLE_COUNT);

  return mixedStarts.map((start, index) => {
    const target = targets[index % targets.length] as RawPoint;
    return {
      startX: start.x,
      startY: start.y,
      targetX: target.x,
      targetY: target.y,
      edge: start.edge,
      delay: random() * 0.28,
      swirlX: (random() - 0.5) * 150,
      swirlY: -20 - random() * 90,
      size: 0.85 + random() * 1.5,
    };
  });
};

const drawParticles = (
  context: CanvasRenderingContext2D,
  particles: Particle[],
  progress: number,
  fade: number,
  accent: string,
  primary: string,
): void => {
  context.clearRect(0, 0, WIDTH, HEIGHT);

  if (fade <= 0) {
    return;
  }

  const globalEase = easeInOutCubic(progress);

  context.fillStyle = accent;
  context.globalAlpha = fade * (0.44 + 0.4 * globalEase);

  for (const particle of particles) {
    const local = clamp((progress - particle.delay) / (1 - particle.delay), 0, 1);
    const eased = easeInOutCubic(local);
    const arc = Math.sin(eased * Math.PI);
    const x = particle.startX + (particle.targetX - particle.startX) * eased + arc * particle.swirlX;
    const y = particle.startY + (particle.targetY - particle.startY) * eased + arc * particle.swirlY;
    const size = particle.size * (0.86 + 0.32 * eased);

    context.fillRect(x - size / 2, y - size / 2, size, size);
  }

  if (progress < 0.985) {
    context.fillStyle = primary;
    context.globalAlpha = fade * 0.34 * (1 - progress);

    for (const particle of particles) {
      if (particle.edge) {
        continue;
      }
      const local = clamp((progress - particle.delay) / (1 - particle.delay), 0, 1);
      const eased = easeInOutCubic(local);
      const arc = Math.sin(eased * Math.PI);
      const x = particle.startX + (particle.targetX - particle.startX) * eased + arc * particle.swirlX;
      const y = particle.startY + (particle.targetY - particle.startY) * eased + arc * particle.swirlY;
      const size = particle.size * (0.86 + 0.32 * eased);

      context.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }

  context.globalAlpha = 1;
};

interface MaskDissolveProps {
  theme: ThemeName;
}

export function MaskDissolve({ theme }: MaskDissolveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<ThemeName>(theme);
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("pending");
  const [maskFaded, setMaskFaded] = useState(false);
  const [wordsVisible, setWordsVisible] = useState(false);
  const fade = reducedMotion ? 0 : 0.55;

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let played = false;
    try {
      played = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      played = false;
    }

    if (reduced || played) {
      setWordsVisible(true);
      setMaskFaded(true);
      setMode("static");
      return;
    }

    setMode("animate");
  }, []);

  useEffect(() => {
    if (mode !== "animate") {
      return;
    }

    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];

    const start = async (): Promise<void> => {
      try {
        await document.fonts.ready;
      } catch {
        // Fonts are bundled; if the API is unavailable, draw with the fallback.
      }

      if (cancelled) {
        return;
      }

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) {
        setWordsVisible(true);
        setMode("static");
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(WIDTH * dpr);
      canvas.height = Math.round(HEIGHT * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const random = mulberry32(0x5eed1a);
      const particles = buildParticles(random);
      if (particles.length === 0) {
        setWordsVisible(true);
        setMode("static");
        return;
      }

      const colors = themes[themeRef.current];
      const startedAt = performance.now();

      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Session storage is optional.
      }

      timers.push(
        window.setTimeout(() => {
          setMaskFaded(true);
        }, HOLD_MS),
      );

      timers.push(
        window.setTimeout(() => {
          setWordsVisible(true);
          try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // Session storage is optional.
          }
        }, HOLD_MS + MORPH_MS),
      );

      const tick = (now: number): void => {
        if (cancelled) {
          return;
        }

        const elapsed = now - startedAt;
        const progress = clamp((elapsed - HOLD_MS) / MORPH_MS, 0, 1);
        const fade = clamp((elapsed - HOLD_MS) / 240, 0, 1);

        if (elapsed >= HOLD_MS) {
          drawParticles(context, particles, progress, fade, colors.accent, colors.primary);
        }

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        } else {
          drawParticles(context, particles, 1, 1, colors.accent, colors.primary);
          setWordsVisible(true);
          try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // Session storage is optional.
          }
          // Settle into the token-driven static composition so revisits, theme
          // changes, and reduced-motion all share the same final artwork.
          setMode("static");
        }
      };

      frame = window.requestAnimationFrame(tick);
    };

    void start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [mode]);

  const words = (
    <div className="pointer-events-none absolute inset-0">
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        fill="none"
        initial={false}
        animate={{ opacity: wordsVisible ? 1 : 0 }}
        transition={{ duration: fade, ease: easeBezier }}
        aria-hidden
      >
        <path
          d={NETWORK_PATH}
          stroke="var(--t-accent)"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
      </motion.svg>

      <motion.p
        className="absolute left-1/2 top-[86px] -translate-x-1/2 -translate-y-1/2 type-figure text-muted"
        initial={false}
        animate={{ opacity: wordsVisible ? 1 : 0 }}
        transition={{ duration: fade, ease: easeBezier }}
      >
        Five threads
      </motion.p>

      {WORDS.map((word) => (
        <motion.span
          key={word.text}
          className="absolute type-card-title font-medium text-accent"
          style={{
            left: word.x,
            top: word.y,
            transform: "translate(-50%, -50%)",
            lineHeight: 1,
            textShadow: "0 0 30px color-mix(in srgb, var(--t-accent) 18%, transparent)",
          }}
          initial={false}
          animate={{ opacity: wordsVisible ? 1 : 0 }}
          transition={{ duration: fade, ease: easeBezier }}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  );

  return (
    <div
      className="relative h-[760px] w-[620px] max-w-full select-none"
      role="img"
      aria-label="A theatrical mask dissolves into particles that settle into the words traits, emotions, values, behavior, and interests."
      data-testid="mask-dissolve"
      data-mode={mode}
      data-words-visible={wordsVisible}
    >
      {mode === "animate" ? (
        <>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-hidden
          />
          <motion.svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: maskFaded ? 0 : 1 }}
            transition={{ duration: maskFaded ? 0.7 : 0.5, ease: easeBezier }}
            aria-hidden
          >
            <motion.path
              d={MASK_PATH}
              fill="var(--t-primary)"
              fillOpacity="0.12"
              fillRule="evenodd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, ease: easeBezier }}
            />
            <motion.path
              d={MASK_PATH}
              stroke="var(--t-accent)"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: easeBezier }}
            />
            <motion.path
              d={NOSE_PATH}
              stroke="var(--t-accent)"
              strokeOpacity="0.5"
              strokeWidth="1.1"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45, ease: easeBezier }}
            />
          </motion.svg>
        </>
      ) : null}

      {mode !== "animate" ? (
        <motion.svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: easeBezier }}
          aria-hidden
        >
          <path
            d={MASK_PATH}
            fill="var(--t-primary)"
            fillOpacity="0.07"
            fillRule="evenodd"
            stroke="var(--t-accent)"
            strokeOpacity="0.3"
            strokeWidth="1.2"
          />
          <path
            d={NOSE_PATH}
            stroke="var(--t-accent)"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </motion.svg>
      ) : null}

      {words}

      <p className="absolute bottom-0 left-0 type-caption text-muted">
        Procedural illustration · not a test image
      </p>
    </div>
  );
}

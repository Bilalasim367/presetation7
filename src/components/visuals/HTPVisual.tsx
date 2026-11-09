"use client";

import { motion, useReducedMotion } from "motion/react";
import { easeBezier } from "@design/tokens";

interface HTPVisualProps {
  sectionId: number;
}

/**
 * An animated House-Tree-Person sketch.
 *
 * The three drawings build themselves stroke by stroke, then breathe gently.
 * The point of the animation is the act of drawing: the audience watches the
 * house, the tree and the person appear line by line, which mirrors the HTP
 * session itself.
 */
export function HTPVisual({ sectionId }: HTPVisualProps) {
  const reducedMotion = useReducedMotion();
  const color = `var(--t-s${sectionId})`;

  const draw = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 1.6, ease: easeBezier, delay },
        };

  return (
    <div
      className="relative flex h-[620px] w-full flex-col items-center justify-center overflow-hidden border border-line bg-surface/20 p-6"
      data-testid="htp-visual"
      aria-hidden
    >
      <svg
        viewBox="0 0 520 520"
        className="h-full w-full"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* House */}
        <motion.path d="M 90 300 L 90 210 L 150 160 L 210 210 L 210 300 Z" {...draw(0.1)} />
        <motion.path d="M 130 300 L 130 255 L 170 255 L 170 300" {...draw(0.5)} />
        <motion.circle cx="162" cy="278" r="3" fill={color} {...draw(0.9)} />
        <motion.path d="M 70 210 L 150 140 L 230 210" {...draw(0.3)} />

        {/* Tree */}
        <motion.path d="M 330 300 L 330 230" {...draw(1.0)} />
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ originX: "330px", originY: "230px" }}
        >
          <motion.circle cx="330" cy="200" r="46" {...draw(1.2)} />
          <motion.circle cx="300" cy="215" r="26" {...draw(1.35)} />
          <motion.circle cx="360" cy="215" r="26" {...draw(1.35)} />
          <motion.path d="M 318 232 Q 330 250 342 232" {...draw(1.6)} />
        </motion.g>

        {/* Person */}
        <motion.circle cx="430" cy="180" r="18" {...draw(1.8)} />
        <motion.path d="M 430 198 L 430 260" {...draw(2.0)} />
        <motion.path d="M 430 215 L 405 245" {...draw(2.15)} />
        <motion.path d="M 430 215 L 455 245" {...draw(2.15)} />
        <motion.path d="M 430 260 L 410 300" {...draw(2.3)} />
        <motion.path d="M 430 260 L 450 300" {...draw(2.3)} />

        {/* Ground line */}
        <motion.path d="M 60 300 L 470 300" {...draw(0.0)} />
      </svg>

      {!reducedMotion ? (
        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 type-caption text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.8 }}
        >
          House · Tree · Person
        </motion.div>
      ) : (
        <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 type-caption text-muted">
          House · Tree · Person
        </span>
      )}
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { easeBezier } from "@design/tokens";
import type { SectionId } from "@design/tokens";

interface SectionVeilProps {
  section: SectionId;
}

/**
 * A short cinematic wash that covers the hand-off between two sections.
 *
 * The veil is remounted by its parent whenever the active section changes. It
 * deliberately stays translucent: the incoming slide keeps emerging underneath,
 * so the section change reads as a dissolve rather than a cut.
 */
export function SectionVeil({ section }: SectionVeilProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[45] overflow-hidden"
      aria-hidden
      data-testid="section-veil"
      data-section={section}
    >
      <motion.div
        className="section-sheen absolute -inset-y-[12%] w-[58%]"
        initial={{ x: "-95%", opacity: 0 }}
        animate={{ x: "195%", opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.15, ease: easeBezier, times: [0, 0.38, 1] }}
      />

      <motion.div
        className="absolute inset-x-0 top-1/2 h-px bg-text"
        initial={{ scaleX: 0.18, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.32, 0] }}
        transition={{ duration: 1.05, ease: easeBezier, delay: 0.08 }}
      />

      <motion.span
        className="absolute right-[126px] top-1/2 -translate-y-1/2 font-display text-[460px] leading-none tracking-[-0.07em] text-text"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: [0, 0.06, 0], x: 0 }}
        transition={{ duration: 1.3, ease: easeBezier }}
      >
        {String(section).padStart(2, "0")}
      </motion.span>
    </div>
  );
}

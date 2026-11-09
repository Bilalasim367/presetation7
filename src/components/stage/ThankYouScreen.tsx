"use client";

import { motion, useReducedMotion } from "motion/react";
import { meta } from "@data/meta";
import { easeBezier } from "@design/tokens";

interface ThankYouScreenProps {
  onContinue: () => void;
}

export function ThankYouScreen({ onContinue }: ThankYouScreenProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 z-[55] flex flex-col items-center justify-center bg-bg/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.8, ease: easeBezier }}
      data-testid="thank-you-screen"
    >
      <motion.p
        className="type-figure text-muted"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.2 }}
      >
        Presentation complete
      </motion.p>

      <motion.h1
        className="mt-6 font-display text-[120px] leading-none tracking-[-0.05em] text-text"
        initial={reducedMotion ? false : { opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: reducedMotion ? 0 : 1.1, ease: easeBezier, delay: reducedMotion ? 0 : 0.35 }}
      >
        Thank You
      </motion.h1>

      <motion.p
        className="mt-6 type-subheading text-accent"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.7 }}
      >
        {meta.deckTitle} · {meta.deckSubtitle}
      </motion.p>

      <motion.div
        className="mt-12 flex flex-wrap items-center justify-center gap-3"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.95 }}
      >
        {meta.students.map((student, index) => (
          <span
            key={`ty-${student}-${index}`}
            className="border border-line px-4 py-2 type-hud text-text"
          >
            {student}
          </span>
        ))}
      </motion.div>

      <motion.p
        className="mt-10 type-hud text-muted"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 1.3 }}
      >
        Questions and discussion
      </motion.p>

      <motion.button
        type="button"
        className="mt-10 border border-line px-8 py-3 type-figure text-text transition-colors duration-300 hover:bg-surface-hi"
        onClick={onContinue}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 1.5 }}
      >
        Return to hub
      </motion.button>
    </motion.div>
  );
}

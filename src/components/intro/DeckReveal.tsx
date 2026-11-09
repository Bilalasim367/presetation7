"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { meta } from "@data/meta";
import { easeBezier } from "@design/tokens";

interface DeckRevealProps {
  onDone: () => void;
}

/**
 * The bridge between the opening film and the group hub.
 *
 * The film ends on black, so the reveal starts from black: a hairline opens,
 * the five presenter names arrive one by one, and the deck title lands before
 * the hub takes over. Skippable at any moment; auto-advances on its own.
 */
export function DeckReveal({ onDone }: DeckRevealProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion === true) {
      const timer = window.setTimeout(onDone, 2200);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(onDone, 5200);
    return () => window.clearTimeout(timer);
  }, [onDone, reducedMotion]);

  return (
    <div
      className="intro-shell absolute inset-0 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[color:var(--t-intro-black)] px-[120px]"
      onClick={onDone}
      data-testid="deck-reveal"
    >
      <div className="intro-static-fog absolute inset-0" aria-hidden />
      <div className="intro-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="intro-vignette pointer-events-none absolute inset-0" aria-hidden />

      <motion.span
        className="absolute inset-x-[120px] top-1/2 h-[1px] bg-[color:var(--t-intro-dim)]"
        initial={reducedMotion === true ? false : { scaleX: 0.04, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: reducedMotion === true ? 0 : 1.6,
          ease: easeBezier,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-[1340px] flex-col items-center text-center">
        <motion.p
          className="type-figure text-[color:var(--t-intro-gray)]"
          initial={reducedMotion === true ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion === true ? 0 : 0.8,
            ease: easeBezier,
            delay: reducedMotion === true ? 0 : 0.35,
          }}
        >
          The group · Five parts · One subject
        </motion.p>

        <h1 className="mt-10 font-display text-[104px] leading-[0.92] tracking-[-0.045em] text-[color:var(--t-intro-white)]">
          <motion.span
            className="block"
            initial={reducedMotion === true ? false : { opacity: 0, y: 42, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: reducedMotion === true ? 0 : 1.15,
              ease: easeBezier,
              delay: reducedMotion === true ? 0 : 0.55,
            }}
          >
            Five voices,
          </motion.span>
          <motion.span
            className="block italic"
            initial={reducedMotion === true ? false : { opacity: 0, y: 42, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: reducedMotion === true ? 0 : 1.15,
              ease: easeBezier,
              delay: reducedMotion === true ? 0 : 0.72,
            }}
          >
            one person
          </motion.span>
        </h1>

        <motion.div
          className="mt-12 flex w-full items-stretch justify-center"
          initial={reducedMotion === true ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion === true ? 0 : 0.8,
            ease: easeBezier,
            delay: reducedMotion === true ? 0 : 1.5,
          }}
        >
          {meta.students.map((student, index) => (
            <motion.div
              key={`reveal-${student}-${index}`}
              className="relative flex flex-1 flex-col items-center gap-3 border-t border-[color:var(--t-intro-dim)] px-4 pt-5"
              initial={reducedMotion === true ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion === true ? 0 : 0.7,
                ease: easeBezier,
                delay: reducedMotion === true ? 0 : 1.75 + index * 0.13,
              }}
            >
              <span className="absolute -top-[3px] h-[5px] w-[5px] rounded-full bg-[color:var(--t-intro-white)]" />
              <span className="type-figure text-[color:var(--t-intro-gray)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[30px] leading-none text-[color:var(--t-intro-white)]">
                {student}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 flex items-center gap-4 type-figure text-[color:var(--t-intro-gray)]"
          initial={reducedMotion === true ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion === true ? 0 : 0.9,
            ease: easeBezier,
            delay: reducedMotion === true ? 0 : 2.6,
          }}
        >
          <span>{meta.deckTitle}</span>
          <span className="h-[1px] w-14 bg-[color:var(--t-intro-dim)]" aria-hidden />
          <span>{meta.deckSubtitle}</span>
        </motion.div>

        <motion.button
          type="button"
          className="mt-12 inline-flex items-center gap-4 border border-[color:var(--t-intro-gray)] px-8 py-3 type-figure text-[color:var(--t-intro-white)] transition-colors duration-300 hover:bg-[color:var(--t-intro-white)] hover:text-[color:var(--t-intro-black)]"
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
          initial={reducedMotion === true ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion === true ? 0 : 0.8,
            ease: easeBezier,
            delay: reducedMotion === true ? 0 : 3,
          }}
        >
          Enter the deck
          <ArrowRight size={17} strokeWidth={1.4} aria-hidden />
        </motion.button>

        <motion.p
          className="mt-5 type-caption text-[color:var(--t-intro-gray)]"
          initial={reducedMotion === true ? false : { opacity: 0 }}
          animate={{ opacity: 0.72 }}
          transition={{
            duration: reducedMotion === true ? 0 : 0.8,
            delay: reducedMotion === true ? 0 : 3.3,
          }}
        >
          Enter or click to continue
        </motion.p>
      </div>
    </div>
  );
}

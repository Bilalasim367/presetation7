"use client";

import { useReducedMotion } from "motion/react";
import { animationConfig } from "@/config/animation";

/**
 * Lightweight floating psychology symbols with CSS-only motion.
 * Monochrome, low opacity, pointer-events none. Hidden under reduced motion.
 */
export function FloatingSymbols() {
  const reducedMotion = useReducedMotion();

  if (!animationConfig.floatingSymbols) {
    return null;
  }
  if (reducedMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }, (_, index) => (
        <span
          key={index}
          className="floating-symbol absolute select-none font-display text-[color:var(--t-text)]"
          style={{
            left: `${(index * 13 + 7) % 92}%`,
            top: `${(index * 19 + 11) % 88}%`,
            fontSize: 14 + (index % 5) * 6,
            opacity: 0.04 + (index % 4) * 0.015,
            animationDelay: `${index * 0.9}s`,
            animationDuration: `${18 + (index % 6) * 4}s`,
          }}
        >
          {index % 3 === 0 ? "?" : index % 3 === 1 ? "○" : "◊"}
        </span>
      ))}
    </div>
  );
}

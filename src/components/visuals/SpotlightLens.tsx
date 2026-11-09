"use client";

import { useEffect, useState } from "react";
import { animationConfig } from "@/config/animation";

/**
 * A cursor-following spotlight used on the projective section: the stage stays
 * readable, but a soft lens of clarity follows the pointer, echoing the idea
 * that the observer supplies meaning to ambiguity.
 */
export function SpotlightLens({ active }: { active: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!active || !animationConfig.floatingSymbols) {
      return;
    }
    const onMove = (event: MouseEvent) => {
      setPos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[35]"
      aria-hidden
      style={{
        background: `radial-gradient(circle 260px at ${pos.x}px ${pos.y}px, transparent 0%, color-mix(in srgb, var(--t-bg) 55%, transparent) 75%, color-mix(in srgb, var(--t-bg) 78%, transparent) 100%)`,
      }}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks which newly revealed item should carry the key-word glow class.
 *
 * The glow itself is a 600 ms CSS animation. The class stays attached to the
 * last revealed item so the state is inspectable and screen readers are not
 * interrupted by a second layout change; the animation only runs once.
 */
export const useBuildGlow = (build: number): number | null => {
  const previousBuild = useRef(build);
  const [glowIndex, setGlowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (build > previousBuild.current) {
      setGlowIndex(build - 1);
    }

    previousBuild.current = build;
  }, [build]);

  return glowIndex;
};

export const isRevealed = (index: number, build: number, totalBuilds: number): boolean =>
  totalBuilds === 0 || index < build;

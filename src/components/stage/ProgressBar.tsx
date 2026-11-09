"use client";

import type { SectionId } from "@design/tokens";

interface ProgressBarProps {
  section: SectionId;
  progress: number;
}

export function ProgressBar({ section, progress }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[4px] bg-line/45"
      data-testid="progress-track"
      aria-hidden
    >
      <div
        className={`h-full transition-[width,background-color,box-shadow] duration-700 ease-[var(--t-ease)] ${
          clamped >= 0.999 ? "progress-complete" : ""
        }`}
        style={{
          width: `${clamped * 100}%`,
          background: `linear-gradient(135deg, var(--t-s${section}), var(--t-accent))`,
          boxShadow: "0 0 18px color-mix(in srgb, var(--t-accent) 28%, transparent)",
        }}
        data-testid="progress-bar"
        data-progress={clamped.toFixed(3)}
      />
    </div>
  );
}

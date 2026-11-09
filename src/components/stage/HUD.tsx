"use client";

import { motion, useReducedMotion } from "motion/react";
import { meta } from "@data/meta";
import type { NavState } from "@/state/navigation";
import { easeBezier } from "@design/tokens";
import { Timer } from "./Timer";
import { getSection } from "@data/slides";

interface HUDProps {
  state: NavState;
  onShortcuts: () => void;
}

export function HUD({ state, onShortcuts }: HUDProps) {
  const reducedMotion = useReducedMotion();
  const section = state.view === "section" ? getSection(state.section) : undefined;
  const student = meta.students[state.section - 1] ?? "Presenter";
  const totalMinutes = Math.round(
    Object.values(meta.targetSeconds).reduce((sum, seconds) => sum + seconds, 0) / 60,
  );
  const sectionLabel = section
    ? `${section.shortTitle} · ${student}`
    : `Five sections · ${totalMinutes} minutes`;
  const slideLabel = section
    ? `Section ${section.id} · ${state.slide}/${section.slides.length}`
    : null;
  const labelTransition = {
    duration: reducedMotion ? 0 : 0.34,
    ease: easeBezier,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20" data-testid="hud">
      <div className="absolute left-[112px] top-[38px] flex items-center gap-4">
        <span
          className="grid h-11 w-11 place-items-center border border-line bg-surface/40 font-display text-[25px] font-medium leading-none text-text"
          aria-hidden
        >
          P
        </span>
        <div className="flex items-center gap-4">
          <span className="type-figure text-muted">{meta.deckTitle}</span>
          <span className="h-[1px] w-8 bg-line" aria-hidden />
          <span className="type-figure text-muted/80">Five parts</span>
        </div>
      </div>

      <div className="absolute right-[112px] top-[42px] flex items-center gap-7">
        {section ? (
          <Timer
            targetSeconds={meta.targetSeconds[section.id]}
            runId={state.runId}
            visible={state.timerVisible && !state.blank}
          />
        ) : null}
        <button
          type="button"
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/35 type-hud text-muted transition-colors duration-150 ease-[var(--t-ease)] hover:border-line-strong hover:bg-surface-hi hover:text-text"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          data-no-advance
          data-testid="shortcuts-button"
          tabIndex={-1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            onShortcuts();
          }}
        >
          ?
        </button>
      </div>

      <div className="absolute bottom-[38px] left-[112px] flex items-center gap-3">
        <motion.span
          key={section ? `dot-${section.id}` : "dot-hub"}
          className="h-[7px] w-[7px] rounded-full"
          style={{
            backgroundColor:
              state.view === "section" ? `var(--t-s${state.section})` : "var(--t-line-strong)",
          }}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: easeBezier }}
          aria-hidden
        />
        <motion.span
          key={section ? `label-${section.id}` : "label-hub"}
          className="type-hud text-muted"
          initial={reducedMotion ? false : { opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={labelTransition}
          data-testid="hud-section"
        >
          {sectionLabel}
        </motion.span>
      </div>

      <div className="absolute bottom-[38px] right-[112px]">
        {section ? (
          <motion.span
            key={`indicator-${section.id}-${state.slide}`}
            className="type-hud tabular text-text"
            initial={reducedMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={labelTransition}
            data-testid="slide-indicator"
          >
            {slideLabel}
          </motion.span>
        ) : (
          <motion.span
            key="hub-hint"
            className="type-hud text-muted"
            initial={reducedMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={labelTransition}
            data-testid="hub-hint"
          >
            Press Enter to begin · 1–5 to choose
          </motion.span>
        )}
      </div>
    </div>
  );
}

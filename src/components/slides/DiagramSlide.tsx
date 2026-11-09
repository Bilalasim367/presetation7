"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { easeBezier, motionTokens } from "@design/tokens";
import type { DiagramVisual } from "@data/slides";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import type { SlideViewProps } from "./types";

const SectionDiagram = dynamic(
  () => import("@/components/visuals/SectionDiagram").then((module) => module.SectionDiagram),
  {
    ssr: false,
    loading: () => <DiagramSkeleton />,
  },
);

const CAPTIONS: Record<DiagramVisual, string> = {
  persona: "Five nested fields · one relatively stable core",
  purpose: "Five domains orbiting a shared purpose",
  classification: "A taxonomy branching into two traditions",
  projective: "A symmetric form shaped by ambiguity",
  objective: "Five dimensions held against a normative frame",
  formalInformal: "Rigid grid and flowing ribbon · one spectrum",
  rorschach: "Ten ambiguous cards · one featured response",
};

const FIGURES: Record<DiagramVisual, string> = {
  persona: "Fig. 01 · Persona field",
  purpose: "Fig. 02 · Five domains",
  classification: "Fig. 03 · Method tree",
  projective: "Fig. 04 · Projective form",
  objective: "Fig. 05 · Trait matrix",
  formalInformal: "Fig. 06 · Structure spectrum",
  rorschach: "Fig. 07 · Card fan",
};

const SCENES: readonly DiagramVisual[] = [
  "persona",
  "purpose",
  "classification",
  "projective",
  "objective",
  "formalInformal",
  "rorschach",
];

const isDiagramScene = (value: SlideViewProps["slide"]["visual"]): value is DiagramVisual =>
  value !== undefined && SCENES.includes(value as DiagramVisual);

function DiagramSkeleton() {
  return (
    <div className="h-full w-full" aria-hidden>
      <div className="mx-auto mt-[110px] h-[360px] w-[360px] rounded-full border border-line/70" />
      <div className="mx-auto mt-24 h-[2px] w-[420px] bg-line/50" />
    </div>
  );
}

export function DiagramSlide({ section, slide, theme }: SlideViewProps) {
  const reducedMotion = useReducedMotion();
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const scene: DiagramVisual = isDiagramScene(slide.visual) ? slide.visual : "persona";

  return (
    <SlideFrame section={section}>
      <div className="grid h-full grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] items-center gap-[64px]">
        <div className="flex flex-col justify-center">
          <SlideHeader section={section} slide={slide} />

          <div className="mt-10 space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={`${slide.id}-${index}`}
                className="flex gap-5"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : motionTokens.duration.slow / 1000,
                  ease: easeBezier,
                  delay: reducedMotion ? 0 : 0.24 + index * 0.12,
                }}
              >
                <span
                  className="mt-[15px] h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--t-s${section.id})` }}
                  aria-hidden
                />
                <p className="type-body text-text">
                  <RichText text={item} />
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 flex items-center gap-4 border-t border-line pt-5"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.7 }}
          >
            <span className="type-figure text-muted">Animated figure</span>
            <span className="h-[1px] flex-1 bg-line" aria-hidden />
            <span className="type-caption text-muted">
              {reducedMotion ? "Static figure · reduced motion" : "Move the cursor to shift the form"}
            </span>
          </motion.div>
        </div>

        <aside className="flex h-full flex-col justify-center">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="type-figure text-muted">{FIGURES[scene]}</p>
            <span className="flex items-center gap-2 type-caption text-muted">
              <span
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: `var(--t-s${section.id})` }}
                aria-hidden
              />
              3D · {reducedMotion ? "Static" : "Live"}
            </span>
          </div>

          <motion.div
            className="relative mt-5 h-[650px] overflow-hidden border border-line bg-surface/25"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.988 }}
            animate={
              reducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: [1, 1.006, 1] }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.9,
              ease: easeBezier,
              delay: reducedMotion ? 0 : 0.12,
              scale: reducedMotion
                ? undefined
                : { duration: 9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
            data-no-advance
          >
            <SectionDiagram scene={scene} theme={theme} sectionId={section.id} />
            {!reducedMotion ? (
              <motion.span
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, var(--t-s${section.id}), transparent)`,
                  boxShadow: `0 0 18px var(--t-s${section.id})`,
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 650], opacity: [0, 0.85, 0] }}
                transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                aria-hidden
              />
            ) : null}
            <span
              className="pointer-events-none absolute left-5 top-5 h-4 w-4 border-l border-t"
              style={{ borderColor: `var(--t-s${section.id})` }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute bottom-5 right-5 h-4 w-4 border-b border-r"
              style={{ borderColor: `var(--t-s${section.id})` }}
              aria-hidden
            />
          </motion.div>

          <div className="mt-4 flex items-center justify-between gap-8">
            <p className="type-caption text-muted">{CAPTIONS[scene]}</p>
            <span className="type-figure text-muted">{String(section.id).padStart(2, "0")}</span>
          </div>
        </aside>
      </div>
    </SlideFrame>
  );
}

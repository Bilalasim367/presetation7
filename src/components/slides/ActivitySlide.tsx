"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { easeBezier, motionTokens } from "@design/tokens";
import { RichText } from "./RichText";
import { SlideFrame } from "./SlideChrome";
import type { SlideViewProps } from "./types";

const InkblotVisual = dynamic(
  () => import("@/components/visuals/InkblotVisual").then((module) => module.InkblotVisual),
  {
    ssr: false,
    loading: () => (
      <div className="h-[760px] w-[620px] max-w-full border border-line bg-surface/20" aria-hidden />
    ),
  },
);

export function ActivitySlide({ section, slide }: SlideViewProps) {
  const reducedMotion = useReducedMotion();
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const hasVisual = slide.visual === "inkblot";

  return (
    <SlideFrame section={section}>
      <div
        className={`grid h-full gap-[64px] ${
          hasVisual ? "grid-cols-[minmax(0,1fr)_620px]" : "grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]"
        }`}
        data-testid="activity-slide"
      >
        <div className="flex min-h-0 flex-col justify-center">
          <div className="flex items-center gap-3">
            <motion.span
              className="h-[8px] w-[8px] rounded-full"
              style={{ backgroundColor: `var(--t-s${section.id})` }}
              animate={reducedMotion ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              aria-hidden
            />
            <span className="type-figure text-muted">
              Live activity · Section {String(section.id).padStart(2, "0")}
            </span>
          </div>

          <h1 className="mt-6 max-w-[980px] type-slide-title text-text" data-testid="slide-heading">
            <RichText text={slide.heading} />
          </h1>
          {slide.subheading ? (
            <p className="mt-5 max-w-[900px] type-subheading text-accent">
              <RichText text={slide.subheading} />
            </p>
          ) : null}

          <ol className="mt-10 border-b border-line">
            {items.map((item, index) => (
              <motion.li
                key={`${slide.id}-${index}`}
                className="grid grid-cols-[54px_1fr] items-baseline gap-6 border-t border-line py-5"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : motionTokens.duration.slow / 1000,
                  ease: easeBezier,
                  delay: reducedMotion ? 0 : 0.2 + index * 0.1,
                }}
              >
                <span
                  className="type-figure tabular"
                  style={{ color: `var(--t-s${section.id})` }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="type-body text-text">
                  <RichText text={item} />
                </p>
              </motion.li>
            ))}
          </ol>
        </div>

        <aside className="flex min-h-0 items-center justify-center">
          {hasVisual ? (
            <InkblotVisual sectionId={section.id} />
          ) : (
            <motion.div
              className="relative flex h-[620px] w-full flex-col justify-between overflow-hidden border border-line bg-surface/20 p-8"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.8, ease: easeBezier, delay: 0.15 }}
              aria-hidden
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 16%, transparent)` }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 10%, transparent)` }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 22%, transparent)` }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: `var(--t-s${section.id})` }}
                  animate={
                    reducedMotion
                      ? undefined
                      : { opacity: [0.32, 0.05, 0.32], scale: [0.96, 1.04, 0.96] }
                  }
                  transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
                  style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 30%, transparent)` }}
                  animate={reducedMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <span
                  className="absolute -bottom-10 right-2 select-none font-display text-[300px] leading-none tracking-[-0.07em]"
                  style={{ color: `color-mix(in srgb, var(--t-s${section.id}) 6%, transparent)` }}
                >
                  {String(section.id).padStart(2, "0")}
                </span>
              </div>

              <div className="relative flex items-center justify-between">
                <span className="type-figure text-muted">Audience participation</span>
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: `var(--t-s${section.id})` }}
                />
              </div>

              <div className="relative text-center">
                <p className="type-figure text-muted">Your turn</p>
                <p className="mt-4 font-display text-[64px] leading-[1.02] tracking-[-0.03em] text-text">
                  Look. Listen.
                  <br />
                  Compare.
                </p>
              </div>

              <div className="relative flex items-center justify-between border-t border-line pt-4">
                <span className="type-caption text-muted">No wrong answers</span>
                <span className="type-caption text-muted">Discuss with a neighbour</span>
              </div>
            </motion.div>
          )}
        </aside>
      </div>
    </SlideFrame>
  );
}

"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Lock } from "lucide-react";
import { formatTarget, meta } from "@data/meta";
import {
  getSectionPlan,
  isSectionAvailable,
  SECTION_PLAN,
} from "@data/slides";
import type { SectionId } from "@design/tokens";
import { easeBezier, motionTokens } from "@design/tokens";
import { resolveIcon } from "@/components/icons";

interface HubProps {
  completed: ReadonlySet<number>;
  onEnter: (section: SectionId) => void;
}

export function Hub({ completed, onEnter }: HubProps) {
  const reducedMotion = useReducedMotion();
  const total = SECTION_PLAN.length;
  const completedCount = SECTION_PLAN.filter((section) => completed.has(section.id)).length;
  const suggested = SECTION_PLAN.find(
    (section) => isSectionAvailable(section.id) && !completed.has(section.id),
  );

  return (
    <div
      className="flex h-full w-full flex-col px-[112px] pb-[118px] pt-[148px]"
      data-testid="hub"
    >
      <div className="flex items-end justify-between gap-16">
        <div className="max-w-[1080px]">
          <div className="flex items-center gap-4">
            <span className="h-[7px] w-[7px] rounded-full bg-accent" aria-hidden />
            <p className="type-figure text-accent">Overview · five parts</p>
          </div>

          <h1 className="mt-7 max-w-[1050px] type-hub-title gradient-text" data-testid="hub-title">
            {meta.deckTitle}
          </h1>
          <p className="mt-5 type-subheading text-accent">{meta.deckSubtitle}</p>

          <div className="mt-9 flex items-center gap-5">
            <span className="h-[1px] w-12 bg-line-strong" aria-hidden />
            <p className="type-hud text-muted">
              {meta.course} · {meta.university} · {meta.date}
            </p>
          </div>
        </div>

        <aside className="w-[405px] shrink-0 border-t border-line pt-6">
          <p className="type-figure text-muted">The plan</p>
          <p className="mt-4 type-body text-text">
            Five short sections. Choose a part, present it, then return here.
          </p>

          <div className="mt-8 flex items-center justify-between">
            <span className="type-figure text-muted">Complete</span>
            <span className="type-hud tabular text-text">
              {completedCount} / {total}
            </span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {SECTION_PLAN.map((section) => {
              const done = completed.has(section.id);
              const available = isSectionAvailable(section.id);
              return (
                <span
                  key={section.id}
                  className="h-[5px] flex-1"
                  style={{
                    backgroundColor: `var(--t-s${section.id})`,
                    opacity: done ? 1 : available ? 0.32 : 0.16,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <span className="border border-line px-2 py-1 type-caption text-muted">Enter</span>
            <span className="type-hud text-muted">begin the next available section</span>
          </div>
        </aside>
      </div>

      {completedCount === total ? (
        <motion.div
          className="mb-6 flex items-center justify-between border border-line bg-surface/40 px-6 py-4"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: easeBezier }}
          data-testid="presentation-complete"
        >
          <span className="type-figure" style={{ color: "var(--t-accent)" }}>
            Presentation complete
          </span>
          <span className="type-hud text-muted">
            Thank you — questions and discussion
          </span>
        </motion.div>
      ) : null}

      <div
        className="mt-auto grid grid-cols-5 gap-6"
        data-testid="section-grid"
        aria-label="Presentation sections"
      >
        {SECTION_PLAN.map((plan, index) => {
          const section = getSectionPlan(plan.id);
          const available = isSectionAvailable(plan.id);
          const done = completed.has(plan.id);
          const isSuggested = suggested?.id === plan.id;
          const title = section?.title ?? plan.title;
          const iconName = section?.icon ?? plan.icon;
          const student = meta.students[plan.id - 1] ?? "Presenter";
          const target = meta.targetSeconds[plan.id];
          const Icon = resolveIcon(iconName);

          return (
            <motion.button
              key={plan.id}
              type="button"
              disabled={!available}
              className="group relative flex min-h-[348px] flex-col overflow-hidden border border-line bg-surface/35 p-7 text-left transition-[background-color,border-color,transform] duration-300 ease-[var(--t-ease)] enabled:hover:-translate-y-1 enabled:hover:border-line-strong enabled:hover:bg-surface-hi disabled:cursor-default"
              style={
                {
                  "--section-color": `var(--t-s${plan.id})`,
                } as CSSProperties
              }
              onClick={() => onEnter(plan.id)}
              data-testid={`hub-card-${plan.id}`}
              data-available={available}
              data-cursor-label="explore"
              data-completed={done}
              aria-label={`Open section ${plan.id}: ${title} — ${student}${available ? "" : " (in preparation)"}`}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : motionTokens.duration.slow / 1000,
                ease: easeBezier,
                delay: reducedMotion ? 0 : 0.12 + index * (motionTokens.stagger / 1000),
              }}
            >
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ backgroundColor: "var(--section-color)", opacity: available ? 0.9 : 0.38 }}
                aria-hidden
              />

              <span
                className="pointer-events-none absolute inset-0 border"
                style={{
                  borderColor: "var(--section-color)",
                  opacity: done ? 0.28 : isSuggested ? 0.5 : available ? 0.18 : 0.08,
                }}
                aria-hidden
              />

              {isSuggested && !reducedMotion ? (
                <motion.span
                  className="pointer-events-none absolute inset-0 border"
                  style={{ borderColor: "var(--section-color)" }}
                  animate={{ opacity: [0.16, 0.5, 0.16] }}
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  aria-hidden
                />
              ) : null}

              <div className="flex items-start justify-between">
                <span
                  className="font-display text-[50px] leading-none tracking-[-0.04em]"
                  style={{ color: "var(--section-color)" }}
                  aria-hidden
                >
                  {String(plan.id).padStart(2, "0")}
                </span>
                <span
                  className="grid h-11 w-11 place-items-center border"
                  style={{
                    color: "var(--section-color)",
                    borderColor: `color-mix(in srgb, var(--section-color) 48%, transparent)`,
                    backgroundColor: `color-mix(in srgb, var(--section-color) 7%, transparent)`,
                  }}
                  aria-hidden
                >
                  <Icon size={24} strokeWidth={1.5} />
                </span>
              </div>

              <div className="mt-8">
                <p className="type-card-title text-text">{title}</p>
                <p className="mt-3 type-hud text-muted">{student}</p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-line/80 pt-4">
                <span className="type-caption text-muted">{formatTarget(target)}</span>
                <span className="flex items-center gap-2 type-caption text-muted">
                  {done ? (
                    <>
                      <Check size={17} strokeWidth={1.8} aria-hidden />
                      Complete
                    </>
                  ) : available ? (
                    <>
                      {isSuggested ? (
                        <span
                          className="h-[6px] w-[6px] rounded-full"
                          style={{ backgroundColor: "var(--section-color)" }}
                          aria-hidden
                        />
                      ) : null}
                      {isSuggested ? "Suggested" : "Ready"}
                    </>
                  ) : (
                    <>
                      <Lock size={16} strokeWidth={1.5} aria-hidden />
                      In preparation
                    </>
                  )}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

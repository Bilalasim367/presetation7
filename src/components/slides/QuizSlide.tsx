"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { easeBezier, motionTokens } from "@design/tokens";
import { getBuildCount } from "@data/slides";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import type { SlideViewProps } from "./types";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function QuizSlide({ section, slide, build }: SlideViewProps) {
  const reducedMotion = useReducedMotion();
  const questions = slide.quiz ?? [];
  const totalBuilds = getBuildCount(slide);
  const revealed = totalBuilds === 0 ? questions.length : build;
  const started = revealed > 0;

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <SlideHeader section={section} slide={slide} />

        <div className="relative mt-8 min-h-0 flex-1">
          {started ? (
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-5">
              {questions.map((question, index) => {
                const visible = questions.length === 0 || index < revealed;
                const isCurrent = index === revealed - 1;

                if (!visible) {
                  return (
                    <div
                      key={`${slide.id}-${index}`}
                      className="relative flex flex-col justify-between overflow-hidden border p-6"
                      style={{
                        borderColor: "var(--t-line)",
                        opacity: 0.42,
                        filter: "blur(1.5px)",
                      }}
                      aria-hidden
                      data-quiz-index={index}
                      data-revealed="false"
                    >
                      <div className="flex items-center justify-between border-b border-line pb-3">
                        <span className="type-figure text-muted">
                          Question {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="type-figure text-muted">Locked</span>
                      </div>
                      <div className="flex flex-1 items-center justify-center py-8">
                        <span
                          className="grid h-10 w-10 place-items-center border border-line text-muted"
                          aria-hidden
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="5" y="11" width="14" height="10" rx="2" />
                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                          </svg>
                        </span>
                      </div>
                      <p className="type-caption text-muted">Revealed on the next advance</p>
                    </div>
                  );
                }

                return (
                  <motion.article
                    key={`${slide.id}-${index}`}
                    className="relative flex flex-col justify-between overflow-hidden border p-6"
                    style={{
                      borderColor: isCurrent
                        ? `color-mix(in srgb, var(--t-s${section.id}) 55%, transparent)`
                        : "var(--t-line)",
                      backgroundColor: isCurrent
                        ? `color-mix(in srgb, var(--t-s${section.id}) 5%, transparent)`
                        : "transparent",
                    }}
                    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : motionTokens.duration.slow / 1000,
                      ease: easeBezier,
                    }}
                    data-quiz-index={index}
                    data-revealed={visible}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-line pb-3">
                        <span className="type-figure text-muted">
                          Question {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="type-figure"
                          style={{ color: `var(--t-s${section.id})` }}
                        >
                          A or B
                        </span>
                      </div>

                      <h2 className="mt-5 max-w-[660px] type-card-title text-text">
                        <RichText text={question.q} />
                      </h2>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {question.options.map((option, optionIndex) => {
                        const correct = optionIndex === question.answer;
                        return (
                          <div
                            key={`${index}-${optionIndex}`}
                            className="flex items-center gap-3 border px-4 py-3"
                            style={{
                              borderColor: correct
                                ? `var(--t-s${section.id})`
                                : "var(--t-line)",
                              backgroundColor: correct
                                ? `color-mix(in srgb, var(--t-s${section.id}) 9%, transparent)`
                                : "transparent",
                              opacity: correct ? 1 : 0.58,
                            }}
                            data-correct={correct}
                          >
                            <span
                              className="grid h-7 w-7 shrink-0 place-items-center border type-figure"
                              style={{
                                borderColor: correct
                                  ? `var(--t-s${section.id})`
                                  : "var(--t-line-strong)",
                                color: correct
                                  ? `var(--t-s${section.id})`
                                  : "var(--t-muted)",
                              }}
                            >
                              {correct ? (
                                <Check size={15} strokeWidth={2} aria-hidden />
                              ) : (
                                OPTION_LABELS[optionIndex] ?? "·"
                              )}
                            </span>
                            <span className="type-caption text-text">
                              <RichText text={option} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <motion.div
              className="flex h-full flex-col items-center justify-center border border-line bg-surface/20 text-center"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: easeBezier }}
            >
              <span
                className="h-[8px] w-[8px] rounded-full"
                style={{ backgroundColor: `var(--t-s${section.id})` }}
                aria-hidden
              />
              <p className="mt-6 type-figure text-muted">Audience check</p>
              <p className="mt-4 font-display text-[62px] leading-tight tracking-[-0.03em] text-text">
                Ready when you are.
              </p>
              <p className="mt-4 max-w-[620px] type-body text-muted">
                Advance once to reveal each question. The correct option appears with it.
              </p>
            </motion.div>
          )}

          {started && revealed === questions.length ? (
            <motion.div
              className="pointer-events-none absolute inset-0 grid place-items-center"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: easeBezier }}
              aria-hidden
            >
              <span
                className="border border-line bg-surface/80 px-6 py-3 type-figure"
                style={{ color: `var(--t-s${section.id})` }}
              >
                All four revealed
              </span>
            </motion.div>
          ) : null}

          <div className="pointer-events-none absolute bottom-3 right-0 flex items-center gap-2" aria-hidden>
            {questions.map((_, index) => (
              <span
                key={`quiz-segment-${index}`}
                className="h-[3px] w-9 transition-opacity duration-500"
                style={{
                  backgroundColor: `var(--t-s${section.id})`,
                  opacity: index < revealed ? 1 : 0.18,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

"use client";

import { motion, useReducedMotion } from "motion/react";
import { getBuildCount } from "@data/slides";
import { easeBezier, motionTokens } from "@design/tokens";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

export function TableSlide({ section, slide, build }: SlideViewProps) {
  const reducedMotion = useReducedMotion();
  const glowIndex = useBuildGlow(build);
  const table = slide.table;
  const rows = table?.rows ?? [];
  const columns = table?.columns ?? [];
  const totalBuilds = getBuildCount(slide);

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <SlideHeader section={section} slide={slide} />

        <div className="relative mt-8 min-h-0 flex-1">
          {!reducedMotion && build < rows.length ? (
            <motion.span
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, var(--t-s${section.id}), transparent)`,
                boxShadow: `0 0 14px var(--t-s${section.id})`,
              }}
              animate={{ y: [0, 420], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              aria-hidden
            />
          ) : null}
          <table className="w-full table-fixed border-collapse" data-testid="comparison-table">
            <colgroup>
              {columns.map((column, index) => (
                <col
                  key={column}
                  style={{ width: index === 0 ? "22%" : `${78 / Math.max(1, columns.length - 1)}%` }}
                />
              ))}
            </colgroup>
            <thead>
              <tr className="border-y border-line-strong bg-surface/55">
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-5 py-3 text-left type-figure font-medium text-accent"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const revealed = totalBuilds === 0 || rowIndex < build;
                return (
                  <motion.tr
                    key={`${slide.id}-${rowIndex}`}
                    className="border-b border-line"
                    style={{ visibility: revealed ? "visible" : "hidden" }}
                    initial={false}
                    animate={{ opacity: revealed ? 1 : 0 }}
                    transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                    data-build-index={rowIndex}
                    data-revealed={revealed}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${rowIndex}-${cellIndex}`}
                        className={`px-5 py-[13px] align-top type-table ${
                          cellIndex === 0 ? "font-medium text-text" : "text-text"
                        }`}
                      >
                        <RichText text={cell} glow={glowIndex === rowIndex} />
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SlideFrame>
  );
}

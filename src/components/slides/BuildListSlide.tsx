"use client";

import { motion } from "motion/react";
import { easeBezier, motionTokens } from "@design/tokens";
import { getBuildCount } from "@data/slides";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

export function BuildListSlide({ section, slide, build }: SlideViewProps) {
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const totalBuilds = getBuildCount(slide);
  const midpoint = Math.ceil(items.length / 2);
  const columns = [items.slice(0, midpoint), items.slice(midpoint)];

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <SlideHeader section={section} slide={slide} />

        <div className="mt-10 grid min-h-0 flex-1 grid-cols-2 gap-x-[96px]">
          {columns.map((column, columnIndex) => (
            <ol key={columnIndex} className="flex flex-col justify-center border-b border-line">
              {column.map((item, itemIndex) => {
                const index = columnIndex * midpoint + itemIndex;
                const revealed = totalBuilds === 0 || index < build;
                return (
                  <motion.li
                    key={`${slide.id}-${index}`}
                    className="grid grid-cols-[52px_1fr] items-baseline gap-5 border-t border-line py-6"
                    style={{ visibility: revealed ? "visible" : "hidden" }}
                    initial={false}
                    animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : -10 }}
                    transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                    data-build-index={index}
                    data-revealed={revealed}
                  >
                    <span
                      className="type-figure tabular"
                      style={{ color: `var(--t-s${section.id})` }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="type-body-lg text-text">
                      <RichText text={item} glow={glowIndex === index} />
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

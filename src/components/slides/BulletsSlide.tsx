"use client";

import { motion, useReducedMotion } from "motion/react";
import { easeBezier, motionTokens } from "@design/tokens";
import { getBuildCount } from "@data/slides";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

export function BulletsSlide({ section, slide, build }: SlideViewProps) {
  const reducedMotion = useReducedMotion();
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const totalBuilds = getBuildCount(slide);
  const dense = items.length > 3;

  return (
    <SlideFrame section={section}>
      <div className="grid h-full grid-cols-[minmax(0,0.37fr)_minmax(0,0.63fr)] gap-[88px]">
        <div className="flex flex-col justify-center">
          <SlideHeader section={section} slide={slide} />
          <span className="mt-12 h-[1px] w-20 bg-line-strong" aria-hidden />
        </div>

        <div className="flex flex-col justify-center">
          <ol className="border-b border-line">
            {items.map((item, index) => {
              const revealed = totalBuilds === 0 || index < build;
              return (
                <motion.li
                  key={`${slide.id}-${index}`}
                  className={`grid grid-cols-[54px_1fr] gap-7 border-t border-line ${
                    dense ? "py-5" : "py-9"
                  }`}
                  style={{ visibility: revealed ? "visible" : "hidden" }}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
                  transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                  data-build-index={index}
                  data-revealed={revealed}
                >
                  <span className="type-figure tabular pt-[7px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className={`${dense ? "type-body" : "type-body-lg"} text-text`}>
                    <RichText text={item} glow={glowIndex === index} />
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </SlideFrame>
  );
}

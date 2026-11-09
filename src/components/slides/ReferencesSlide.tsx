"use client";

import { motion } from "motion/react";
import { getBuildCount } from "@data/slides";
import { easeBezier, motionTokens } from "@design/tokens";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

export function ReferencesSlide({ section, slide, build }: SlideViewProps) {
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const totalBuilds = getBuildCount(slide);

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-10">
          <SlideHeader section={section} slide={slide} />
          {slide.status === "draft" ? (
            <span className="mt-1 shrink-0 border border-over/50 px-3 py-2 type-figure text-over">
              Draft
            </span>
          ) : null}
        </div>

        <ol className="mt-10 min-h-0 flex-1 border-b border-line">
          {items.map((item, index) => {
            const revealed = totalBuilds === 0 || index < build;
            return (
              <motion.li
                key={`${slide.id}-${index}`}
                className="flex gap-6 border-t border-line py-4"
                style={{ visibility: revealed ? "visible" : "hidden" }}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 }}
                transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                data-build-index={index}
                data-revealed={revealed}
              >
                <span className="type-hud tabular w-9 shrink-0 text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="type-reference text-text [text-wrap:pretty]">
                  <RichText text={item} glow={glowIndex === index} />
                </p>
              </motion.li>
            );
          })}
        </ol>

        <p className="mt-4 type-caption text-muted">
          APA 7th edition · draft references require verification before submission.
        </p>
      </div>
    </SlideFrame>
  );
}

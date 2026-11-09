"use client";

import { motion } from "motion/react";
import type { CardItem } from "@data/slides";
import { getBuildCount } from "@data/slides";
import { easeBezier, motionTokens } from "@design/tokens";
import { resolveIcon } from "@/components/icons";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

export function CardsSlide({ section, slide, build }: SlideViewProps) {
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter(
    (item): item is CardItem => typeof item === "object" && item !== null,
  );
  const totalBuilds = getBuildCount(slide);

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <SlideHeader section={section} slide={slide} />

        <div
          className="mt-10 grid flex-1 content-center gap-5"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => {
            const revealed = totalBuilds === 0 || index < build;
            const Icon = resolveIcon(item.icon);
            return (
              <motion.article
                key={`${slide.id}-${index}`}
                className="relative flex min-h-[462px] flex-col border border-line bg-surface/35 p-6"
                style={{ visibility: revealed ? "visible" : "hidden" }}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 16 }}
                transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                data-build-index={index}
                data-revealed={revealed}
              >
                <span
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ backgroundColor: `var(--t-s${section.id})` }}
                  aria-hidden
                />

                <div className="flex items-start justify-between">
                  <span
                    className="grid h-12 w-12 place-items-center border"
                    style={{
                      color: `var(--t-s${section.id})`,
                      borderColor: `color-mix(in srgb, var(--t-s${section.id}) 45%, transparent)`,
                      backgroundColor: `color-mix(in srgb, var(--t-s${section.id}) 7%, transparent)`,
                    }}
                    aria-hidden
                  >
                    <Icon size={25} strokeWidth={1.5} />
                  </span>
                  <span className="type-figure tabular text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="mt-10 type-card-title text-text">
                  <RichText text={item.title} glow={glowIndex === index} />
                </h2>
                <p className="mt-4 type-card-body text-text">
                  <RichText text={item.text} glow={glowIndex === index} />
                </p>

                <span
                  className="mt-auto block h-[1px] w-9"
                  style={{ backgroundColor: `var(--t-s${section.id})` }}
                  aria-hidden
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}

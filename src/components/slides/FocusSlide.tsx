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

export function FocusSlide({ section, slide, build }: SlideViewProps) {
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter(
    (item): item is CardItem => typeof item === "object" && item !== null,
  );
  const totalBuilds = getBuildCount(slide);

  return (
    <SlideFrame section={section}>
      <div className="flex h-full flex-col">
        <SlideHeader section={section} slide={slide} />

        <div className="mt-9 grid min-h-0 flex-1 grid-cols-2 content-center gap-8">
          {items.map((item, index) => {
            const revealed = totalBuilds === 0 || index < build;
            const accent = index === 0 ? "var(--t-s4)" : "var(--t-s5)";
            const Icon = resolveIcon(item.icon);
            return (
              <motion.article
                key={`${slide.id}-${index}`}
                className="relative flex min-h-[470px] flex-col justify-between overflow-hidden border p-10"
                style={{
                  visibility: revealed ? "visible" : "hidden",
                  borderColor: `color-mix(in srgb, ${accent} 42%, transparent)`,
                  background: `linear-gradient(140deg, color-mix(in srgb, ${accent} 8%, var(--t-surface)), var(--t-surface) 58%)`,
                  boxShadow: `0 0 70px color-mix(in srgb, ${accent} 7%, transparent)`,
                }}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.985 }}
                transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                data-build-index={index}
                data-revealed={revealed}
              >
                <span
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <span
                  className="pointer-events-none absolute -bottom-14 -right-4 select-none font-display text-[240px] leading-none"
                  style={{ color: `color-mix(in srgb, ${accent} 7%, transparent)` }}
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-14 w-14 place-items-center border"
                      style={{
                        color: accent,
                        borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${accent} 7%, transparent)`,
                      }}
                      aria-hidden
                    >
                      <Icon size={29} strokeWidth={1.4} />
                    </span>
                    <span className="type-figure" style={{ color: accent }}>
                      Approach {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2 className="mt-14 type-focus-title text-text">
                    <RichText text={item.title} glow={glowIndex === index} />
                  </h2>
                  <p className="mt-5 max-w-[680px] type-body text-text">
                    <RichText text={item.text} glow={glowIndex === index} />
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <span className="h-[1px] w-10" style={{ backgroundColor: accent }} aria-hidden />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}

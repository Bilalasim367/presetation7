"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { easeBezier, motionTokens, type ThemeName } from "@design/tokens";
import { getBuildCount, type Slide } from "@data/slides";
import { RichText } from "./RichText";
import { SlideFrame, SlideHeader } from "./SlideChrome";
import { useBuildGlow } from "./useBuildGlow";
import type { SlideViewProps } from "./types";

const MaskDissolve = dynamic(
  () => import("@/components/visuals/MaskDissolve").then((module) => module.MaskDissolve),
  {
    ssr: false,
    loading: () => <VisualSkeleton />,
  },
);

const InkblotVisual = dynamic(
  () => import("@/components/visuals/InkblotVisual").then((module) => module.InkblotVisual),
  {
    ssr: false,
    loading: () => <VisualSkeleton />,
  },
);

const ChecklistVisual = dynamic(
  () => import("@/components/visuals/ChecklistVisual").then((module) => module.ChecklistVisual),
  {
    ssr: false,
    loading: () => <VisualSkeleton />,
  },
);

function VisualSkeleton() {
  return (
    <div className="h-[760px] w-[620px] max-w-full" aria-hidden>
      <div className="mx-auto mt-[132px] h-[360px] w-[360px] rounded-[48%] border border-line/70" />
      <div className="mx-auto mt-20 h-[2px] w-[420px] bg-line/50" />
    </div>
  );
}

const visualLabel = (visual: Slide["visual"]): string => {
  switch (visual) {
    case "maskDissolve":
      return "Fig. 01 · Persona";
    case "inkblot":
      return "Fig. 01 · Projective stimulus";
    case "checklist":
      return "Fig. 01 · Structured items";
    default:
      return "Fig. 01";
  }
};

function SlideVisual({
  slide,
  theme,
  sectionId,
}: {
  slide: Slide;
  theme: ThemeName;
  sectionId: SlideViewProps["section"]["id"];
}) {
  if (slide.visual === "maskDissolve") {
    return <MaskDissolve theme={theme} />;
  }
  if (slide.visual === "inkblot") {
    return <InkblotVisual sectionId={sectionId} />;
  }
  if (slide.visual === "checklist") {
    return <ChecklistVisual sectionId={sectionId} />;
  }

  return <VisualSkeleton />;
}

export function VisualTextSlide({ section, slide, build, theme }: SlideViewProps) {
  const glowIndex = useBuildGlow(build);
  const items = (slide.items ?? []).filter((item): item is string => typeof item === "string");
  const totalBuilds = getBuildCount(slide);
  const hasVisual = slide.visual !== undefined && slide.visual !== "none";

  return (
    <SlideFrame section={section}>
      <div
        className={`grid h-full gap-[72px] ${
          hasVisual ? "grid-cols-[minmax(0,1fr)_680px]" : "grid-cols-1"
        }`}
      >
        <div className="flex flex-col justify-center">
          <SlideHeader section={section} slide={slide} />

          <div className="mt-10 space-y-7">
            {items.map((item, index) => {
              const revealed = totalBuilds === 0 || index < build;
              return (
                <motion.div
                  key={`${slide.id}-${index}`}
                  className="flex gap-5"
                  style={{ visibility: revealed ? "visible" : "hidden" }}
                  initial={false}
                  animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
                  transition={{ duration: motionTokens.duration.slow / 1000, ease: easeBezier }}
                  data-build-index={index}
                  data-revealed={revealed}
                >
                  <span
                    className="mt-[15px] h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ backgroundColor: `var(--t-s${section.id})` }}
                    aria-hidden
                  />
                  <p className={`${items.length <= 2 ? "type-body-lg" : "type-body"} max-w-[900px] text-text`}>
                    <RichText text={item} glow={glowIndex === index} />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {hasVisual ? (
          <aside className="flex h-full flex-col justify-center border-l border-line pl-9">
            <p className="type-figure mb-3 text-muted">{visualLabel(slide.visual)}</p>
            <SlideVisual slide={slide} theme={theme} sectionId={section.id} />
          </aside>
        ) : null}
      </div>
    </SlideFrame>
  );
}

"use client";

import { meta } from "@data/meta";
import { RichText } from "./RichText";
import { SlideFrame } from "./SlideChrome";
import type { SlideViewProps } from "./types";

export function ClosingSlide({ section, slide }: SlideViewProps) {
  return (
    <SlideFrame section={section}>
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <div
            className="h-[620px] w-[620px] rounded-full border"
            style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 14%, transparent)` }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `color-mix(in srgb, var(--t-s${section.id}) 9%, transparent)` }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="type-figure text-accent">{meta.deckSubtitle}</p>
          <h1 className="mt-9 max-w-[1600px] type-closing text-text" data-testid="slide-heading">
            <RichText text={slide.heading} />
          </h1>
          {slide.subheading ? (
            <p className="mt-8 max-w-[1200px] type-subheading text-accent">
              <RichText text={slide.subheading} />
            </p>
          ) : null}
          <span
            className="mt-12 h-[1px] w-24"
            style={{ backgroundColor: `var(--t-s${section.id})` }}
            aria-hidden
          />
          <p className="mt-8 type-hud text-muted">{meta.deckTitle}</p>
        </div>
      </div>
    </SlideFrame>
  );
}

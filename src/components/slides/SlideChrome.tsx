import type { ReactNode } from "react";
import type { Section, Slide } from "@data/slides";
import { resolveIcon } from "@/components/icons";
import { RichText } from "./RichText";
import { motion, useReducedMotion } from "motion/react";
import { easeBezier } from "@design/tokens";

interface SlideHeaderProps {
  section: Section;
  slide: Slide;
  className?: string;
  compact?: boolean;
  titleClassName?: string;
}

function splitHeadingWords(heading: string): { text: string; bold: boolean }[] {
  const words: { text: string; bold: boolean }[] = [];
  const segments = heading.split("**");
  segments.forEach((segment, segmentIndex) => {
    const bold = segmentIndex % 2 === 1;
    const parts = segment.split(/(\s+)/);
    for (const part of parts) {
      if (part === "") {
        continue;
      }
      if (/^\s+$/.test(part)) {
        const last = words[words.length - 1];
        if (last) {
          last.text += part;
        }
        continue;
      }
      words.push({ text: part, bold });
    }
  });
  return words;
}

export function SlideHeader({
  section,
  slide,
  className = "",
  compact = false,
  titleClassName = "type-slide-title",
}: SlideHeaderProps) {
  const Icon = resolveIcon(section.icon);
  const reducedMotion = useReducedMotion();
  const words = splitHeadingWords(slide.heading);

  return (
    <header className={className}>
      <div className="flex items-center gap-4">
        <span
          className="grid h-9 w-9 place-items-center border"
          style={{
            color: `var(--t-s${section.id})`,
            borderColor: `color-mix(in srgb, var(--t-s${section.id}) 55%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--t-s${section.id}) 8%, transparent)`,
          }}
          aria-hidden
        >
          <Icon size={20} strokeWidth={1.5} />
        </span>
        <span className="type-figure text-muted">
          Section {String(section.id).padStart(2, "0")} · {section.shortTitle}
        </span>
      </div>

      <h1
        className={`mt-6 text-text [text-wrap:balance] ${titleClassName}`}
        data-testid="slide-heading"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${index}-${word.text}`}
            className={word.bold ? "font-medium" : undefined}
            style={{ display: "inline-block" }}
            initial={reducedMotion ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: reducedMotion ? 0 : 0.55,
              ease: easeBezier,
              delay: reducedMotion ? 0 : 0.08 + index * 0.05,
            }}
          >
            {word.text}
          </motion.span>
        ))}
      </h1>

      {slide.subheading ? (
        <p
          className={`text-accent [text-wrap:balance] ${
            compact ? "mt-3 type-hud" : "mt-5 type-subheading"
          }`}
        >
          <RichText text={slide.subheading} />
        </p>
      ) : null}
    </header>
  );
}

export function SlideFrame({
  section,
  children,
  className = "",
}: {
  section: Section;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative h-full w-full ${className}`}
      data-section={section.id}
      data-slide-theme={section.id}
    >
      <span
        className="pointer-events-none absolute -right-[40px] -top-[170px] select-none font-display text-[420px] leading-none numeral-drift"
        style={{ color: `color-mix(in srgb, var(--t-s${section.id}) 5%, transparent)` }}
        aria-hidden
      >
        {String(section.id).padStart(2, "0")}
      </span>
      {children}
    </div>
  );
}

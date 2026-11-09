"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import type { Section, Slide } from "@data/slides";

interface NotesOverlayProps {
  section: Section;
  slide: Slide;
  onClose: () => void;
}

export function NotesOverlay({ section, slide, onClose }: NotesOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 bg-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-title"
      data-testid="notes-overlay"
      data-no-advance
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 top-0 h-[4px]"
        style={{ background: `linear-gradient(135deg, var(--t-s${section.id}), var(--t-accent))` }}
        aria-hidden
      />
      <div
        className="mx-auto flex h-full max-w-[1696px] flex-col px-[112px] pb-[72px] pt-[64px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-10">
          <div>
            <p className="type-figure text-accent">Presenter notes</p>
            <h2 id="notes-title" className="mt-4 type-slide-title text-text">
              {slide.heading}
            </h2>
            <p className="mt-3 type-hud text-muted">
              Section {section.id} · {section.shortTitle} · slide {section.slides.indexOf(slide) + 1} of{" "}
              {section.slides.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-text"
            aria-label="Close presenter notes"
            data-no-advance
          >
            <X size={26} strokeWidth={1.5} aria-hidden />
          </button>
        </header>

        <div className="mt-12 flex-1 border-t border-line pt-10">
          {slide.status === "draft" ? (
            <p className="mb-6 inline-flex border border-over/50 px-4 py-2 type-figure text-over">
              Draft content · verify before presenting
            </p>
          ) : null}
          <p className="max-w-[1480px] whitespace-pre-line type-body-lg leading-[1.45] text-text">
            {slide.notes?.trim() || "No notes for this slide."}
          </p>
        </div>

        <footer className="flex items-center justify-between border-t border-line pt-6">
          <span className="type-hud text-muted">P or Esc to close</span>
          <span className="type-hud text-muted">
            {slide.status === "final" ? "Final content" : "Draft content"}
          </span>
        </footer>
      </div>
    </motion.div>
  );
}

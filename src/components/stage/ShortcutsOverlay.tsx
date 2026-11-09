"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ShortcutsOverlayProps {
  onClose: () => void;
}

interface ShortcutRow {
  keys: string;
  hub: string;
  section: string;
}

const rows: readonly ShortcutRow[] = [
  { keys: "→ · Space · PgDn · Enter", hub: "Begin next section", section: "Next build, then slide" },
  { keys: "← · PgUp", hub: "—", section: "Previous build or slide" },
  { keys: "1–5", hub: "Open that section", section: "Jump to slide 1" },
  { keys: "M", hub: "Overview", section: "Overview" },
  { keys: "Esc", hub: "—", section: "Close overlay · exit fullscreen · overview" },
  { keys: "F", hub: "Fullscreen", section: "Fullscreen" },
  { keys: "T", hub: "Light / dark", section: "Light / dark" },
  { keys: "B", hub: "Blank screen", section: "Blank screen" },
  { keys: "N", hub: "Timer", section: "Timer" },
  { keys: "P", hub: "—", section: "Presenter notes" },
  { keys: "?", hub: "This screen", section: "This screen" },
  { keys: "Click", hub: "Begin next section", section: "Next build, then slide" },
];

const KeyChip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center border border-line bg-surface/50 px-2.5 py-1 type-caption text-text">
    {children}
  </span>
);

export function ShortcutsOverlay({ onClose }: ShortcutsOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-50 bg-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      data-testid="shortcuts-overlay"
      data-no-advance
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full max-w-[1696px] flex-col px-[112px] pb-[52px] pt-[56px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-10">
          <div>
            <p className="type-figure text-accent">Presenter controls</p>
            <h2 id="shortcuts-title" className="mt-3 type-slide-title text-text">
              Keyboard &amp; clicker
            </h2>
            <p className="mt-2 type-hud text-muted">
              Clickers send Page Up and Page Down — they work exactly like the arrows.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-text"
            aria-label="Close shortcuts"
            data-no-advance
          >
            <X size={26} strokeWidth={1.5} aria-hidden />
          </button>
        </header>

        <div className="mt-8 flex-1 overflow-hidden border-t border-line pt-3">
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">Keyboard shortcuts for the overview and for a section</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="w-[26%] pb-3 type-figure font-medium text-muted">
                  Key
                </th>
                <th scope="col" className="w-[28%] pb-3 type-figure font-medium text-muted">
                  On the overview
                </th>
                <th scope="col" className="w-[46%] pb-3 type-figure font-medium text-muted">
                  In a section
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.keys} className="border-t border-line/70">
                  <td className="py-[7px] pr-6">
                    <KeyChip>{row.keys}</KeyChip>
                  </td>
                  <td className="py-[7px] pr-6 type-hud text-muted">{row.hub}</td>
                  <td className="py-[7px] type-hud text-text">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-line pt-5">
          <span className="type-hud text-muted">
            Space, arrows and Page Up/Down are captured so the deck never scrolls.
          </span>
          <span className="type-hud text-text">Esc or ? to close</span>
        </footer>
      </div>
    </motion.div>
  );
}

"use client";

import type { SectionId } from "@design/tokens";

const ITEMS = [
  { id: 1, text: "I prefer structured routines over ambiguity", score: 4 },
  { id: 2, text: "I remain composed under acute pressure", score: 5 },
  { id: 3, text: "I seek social variety and active collaboration", score: 3 },
  { id: 4, text: "I carefully examine details before acting", score: 4 },
  { id: 5, text: "I prioritize group consensus over autonomy", score: 2 },
] as const;

const SCALE_LABELS = ["SD", "D", "N", "A", "SA"] as const;

/**
 * Standardized checklist / rating scale visual for objective assessment.
 * Deterministic items and Likert rating scale, zero colour literals.
 */
export function ChecklistVisual({ sectionId = 5 }: { sectionId?: SectionId }) {
  return (
    <div
      className="relative flex h-[760px] w-[620px] max-w-full flex-col justify-between border border-line bg-surface/35 p-7"
      data-testid="checklist-visual"
    >
      {/* Inventory Header */}
      <div>
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="type-figure" style={{ color: `var(--t-s${sectionId})` }}>
              Standardized Self-Report Protocol
            </p>
            <p className="mt-1 type-caption text-muted">Item Response Format · 5-Point Likert</p>
          </div>
          <span className="border border-line bg-surface-hi px-3 py-1 type-figure text-text">
            Form 3-B
          </span>
        </div>

        {/* Column headings */}
        <div className="mt-5 grid grid-cols-[1fr_170px] items-center border-b border-line/60 pb-2">
          <span className="type-caption text-muted">Assessment Item</span>
          <div className="flex justify-between px-2">
            {SCALE_LABELS.map((label) => (
              <span key={label} className="w-5 text-center type-caption text-muted">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Survey Items */}
        <div className="mt-2 space-y-3">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_170px] items-center border-b border-line/40 py-3"
            >
              <div className="flex items-baseline gap-3 pr-4">
                <span className="type-figure tabular text-muted">
                  {String(item.id).padStart(2, "0")}
                </span>
                <p className="type-caption text-text [text-wrap:pretty]">{item.text}</p>
              </div>

              {/* Likert option bubbles */}
              <div className="flex items-center justify-between px-2">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = item.score === val;
                  return (
                    <div
                      key={val}
                      className="grid h-6 w-6 place-items-center rounded-full border transition-colors"
                      style={{
                        borderColor: isSelected
                          ? `var(--t-s${sectionId})`
                          : "color-mix(in srgb, var(--t-line) 80%, transparent)",
                        backgroundColor: isSelected
                          ? `var(--t-s${sectionId})`
                          : "transparent",
                      }}
                    >
                      {isSelected ? (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: "var(--t-bg)" }}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Normative Profile Section */}
      <div className="border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <span className="type-figure text-muted">Empirical Norm Profile</span>
          <span className="type-caption tabular text-accent" style={{ color: `var(--t-s${sectionId})` }}>
            T-Score: 62 · Percentile: 88th
          </span>
        </div>

        {/* Profile score distribution track */}
        <div className="mt-4">
          <div className="relative h-4 w-full rounded-sm border border-line bg-surface">
            {/* Standard score markings */}
            <div
              className="absolute inset-y-0 border-r border-line"
              style={{ left: "30%" }}
              title="T=40 (-1 SD)"
            />
            <div
              className="absolute inset-y-0 border-r border-line-strong"
              style={{ left: "50%" }}
              title="T=50 (Mean)"
            />
            <div
              className="absolute inset-y-0 border-r border-line"
              style={{ left: "70%" }}
              title="T=60 (+1 SD)"
            />

            {/* Filled score bar */}
            <div
              className="h-full rounded-sm"
              style={{
                width: "74%",
                backgroundColor: `color-mix(in srgb, var(--t-s${sectionId}) 60%, transparent)`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between type-caption text-muted">
            <span>T=30 (-2 SD)</span>
            <span>T=50 (Mean)</span>
            <span>T=70 (+2 SD)</span>
          </div>
        </div>

        {/* Psychometric Validity Indicators */}
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 type-caption text-muted">
          <span>Infrequency (F): Valid</span>
          <span>Defensiveness (K): Nominal</span>
          <span>Consistency: 0.94</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { SectionId } from "@design/tokens";

/**
 * Bilateral symmetrical inkblot visual for projective assessment.
 * Symmetrical along x = 310, deterministic geometry, zero colour literals.
 */
export function InkblotVisual({ sectionId = 4 }: { sectionId?: SectionId }) {
  // Symmetrical half-path reflected across x = 310 (center of 620px width)
  const leftHalf = [
    "M 310 120",
    "C 285 105, 255 110, 240 135",
    "C 220 120, 185 130, 175 160",
    "C 150 155, 120 180, 115 215",
    "C 100 240, 95 280, 125 305",
    "C 105 325, 90 365, 110 405",
    "C 85 435, 95 480, 130 500",
    "C 115 530, 140 570, 175 575",
    "C 190 600, 230 615, 260 595",
    "C 275 620, 305 625, 310 605",
    // Inner contour carving back up to center
    "C 295 565, 270 550, 275 515",
    "C 245 490, 230 450, 245 410",
    "C 225 380, 240 340, 260 330",
    "C 250 295, 275 260, 290 270",
    "C 295 230, 280 200, 295 175",
    "C 300 150, 308 135, 310 120 Z",
  ].join(" ");

  const rightHalf = [
    "M 310 120",
    "C 335 105, 365 110, 380 135",
    "C 400 120, 435 130, 445 160",
    "C 470 155, 500 180, 505 215",
    "C 520 240, 525 280, 495 305",
    "C 515 325, 530 365, 510 405",
    "C 535 435, 525 480, 490 500",
    "C 505 530, 480 570, 445 575",
    "C 430 600, 390 615, 360 595",
    "C 345 620, 315 625, 310 605",
    // Inner contour
    "C 325 565, 350 550, 345 515",
    "C 375 490, 390 450, 375 410",
    "C 395 380, 380 340, 360 330",
    "C 370 295, 345 260, 330 270",
    "C 325 230, 340 200, 325 175",
    "C 320 150, 312 135, 310 120 Z",
  ].join(" ");

  // Secondary satellites / spots characteristic of standardized inkblots
  const leftSpots = [
    { cx: 165, cy: 235, rx: 16, ry: 24, rot: -25 },
    { cx: 140, cy: 360, rx: 12, ry: 18, rot: 15 },
    { cx: 200, cy: 480, rx: 14, ry: 20, rot: -10 },
    { cx: 260, cy: 195, rx: 8, ry: 12, rot: 30 },
  ];

  const rightSpots = [
    { cx: 455, cy: 235, rx: 16, ry: 24, rot: 25 },
    { cx: 480, cy: 360, rx: 12, ry: 18, rot: -15 },
    { cx: 420, cy: 480, rx: 14, ry: 20, rot: 10 },
    { cx: 360, cy: 195, rx: 8, ry: 12, rot: -30 },
  ];

  return (
    <div
      className="relative flex h-[760px] w-[620px] max-w-full flex-col items-center justify-center border border-line bg-surface/30 p-8"
      data-testid="inkblot-visual"
    >
      {/* Test Card Header */}
      <div className="absolute left-6 top-6 flex w-[calc(100%-48px)] items-center justify-between border-b border-line pb-3">
        <span className="type-caption text-muted">Standard Projective Stimulus</span>
        <span className="type-figure text-accent" style={{ color: `var(--t-s${sectionId})` }}>
          Card IV · Bilateral Symmetry
        </span>
      </div>

      <svg
        viewBox="0 0 620 760"
        className="h-full w-full"
        aria-hidden
      >
        {/* Subtle coordinate alignment grid lines */}
        <line
          x1="310"
          y1="80"
          x2="310"
          y2="680"
          stroke="var(--t-line)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <line
          x1="60"
          y1="380"
          x2="560"
          y2="380"
          stroke="var(--t-line)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Outer subtle halo contour */}
        <path
          d={leftHalf}
          fill={`color-mix(in srgb, var(--t-s${sectionId}) 8%, transparent)`}
          stroke="none"
          transform="translate(-15 -18) translate(310 380) scale(1.05) translate(-310 -380)"
        />
        <path
          d={rightHalf}
          fill={`color-mix(in srgb, var(--t-s${sectionId}) 8%, transparent)`}
          stroke="none"
          transform="translate(-15 -18) translate(310 380) scale(1.05) translate(-310 -380)"
        />

        {/* Primary inkblot bodies */}
        <path
          d={leftHalf}
          fill={`color-mix(in srgb, var(--t-s${sectionId}) 32%, var(--t-surface))`}
          stroke={`var(--t-s${sectionId})`}
          strokeWidth="1.5"
        />
        <path
          d={rightHalf}
          fill={`color-mix(in srgb, var(--t-s${sectionId}) 32%, var(--t-surface))`}
          stroke={`var(--t-s${sectionId})`}
          strokeWidth="1.5"
        />

        {/* Dense central core */}
        <ellipse
          cx="310"
          cy="370"
          rx="32"
          ry="110"
          fill={`var(--t-s${sectionId})`}
          opacity="0.85"
        />
        <ellipse
          cx="310"
          cy="230"
          rx="22"
          ry="45"
          fill={`var(--t-s${sectionId})`}
          opacity="0.75"
        />

        {/* Satellite ink spots */}
        {leftSpots.map((spot, index) => (
          <ellipse
            key={`l-spot-${index}`}
            cx={spot.cx}
            cy={spot.cy}
            rx={spot.rx}
            ry={spot.ry}
            transform={`rotate(${spot.rot} ${spot.cx} ${spot.cy})`}
            fill={`var(--t-s${sectionId})`}
            opacity="0.65"
          />
        ))}
        {rightSpots.map((spot, index) => (
          <ellipse
            key={`r-spot-${index}`}
            cx={spot.cx}
            cy={spot.cy}
            rx={spot.rx}
            ry={spot.ry}
            transform={`rotate(${spot.rot} ${spot.cx} ${spot.cy})`}
            fill={`var(--t-s${sectionId})`}
            opacity="0.65"
          />
        ))}
      </svg>

      {/* Test Card Footer */}
      <div className="absolute bottom-6 left-6 flex w-[calc(100%-48px)] items-center justify-between border-t border-line pt-3">
        <span className="type-caption text-muted">Perception · Determinants · Content</span>
        <span className="type-caption text-text">Standard Ambiguous Stimulus</span>
      </div>
    </div>
  );
}

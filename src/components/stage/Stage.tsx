"use client";

import { useEffect, useLayoutEffect, useState, type MouseEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { stage } from "@design/tokens";

interface StageProps {
  children: ReactNode;
  onAdvance?: () => void;
  onPrevious?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  advanceEnabled?: boolean;
}

export function Stage({
  children,
  onAdvance,
  onPrevious,
  showPrevious = false,
  showNext = true,
  advanceEnabled = true,
}: StageProps) {
  const [scale, setScale] = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useLayoutEffect(() => {
    const measure = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScale(Math.min(width / stage.width, height / stage.height));
    };

    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const onPointerMove = (): void => {
      setCursorHidden(false);
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => setCursorHidden(true), 3000);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    timeout = setTimeout(() => setCursorHidden(true), 3000);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!advanceEnabled) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, [data-no-advance]")) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setRipples((current) => [...current, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((ripple) => ripple.id !== id));
    }, 700);

    onAdvance?.();
  };

  const stop = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
  };

  return (
    <main
      className={`fixed inset-0 overflow-hidden bg-bg ${cursorHidden ? "cursor-none" : ""}`}
      data-testid="stage"
    >
      <div
        className="stage-surface stage-vignette absolute left-1/2 top-1/2 overflow-hidden"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) scale(${scale || 1})`,
          transformOrigin: "center center",
          visibility: scale > 0 ? "visible" : "hidden",
        }}
        onClick={handleClick}
        data-testid="stage-surface"
      >
        {children}

        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="stage-ripple pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              borderColor: "var(--t-line-strong)",
            }}
            aria-hidden
          />
        ))}

        {showPrevious ? (
          <button
            type="button"
            aria-label="Previous build or slide"
            className="nav-arrow absolute left-[28px] top-1/2 z-30 grid h-[58px] w-[58px] -translate-y-1/2 place-items-center rounded-full border border-transparent"
            data-testid="nav-prev"
            data-no-advance
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              stop(event);
              onPrevious?.();
            }}
          >
            <ChevronLeft size={34} strokeWidth={1.4} aria-hidden />
          </button>
        ) : null}

        {showNext ? (
          <button
            type="button"
            aria-label="Next build or slide"
            className="nav-arrow absolute right-[28px] top-1/2 z-30 grid h-[58px] w-[58px] -translate-y-1/2 place-items-center rounded-full border border-transparent"
            data-testid="nav-next"
            data-no-advance
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              stop(event);
              onAdvance?.();
            }}
          >
            <ChevronRight size={34} strokeWidth={1.4} aria-hidden />
          </button>
        ) : null}
      </div>
    </main>
  );
}

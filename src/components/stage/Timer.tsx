"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock } from "@data/meta";

interface TimerProps {
  targetSeconds: number;
  runId: number;
  visible: boolean;
}

const readElapsed = (startedAt: number): number =>
  Math.max(0, Math.floor((performance.now() - startedAt) / 1000));

export function Timer({ targetSeconds, runId, visible }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    setElapsed(0);

    const tick = (): void => setElapsed(readElapsed(startRef.current));
    tick();
    const interval = window.setInterval(tick, 500);

    return () => window.clearInterval(interval);
  }, [runId]);

  const warning = elapsed >= targetSeconds * 0.9 && elapsed <= targetSeconds;
  const over = elapsed > targetSeconds;
  const timeClass = over ? "text-over" : warning ? "text-warn" : "text-text";

  return (
    <div
      className={`flex items-baseline gap-3 transition-opacity duration-150 ease-[var(--t-ease)] ${
        visible ? "opacity-100" : "invisible"
      }`}
      data-testid="timer"
      data-state={over ? "over" : warning ? "warning" : "normal"}
      aria-hidden={!visible}
      role="timer"
    >
      <span className="type-figure text-muted">Time</span>
      <span className={`tabular text-[length:var(--t-type-body)] font-medium leading-none ${timeClass}`}>
        {formatClock(elapsed)}
      </span>
      <span className="type-caption tabular text-muted">/ {formatClock(targetSeconds)}</span>
    </div>
  );
}

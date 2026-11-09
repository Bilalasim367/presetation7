"use client";

import { useEffect, useRef, useState } from "react";
import { animationConfig } from "@/config/animation";

interface Splash {
  id: number;
  x: number;
  y: number;
}

/**
 * Ink-blot cursor: a soft organic blob that trails the pointer with lag, stretches
 * in the direction of travel, morphs shape, and bursts on click. Desktop only.
 */
export function CursorFollower() {
  const enabled = animationConfig.cursor;
  const [touch, setTouch] = useState(false);
  const [label, setLabel] = useState("");
  const [splashes, setSplashes] = useState<Splash[]>([]);

  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const blob = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const isTouch =
      "ontouchstart" in window ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTouch(isTouch);
    if (isTouch) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      const prev = mouse.current;
      mouse.current = { x: event.clientX, y: event.clientY };
      velocity.current = {
        x: mouse.current.x - prev.x,
        y: mouse.current.y - prev.y,
      };

      const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const hint = target?.closest("[data-cursor-label]")?.getAttribute("data-cursor-label");
      setLabel(hint ?? "");
    };

    const onClick = (event: MouseEvent) => {
      const id = Date.now() + Math.random();
      setSplashes((current) => [...current, { id, x: event.clientX, y: event.clientY }]);
      window.setTimeout(() => {
        setSplashes((current) => current.filter((splash) => splash.id !== id));
      }, 700);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onClick);

    let frame = 0;
    const loop = () => {
      const lerp = 0.12;
      blob.current.x += (mouse.current.x - blob.current.x) * lerp;
      blob.current.y += (mouse.current.y - blob.current.y) * lerp;

      if (blobRef.current) {
        const speed = Math.hypot(velocity.current.x, velocity.current.y);
        const stretch = Math.min(1 + speed * 0.018, 1.9);
        const angle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI);
        blobRef.current.style.transform = `translate(${blob.current.x - 26}px, ${blob.current.y - 26}px) rotate(${angle}deg) scale(${stretch}, ${1 / Math.sqrt(stretch)})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`;
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onClick);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled || touch) {
    return null;
  }

  return (
    <>
      <div
        ref={blobRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[52px] w-[52px] rounded-[46%_54%_52%_48%_/_48%_52%_48%_52%] mix-blend-screen blur-[0.5px] transition-[width,height] duration-200"
        style={{
          willChange: "transform",
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--t-intro-white) 55%, transparent), color-mix(in srgb, var(--t-intro-white) 12%, transparent) 55%, transparent 75%)",
        }}
        aria-hidden
      >
        {label ? (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.2em] text-white/80">
            {label}
          </span>
        ) : null}
      </div>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-[8px] w-[8px] rounded-full bg-white"
        style={{ willChange: "transform", boxShadow: "0 0 12px color-mix(in srgb, var(--t-intro-white) 60%, transparent)" }}
        aria-hidden
      />
      {splashes.map((splash) => (
        <span
          key={splash.id}
          className="pointer-events-none fixed left-0 top-0 z-[9998]"
          style={{
            left: splash.x,
            top: splash.y,
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--t-intro-white) 90%, transparent), color-mix(in srgb, var(--t-intro-white) 0%, transparent) 70%)",
            animation: "stage-ripple 0.7s ease-out forwards",
          }}
          aria-hidden
        />
      ))}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

export function InkblotReveal({ active }: { active: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    setShow(true);
    const timer = window.setTimeout(() => setShow(false), 1100);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!show) {
    return null;
  }

  return (
    <div className="inkblot-reveal pointer-events-none fixed inset-0 z-[70]" aria-hidden>
      <span className="inkblot-hole" aria-hidden />
    </div>
  );
}

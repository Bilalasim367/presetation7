"use client";

export function BlankScreen() {
  return (
    <div
      className="absolute inset-0 z-[100] cursor-none bg-bg"
      data-testid="blank-screen"
      data-no-advance
      aria-hidden
      onClick={(event) => event.stopPropagation()}
    />
  );
}

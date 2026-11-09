"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { meta } from "@data/meta";
import { validateDeck } from "@data/validate";
import { easeBezier } from "@design/tokens";
import {
  COMPLETED_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getCurrentSection,
  getCurrentSlide,
  getSectionProgress,
  usePresentation,
} from "@/state/navigation";
import { WelcomeScreen } from "./intro/WelcomeScreen";
import { IntroVideo } from "./intro/IntroVideo";
import { DeckReveal } from "./intro/DeckReveal";
import { Stage } from "./stage/Stage";
import { HUD } from "./stage/HUD";
import { ProgressBar } from "./stage/ProgressBar";
import { NotesOverlay } from "./stage/NotesOverlay";
import { ShortcutsOverlay } from "./stage/ShortcutsOverlay";
import { BlankScreen } from "./stage/BlankScreen";
import { ThankYouScreen } from "./stage/ThankYouScreen";
import { CursorFollower } from "./visuals/CursorFollower";
import { InkblotReveal } from "./intro/InkblotReveal";
import { FloatingSymbols } from "./visuals/FloatingSymbols";
import { SpotlightLens } from "./visuals/SpotlightLens";
import { ErrorScreen } from "./stage/ErrorScreen";
import { SectionVeil } from "./stage/SectionVeil";
import { Hub } from "./slides/Hub";
import { SlideRenderer } from "./slides/SlideRenderer";

const AmbientBackground = dynamic(
  () => import("./visuals/AmbientBackground").then((module) => module.AmbientBackground),
  { ssr: false, loading: () => <AmbientFallback /> },
);

function AmbientFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 ambient-static" />
    </div>
  );
}

function BootScreen() {
  return (
    <div
      className="relative z-10 flex h-full w-full items-center justify-center"
      data-testid="boot-screen"
    >
      <div className="text-center">
        <p className="type-figure text-muted">{meta.deckSubtitle}</p>
        <p className="mt-6 type-hub-title gradient-text">{meta.deckTitle}</p>
      </div>
    </div>
  );
}

type IntroPhase = "welcome" | "video" | "reveal" | "deck";

const INTRO_SKIP_PARAM = "intro";

export function Presentation() {
  const [intro, setIntro] = useState<IntroPhase>("welcome");
  const introActive = intro !== "deck";
  const { state, dispatch, hydrated } = usePresentation(!introActive);
  const reducedMotion = useReducedMotion();
  const validation = useMemo(() => validateDeck(), []);
  const [ambientReady, setAmbientReady] = useState(false);
  const [themePulse, setThemePulse] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [inkActive, setInkActive] = useState(false);
  const [thankYouDismissed, setThankYouDismissed] = useState(false);
  const previousTheme = useRef(state.theme);
  const previousCompletedSize = useRef(state.completed.size);

  const confetti = useMemo(() => {
    const out: Array<{ x: number; y: number; delay: number; size: number; rot: number }> = [];
    let seed = 9173;
    const rand = (): number => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let index = 0; index < 70; index += 1) {
      out.push({
        x: (rand() - 0.5) * 1700,
        y: (rand() - 0.5) * 980,
        delay: rand() * 0.45,
        size: 3 + rand() * 5,
        rot: rand() * 360,
      });
    }
    return out;
  }, []);

  const finishIntro = useCallback(() => {
    try {
      window.localStorage.removeItem(COMPLETED_STORAGE_KEY);
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // Storage can be unavailable; the in-memory reset still applies.
    }

    dispatch({ type: "RESET" });
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    setIntro("deck");
  }, [dispatch]);

  useEffect(() => {
    const skip =
      new URLSearchParams(window.location.search).get(INTRO_SKIP_PARAM) === "skip";
    if (skip) {
      setIntro("deck");
    }
  }, []);

  useEffect(() => {
    if (!introActive) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) {
        return;
      }

      const key = event.key;
      if (key === "Enter" || key === "ArrowRight" || key === "PageDown") {
        event.preventDefault();
        if (intro === "welcome") {
          setIntro("video");
        } else if (intro === "video") {
          setIntro("reveal");
        } else {
          finishIntro();
        }
        return;
      }

      if (key === "Escape" && intro !== "welcome") {
        event.preventDefault();
        finishIntro();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finishIntro, intro, introActive]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const timer = window.setTimeout(() => setAmbientReady(true), 350);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  useEffect(() => {
    if (previousTheme.current === state.theme) {
      return;
    }

    previousTheme.current = state.theme;
    setThemePulse((value) => value + 1);
  }, [state.theme]);

  useEffect(() => {
    if (state.completed.size < 5) {
      setThankYouDismissed(false);
    }
  }, [state.completed]);

  useEffect(() => {
    if (intro === "deck") {
      return;
    }
    setInkActive(true);
    const timer = window.setTimeout(() => setInkActive(false), 1150);
    return () => window.clearTimeout(timer);
  }, [intro]);

  useEffect(() => {
    if (reducedMotion) {
      previousCompletedSize.current = state.completed.size;
      return;
    }

    if (state.completed.size === 5 && previousCompletedSize.current < 5) {
      setCelebrating(true);
      const timer = window.setTimeout(() => setCelebrating(false), 2800);
      previousCompletedSize.current = state.completed.size;
      return () => window.clearTimeout(timer);
    }

    previousCompletedSize.current = state.completed.size;
  }, [reducedMotion, state.completed]);

  if (introActive) {
    return (
      <Stage showPrevious={false} showNext={false} advanceEnabled={false}>
        <AnimatePresence mode="wait" initial={false}>
          {intro === "welcome" ? (
            <motion.div
              key="welcome"
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: easeBezier }}
            >
              <WelcomeScreen onBegin={() => setIntro("video")} />
            </motion.div>
          ) : intro === "video" ? (
            <motion.div
              key="video"
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, ease: easeBezier }}
            >
              <IntroVideo onDone={() => setIntro("reveal")} />
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.9, ease: easeBezier }}
            >
              <DeckReveal onDone={finishIntro} />
            </motion.div>
          )}
        </AnimatePresence>
      </Stage>
    );
  }

  if (!validation.ok) {
    return (
      <Stage showNext={false} advanceEnabled={false}>
        <ErrorScreen errors={validation.errors} warnings={validation.warnings} />
      </Stage>
    );
  }

  const section = getCurrentSection(state);
  const slide = getCurrentSlide(state);
  const progress = getSectionProgress(state);
  const overlayOpen = state.overlay !== null;
  const cinematic = {
    initial: {
      opacity: 0,
      y: reducedMotion ? 0 : 26,
      scale: reducedMotion ? 1 : 0.992,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reducedMotion ? 0 : 0.52, ease: easeBezier },
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : -14,
      scale: reducedMotion ? 1 : 1.002,
      transition: { duration: reducedMotion ? 0 : 0.24, ease: easeBezier },
    },
  };

  return (
    <Stage
      onAdvance={() => dispatch({ type: "NEXT" })}
      onPrevious={() => dispatch({ type: "PREV" })}
      showPrevious={hydrated && state.view === "section"}
      showNext={hydrated && !state.blank}
      advanceEnabled={hydrated && !state.blank && !overlayOpen}
    >
      {hydrated && ambientReady ? (
        <AmbientBackground theme={state.theme} paused={state.blank || overlayOpen} />
      ) : (
        <AmbientFallback />
      )}

      {!hydrated ? (
        <BootScreen />
      ) : (
        <>
          <AnimatePresence mode="wait" initial={false}>
            {state.view === "hub" ? (
              <motion.div
                key="hub"
                className="absolute inset-0 z-10"
                variants={cinematic}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Hub
                  completed={state.completed}
                  onEnter={(sectionId) =>
                    dispatch({ type: "ENTER_SECTION", section: sectionId })
                  }
                />
              </motion.div>
            ) : section && slide ? (
              <motion.div
                key={`${section.id}-${state.slide}`}
                className="absolute inset-0 z-10"
                variants={cinematic}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="h-full w-full px-[112px] pb-[108px] pt-[146px]">
                  <SlideRenderer
                    section={section}
                    slide={slide}
                    build={state.build}
                    theme={state.theme}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {state.view === "section" && section ? (
            <SectionVeil key={`section-veil-${section.id}`} section={section.id} />
          ) : null}

          <HUD
            state={state}
            onShortcuts={() => dispatch({ type: "TOGGLE_OVERLAY", overlay: "shortcuts" })}
          />

          {state.view === "section" && section ? (
            <ProgressBar section={section.id} progress={progress} />
          ) : null}

          {themePulse > 0 && !reducedMotion ? (
            <motion.div
              key={`theme-pulse-${themePulse}`}
              className="pointer-events-none absolute inset-0 z-[46] bg-bg"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: easeBezier }}
              aria-hidden
            />
          ) : null}

          <AnimatePresence initial={false}>
            {state.overlay === "notes" && section && slide ? (
              <NotesOverlay
                key="notes"
                section={section}
                slide={slide}
                onClose={() => dispatch({ type: "CLOSE_OVERLAY" })}
              />
            ) : null}

            {state.overlay === "shortcuts" ? (
              <ShortcutsOverlay
                key="shortcuts"
                onClose={() => dispatch({ type: "CLOSE_OVERLAY" })}
              />
            ) : null}
          </AnimatePresence>
        </>
      )}

      {state.view === "hub" && state.completed.size === 5 && !thankYouDismissed ? (
        <ThankYouScreen onContinue={() => setThankYouDismissed(true)} />
      ) : null}

      {celebrating ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[60] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.6, delay: 0.3, ease: easeBezier }}
          aria-hidden
        >
          {confetti.map((particle, index) => (
            <motion.span
              key={`confetti-${index}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: "var(--t-highlight)",
                transform: `rotate(${particle.rot}deg)`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                opacity: 0,
                scale: 1,
                rotate: particle.rot + 180,
              }}
              transition={{
                duration: 2.4,
                delay: particle.delay,
                ease: easeBezier,
              }}
            />
          ))}
        </motion.div>
      ) : null}

      <CursorFollower />
      {!introActive ? <FloatingSymbols /> : null}
      <InkblotReveal active={inkActive} />
      {!introActive && state.view === "section" && state.section === 4 ? <SpotlightLens active /> : null}

      {state.blank ? <BlankScreen /> : null}
    </Stage>
  );
}

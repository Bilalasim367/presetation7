"use client";

import { useEffect, useReducer, useRef, useState, type Dispatch } from "react";
import { meta } from "@data/meta";
import {
  getBuildCount,
  getSection,
  isSectionAvailable,
  SECTION_PLAN,
  type Section,
  type Slide,
} from "@data/slides";
import type { SectionId, ThemeName } from "@design/tokens";

export type PresentationView = "hub" | "section";
export type OverlayKind = "notes" | "shortcuts";

export interface NavState {
  view: PresentationView;
  section: SectionId;
  /** 1-indexed. */
  slide: number;
  /** Number of currently revealed builds. 0 means heading only (or all at once for build-less slides). */
  build: number;
  completed: ReadonlySet<number>;
  blank: boolean;
  theme: ThemeName;
  timerVisible: boolean;
  overlay: OverlayKind | null;
  /** Increments whenever a section is entered so the timer can start from zero. */
  runId: number;
}

export type NavAction =
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "ENTER_SECTION"; section: SectionId }
  | { type: "GO_HUB" }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_TIMER" }
  | { type: "TOGGLE_BLANK" }
  | { type: "TOGGLE_OVERLAY"; overlay: OverlayKind }
  | { type: "CLOSE_OVERLAY" }
  | { type: "RESET" }
  | {
      type: "RESTORE";
      hashTarget: HashTarget | null;
      completed: ReadonlySet<number>;
      theme: ThemeName;
    };

export interface HashTarget {
  section: SectionId;
  slide: number;
}

export const COMPLETED_STORAGE_KEY = "personality-assessment.completed.v1";
export const THEME_STORAGE_KEY = "personality-assessment.theme.v1";

const EMPTY_COMPLETED: ReadonlySet<number> = new Set<number>();

export const initialNavState: NavState = {
  view: "hub",
  section: 1,
  slide: 1,
  build: 0,
  completed: EMPTY_COMPLETED,
  blank: false,
  theme: "dark",
  timerVisible: true,
  overlay: null,
  runId: 0,
};

const startSection = (state: NavState, section: SectionId): NavState => {
  if (!isSectionAvailable(section)) {
    return state;
  }

  return {
    ...state,
    view: "section",
    section,
    slide: 1,
    build: 0,
    overlay: null,
    blank: false,
    runId: state.runId + 1,
  };
};

const findNextUncompletedSection = (completed: ReadonlySet<number>): SectionId | null => {
  const next = [...SECTION_PLAN]
    .sort((a, b) => a.id - b.id)
    .find((entry) => isSectionAvailable(entry.id) && !completed.has(entry.id));

  return next?.id ?? null;
};

export const navReducer = (state: NavState, action: NavAction): NavState => {
  switch (action.type) {
    case "NEXT": {
      if (state.blank || state.overlay !== null) {
        return state;
      }

      if (state.view === "hub") {
        const nextSection = findNextUncompletedSection(state.completed);
        return nextSection === null ? state : startSection(state, nextSection);
      }

      const section = getSection(state.section);
      if (!section) {
        return { ...state, view: "hub", overlay: null };
      }

      const currentSlide = section.slides[state.slide - 1];
      if (!currentSlide) {
        return { ...state, view: "hub", overlay: null };
      }

      const builds = getBuildCount(currentSlide);
      if (state.build < builds) {
        return { ...state, build: state.build + 1 };
      }

      if (state.slide < section.slides.length) {
        return { ...state, slide: state.slide + 1, build: 0 };
      }

      const completed = new Set(state.completed);
      completed.add(section.id);

      return {
        ...state,
        view: "hub",
        completed,
        overlay: null,
        blank: false,
      };
    }

    case "PREV": {
      if (state.blank || state.overlay !== null || state.view === "hub") {
        return state;
      }

      const section = getSection(state.section);
      if (!section) {
        return { ...state, view: "hub" };
      }

      if (state.build > 0) {
        return { ...state, build: state.build - 1 };
      }

      if (state.slide > 1) {
        const previousSlide = section.slides[state.slide - 2];
        return {
          ...state,
          slide: state.slide - 1,
          build: previousSlide ? getBuildCount(previousSlide) : 0,
        };
      }

      return { ...state, view: "hub", overlay: null };
    }

    case "ENTER_SECTION":
      return startSection(state, action.section);

    case "GO_HUB":
      return { ...state, view: "hub", overlay: null, blank: false };

    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };

    case "TOGGLE_TIMER":
      return { ...state, timerVisible: !state.timerVisible };

    case "TOGGLE_BLANK": {
      const blank = !state.blank;
      return {
        ...state,
        blank,
        overlay: blank ? null : state.overlay,
      };
    }

    case "TOGGLE_OVERLAY": {
      if (state.blank) {
        return state;
      }
      if (action.overlay === "notes" && state.view !== "section") {
        return state;
      }
      return {
        ...state,
        overlay: state.overlay === action.overlay ? null : action.overlay,
      };
    }

    case "CLOSE_OVERLAY":
      return { ...state, overlay: null };

    case "RESET":
      return {
        ...initialNavState,
        theme: "dark",
        runId: state.runId + 1,
      };

    case "RESTORE": {
      const restored: NavState = {
        ...state,
        completed: action.completed,
        theme: action.theme,
        overlay: null,
        blank: false,
      };

      if (action.hashTarget === null) {
        return { ...restored, view: "hub", build: 0, runId: state.runId + 1 };
      }

      const section = getSection(action.hashTarget.section);
      if (
        !section ||
        action.hashTarget.slide < 1 ||
        action.hashTarget.slide > section.slides.length
      ) {
        return { ...restored, view: "hub", build: 0, runId: state.runId + 1 };
      }

      return {
        ...restored,
        view: "section",
        section: action.hashTarget.section,
        slide: action.hashTarget.slide,
        build: 0,
        runId: state.runId + 1,
      };
    }

    default:
      return state;
  }
};

export const parseHash = (hash: string): HashTarget | null => {
  const match = /^#s([1-5])\/([1-9]\d*)$/i.exec(hash.trim());
  if (!match) {
    return null;
  }

  const sectionId = Number(match[1]) as SectionId;
  const slide = Number(match[2]);
  const section = getSection(sectionId);

  if (!section || !Number.isInteger(slide) || slide < 1 || slide > section.slides.length) {
    return null;
  }

  return { section: sectionId, slide };
};

export const hashForState = (state: Pick<NavState, "view" | "section" | "slide">): string =>
  state.view === "section" ? `#s${state.section}/${state.slide}` : "";

const readCompleted = (): ReadonlySet<number> => {
  try {
    const raw = window.localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) {
      return EMPTY_COMPLETED;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY_COMPLETED;
    }
    const completed = new Set<number>();
    parsed.forEach((value) => {
      if (Number.isInteger(value) && value >= 1 && value <= 5) {
        completed.add(value as number);
      }
    });
    return completed;
  } catch {
    return EMPTY_COMPLETED;
  }
};

const readTheme = (): ThemeName => {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

const persist = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing or a locked-down lab machine: position still works, persistence does not.
  }
};

export const getCurrentSection = (state: NavState): Section | undefined =>
  state.view === "section" ? getSection(state.section) : undefined;

export const getCurrentSlide = (state: NavState): Slide | undefined => {
  const section = getCurrentSection(state);
  return section?.slides[state.slide - 1];
};

export const getSectionProgress = (state: NavState): number => {
  const section = getCurrentSection(state);
  if (!section) {
    return 0;
  }

  const slide = section.slides[state.slide - 1];
  if (!slide) {
    return 0;
  }

  const builds = getBuildCount(slide);
  const withinSlide = builds === 0 ? 0 : Math.min(1, state.build / builds);
  return Math.min(1, Math.max(0, (state.slide - 1 + withinSlide) / section.slides.length));
};

const focusWithoutStealingScroll = (): void => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

const toggleFullscreen = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
    return;
  }

  void document.documentElement.requestFullscreen().catch(() => undefined);
};

const isNavigationKey = (key: string): boolean =>
  key === "ArrowRight" ||
  key === "ArrowLeft" ||
  key === " " ||
  key === "PageDown" ||
  key === "PageUp" ||
  key === "Enter";

export interface UsePresentationResult {
  state: NavState;
  dispatch: Dispatch<NavAction>;
  hydrated: boolean;
}

export const usePresentation = (keyboardEnabled = true): UsePresentationResult => {
  const [state, dispatch] = useReducer(navReducer, initialNavState);
  const [hydrated, setHydrated] = useState(false);
  const lastFullscreenExit = useRef(0);

  useEffect(() => {
    const browserState = {
      hashTarget: parseHash(window.location.hash),
      completed: readCompleted(),
      theme: readTheme(),
    };
    dispatch({ type: "RESTORE", ...browserState });
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onFullscreenChange = (): void => {
      if (!document.fullscreenElement) {
        lastFullscreenExit.current = performance.now();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    document.documentElement.dataset.theme = state.theme;
    persist(THEME_STORAGE_KEY, state.theme);
  }, [hydrated, state.theme]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const onHashChange = (): void => {
      dispatch({
        type: "RESTORE",
        hashTarget: parseHash(window.location.hash),
        completed: readCompleted(),
        theme: readTheme(),
      });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    persist(
      COMPLETED_STORAGE_KEY,
      JSON.stringify([...state.completed].sort((a, b) => a - b)),
    );
  }, [hydrated, state.completed]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const desiredHash = hashForState(state);
    const path = `${window.location.pathname}${window.location.search}${desiredHash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== path) {
      window.history.replaceState(null, "", path);
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const section = getCurrentSection(state);
    const slide = getCurrentSlide(state);
    document.title =
      section && slide
        ? `${slide.heading} · Section ${section.id} · ${meta.deckTitle}`
        : `${meta.deckTitle} · ${meta.deckSubtitle}`;
  }, [hydrated, state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!keyboardEnabled || event.repeat) {
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key;
      const normalized = key.toLowerCase();

      if (isNavigationKey(key)) {
        event.preventDefault();
      }

      if (state.blank) {
        if (normalized === "b") {
          dispatch({ type: "TOGGLE_BLANK" });
        }
        return;
      }

      if (key === "Escape") {
        if (state.overlay !== null) {
          dispatch({ type: "CLOSE_OVERLAY" });
          return;
        }
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => undefined);
          return;
        }
        if (performance.now() - lastFullscreenExit.current < 400) {
          return;
        }
        if (state.view === "section") {
          dispatch({ type: "GO_HUB" });
        }
        return;
      }

      if (normalized === "f") {
        toggleFullscreen();
        return;
      }

      if (normalized === "t") {
        dispatch({ type: "TOGGLE_THEME" });
        return;
      }

      if (normalized === "b") {
        dispatch({ type: "TOGGLE_BLANK" });
        return;
      }

      if (normalized === "n") {
        dispatch({ type: "TOGGLE_TIMER" });
        return;
      }

      if (normalized === "p") {
        if (state.view === "section") {
          dispatch({ type: "TOGGLE_OVERLAY", overlay: "notes" });
        }
        return;
      }

      if (key === "?" || (event.shiftKey && key === "/")) {
        dispatch({ type: "TOGGLE_OVERLAY", overlay: "shortcuts" });
        return;
      }

      if (state.overlay !== null) {
        return;
      }

      if (/^[1-5]$/.test(key)) {
        const sectionId = Number(key) as SectionId;
        if (isSectionAvailable(sectionId)) {
          dispatch({ type: "ENTER_SECTION", section: sectionId });
        }
        return;
      }

      if (normalized === "m") {
        if (state.view === "section") {
          dispatch({ type: "GO_HUB" });
        }
        return;
      }

      if (key === "ArrowRight" || key === " " || key === "PageDown" || key === "Enter") {
        dispatch({ type: "NEXT" });
        return;
      }

      if (key === "ArrowLeft" || key === "PageUp") {
        dispatch({ type: "PREV" });
      }
    };

    const onPointerDown = (): void => {
      focusWithoutStealingScroll();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [state, keyboardEnabled]);

  return { state, dispatch, hydrated };
};

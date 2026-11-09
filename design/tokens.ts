/**
 * Design tokens — the single source of truth for the presentation's visual system.
 *
 * Rules:
 *  - No colour literal may live outside this file. `scripts/check-colors.mjs` enforces it.
 *  - CSS custom properties are generated here and mapped into Tailwind in globals.css.
 *  - Components consume tokens through CSS variables, classes, or this module.
 */

export type ThemeName = "dark" | "light";
export type SectionId = 1 | 2 | 3 | 4 | 5;

export interface ThemeColors {
  readonly bg: string;
  readonly surface: string;
  readonly surfaceHi: string;
  readonly primary: string;
  readonly primarySoft: string;
  readonly accent: string;
  readonly highlight: string;
  readonly text: string;
  readonly muted: string;
  readonly line: string;
  readonly lineStrong: string;
  readonly warn: string;
  readonly over: string;
  readonly scrim: string;
}

/**
 * The deck is intentionally monochrome: every value below is a neutral gray,
 * white, or black. Section identity comes from luminance and typography, never hue.
 */
export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    bg: "#050505",
    surface: "#0E0E0E",
    surfaceHi: "#191919",
    primary: "#E8E8E8",
    primarySoft: "#CFCFCF",
    accent: "#B8B8B8",
    highlight: "#FFFFFF",
    text: "#F5F5F5",
    muted: "#9A9A9A",
    line: "#262626",
    lineStrong: "#3D3D3D",
    warn: "#DADADA",
    over: "#F5F5F5",
    scrim: "#000000",
  },
  light: {
    bg: "#F4F4F4",
    surface: "#FFFFFF",
    surfaceHi: "#E7E7E7",
    primary: "#171717",
    primarySoft: "#3A3A3A",
    accent: "#4D4D4D",
    highlight: "#000000",
    text: "#0B0B0B",
    muted: "#5C5C5C",
    line: "#D4D4D4",
    lineStrong: "#ACACAC",
    warn: "#2A2A2A",
    over: "#0B0B0B",
    scrim: "#FBFBFB",
  },
};

/** Strict monochrome palette for the opening sequence, independent of the deck theme. */
export const introPalette = {
  black: "#000000",
  white: "#FFFFFF",
  gray: "#8A8A8A",
  dim: "#161616",
} as const;

export const sectionColors: Record<ThemeName, Record<SectionId, string>> = {
  dark: {
    1: "#FFFFFF",
    2: "#D6D6D6",
    3: "#AFAFAF",
    4: "#ECECEC",
    5: "#C4C4C4",
  },
  light: {
    1: "#0B0B0B",
    2: "#3B3B3B",
    3: "#5F5F5F",
    4: "#1B1B1B",
    5: "#4A4A4A",
  },
};

export const stage = {
  width: 1920,
  height: 1080,
  aspect: 16 / 9,
} as const;

export const fonts = {
  display: '"Playfair Display", Georgia, "Times New Roman", serif',
  body: '"Inter", "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as const;

/** All sizes are logical stage pixels, measured against a 1920 × 1080 stage. */
export const type = {
  kicker: 22,
  caption: 22,
  hud: 22,
  body: 30,
  bodyLarge: 36,
  subheading: 38,
  cardTitle: 32,
  cardBody: 25,
  slideTitle: 74,
  hubTitle: 96,
  closingTitle: 96,
  focusTitle: 46,
  table: 25,
  reference: 26,
  quote: 44,
  figure: 20,
} as const;

export const layout = {
  padX: 112,
  padTop: 104,
  padBottom: 128,
  contentTop: 156,
  contentBottom: 130,
  hubPad: 88,
  cardGap: 24,
} as const;

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
  pill: 999,
} as const;

export const motionTokens = {
  duration: {
    fast: 150,
    base: 300,
    slow: 600,
    cinematic: 760,
    mask: 4000,
  },
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  stagger: 80,
} as const;

/** The same curve as motionTokens.ease, in the array form Motion expects. */
export const easeBezier = [0.22, 1, 0.36, 1] as const;

export const opacity = {
  decorative: 0.08,
  line: 0.5,
  arrow: 0.4,
  ambientMin: 0.15,
  ambientMax: 0.25,
} as const;

const themeVars = (theme: ThemeName): string => {
  const c = themes[theme];

  return [
    `--t-bg:${c.bg}`,
    `--t-surface:${c.surface}`,
    `--t-surface-hi:${c.surfaceHi}`,
    `--t-primary:${c.primary}`,
    `--t-primary-soft:${c.primarySoft}`,
    `--t-accent:${c.accent}`,
    `--t-highlight:${c.highlight}`,
    `--t-text:${c.text}`,
    `--t-muted:${c.muted}`,
    `--t-line:${c.line}`,
    `--t-line-strong:${c.lineStrong}`,
    `--t-warn:${c.warn}`,
    `--t-over:${c.over}`,
    `--t-scrim:${c.scrim}`,
    `--t-s1:${sectionColors[theme][1]}`,
    `--t-s2:${sectionColors[theme][2]}`,
    `--t-s3:${sectionColors[theme][3]}`,
    `--t-s4:${sectionColors[theme][4]}`,
    `--t-s5:${sectionColors[theme][5]}`,
  ].join(";");
};

const sharedVars = [
  `--t-intro-black:${introPalette.black}`,
  `--t-intro-white:${introPalette.white}`,
  `--t-intro-gray:${introPalette.gray}`,
  `--t-intro-dim:${introPalette.dim}`,
  `--t-font-display:${fonts.display}`,
  `--t-font-body:${fonts.body}`,
  `--t-font-mono:${fonts.mono}`,
  `--t-type-kicker:${type.kicker}px`,
  `--t-type-caption:${type.caption}px`,
  `--t-type-hud:${type.hud}px`,
  `--t-type-body:${type.body}px`,
  `--t-type-body-lg:${type.bodyLarge}px`,
  `--t-type-subheading:${type.subheading}px`,
  `--t-type-card-title:${type.cardTitle}px`,
  `--t-type-card-body:${type.cardBody}px`,
  `--t-type-slide-title:${type.slideTitle}px`,
  `--t-type-hub-title:${type.hubTitle}px`,
  `--t-type-closing:${type.closingTitle}px`,
  `--t-type-focus:${type.focusTitle}px`,
  `--t-type-table:${type.table}px`,
  `--t-type-reference:${type.reference}px`,
  `--t-type-quote:${type.quote}px`,
  `--t-type-figure:${type.figure}px`,
  `--t-duration-fast:${motionTokens.duration.fast}ms`,
  `--t-duration-base:${motionTokens.duration.base}ms`,
  `--t-duration-slow:${motionTokens.duration.slow}ms`,
  `--t-ease:${motionTokens.ease}`,
  `--t-stagger:${motionTokens.stagger}ms`,
  `--t-radius-sm:${radii.sm}px`,
  `--t-radius-md:${radii.md}px`,
].join(";");

/**
 * Generates the CSS custom properties for both themes. Injected once in the
 * document head so Tailwind utilities and hand-written CSS share the same values.
 */
export const tokensCss = [
  `:root,html[data-theme="dark"]{${themeVars("dark")};${sharedVars}}`,
  `html[data-theme="light"]{${themeVars("light")}}`,
].join("\n");

export const sectionVar = (id: SectionId): string => `var(--t-s${id})`;

export const gradient = "linear-gradient(135deg, var(--t-primary), var(--t-accent))";

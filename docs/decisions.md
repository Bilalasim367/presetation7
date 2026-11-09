# Decisions

Decisions are numbered for reference. Each entry states the choice and the
reason, so a future change can be evaluated rather than guessed.

## 1. Static export, no server features

The deck must run from a USB stick or a locked-down lab machine with no network.
`next.config.ts` uses `output: "export"`; the app has no route handlers, server
actions, database, cookies, or runtime image optimisation. `npm run preview`
serves the generated `out/` folder.

## 2. Fixed 1920 × 1080 stage, scaled to fit

Every slide is authored against one logical canvas. `Stage` measures the window
and applies a single transform scale, letterboxing as needed. This keeps type,
spacing, and the 16:9 composition identical on every projector and avoids a
second responsive layout system competing with the presentation design. The
stage is hidden until the first measurement, so a clipped 1× frame cannot flash
on load.

## 3. The palette is strictly monochrome

The deck uses neutral blacks, whites, and grays only. Section identity comes
from luminance, typography, rule lines, and composition, never hue. This keeps
the focus on the psychology content, makes the deck feel like one authored
object, and removes any dependence on projector colour reproduction.

`design/tokens.ts` owns every literal colour and generates CSS custom
properties for both themes. Tailwind maps those properties into utilities in
`src/app/globals.css`. `scripts/check-colors.mjs` fails lint on hex, `rgb()`, or
`hsl()` literals anywhere else.

Verified contrast (WCAG 2.x, relative luminance):

| Pair | Dark | Light |
| --- | --- | --- |
| Text on background | 18.69 | 17.90 |
| Muted on background | 7.24 | 6.08 |
| Accent on background | 10.27 | 7.69 |
| Highlight on background | 20.38 | 19.09 |
| Section 3 (lowest section tone) on background | 9.29 | 5.81 |

Small type uses pairs at 4.5:1 or better. Highlight and warning are only used at
30 px or larger, where 3:1 is the requirement; both exceed that comfortably.

## 4. One data model, generic renderers

`data/slides.ts` describes slides declaratively. The renderer supports
`bullets`, `buildList`, `cards`, `table`, `visualText`, `focus`, `closing`,
`references`, `diagram`, `activity`, and `quiz`. New content is normally a data
edit, not a new layout component. The validator rejects malformed combinations
at startup.

`diagram` slides name one of seven scene definitions: `persona`, `purpose`,
`classification`, `projective`, `objective`, `formalInformal`, and `rorschach`.
The first five cover the five section openings; `formalInformal` and `rorschach`
are the two section-specific additions. `purpose` and `classification` remain in
the scene library for future slides.

## 5. Builds are all-or-nothing

A slide enters at build `0` (heading only). `builds: 0` means the slide has no
progressive reveals and is shown complete. Otherwise `builds` must equal the
number of items, table rows, or quiz questions, so every reveal has content and
the final press never reveals an empty row. The validator enforces this.

The quiz treats each question as a build: before the first advance it shows a
“Ready when you are” state, then reveals one question and its marked answer at a
time. Unrevealed questions use faint placeholder tiles so the grid does not
collapse.

## 6. Navigation is a reducer, not component state

`navReducer` is the single authority for view, section, slide, build,
completion, overlays, blank state, theme, timer visibility, and the timer run
id. Keyboard, clicks, HUD buttons, and the hub all dispatch the same actions.
This keeps the keyboard contract testable and prevents divergent behaviour.

## 7. Position uses the hash; completion uses localStorage

The hash (`#s1/2`) is the source of truth for deep links and reloads. Completed
sections and the theme live in `localStorage` under versioned keys. No slide
position is stored in `localStorage`, so reopening a link is predictable. An
invalid hash or an unavailable section falls back to the hub. `replaceState` is
used so arrow-key navigation does not fill the browser history.

## 8. Timer starts on section entry

The timer is visible by default. Entering a section increments `runId`, which
resets elapsed time. It is a presenter aid, not an exam clock: `N` hides it, and
navigating to the hub removes it. Warning begins at 90% of the target and the
overrun state persists until the section is left.

## 9. Overlays are modal for navigation

Notes and shortcuts cover the stage and suspend advance/previous and section
keys. `Esc` closes the overlay first, then exits fullscreen, then returns to the
hub. Blank screen is stricter: it swallows every key except `B`, so a stray
clicker press cannot reveal the deck.

## 10. Five sections, one per student

The structure is fixed at five presenter-led parts, in this order:

1. Bilal — Introduction
2. Fatima — Formal & Informal Assessment
3. Mahnoor — Projective Assessment
4. Student 4 — Objective Assessment
5. Student 5 — Rorschach, HTP & Comparison

Each student owns a coherent topic rather than a shared pool of generic slides,
and each section ends with participation: an activity in sections 1, 2, 3, and
5, and a quiz in section 4. Presenter names live in `data/meta.ts`; the section
order lives in `SECTION_PLAN` and `SECTIONS`.

## 11. The opening is welcome → film → name reveal → hub

The deck opens with a welcome screen, then a local 16:9 film, then a short
five-name reveal that starts from the film's black frame and lands on the group
hub. The reveal is skippable and auto-advances after roughly five seconds. The
film is a normal `<video>` element, so it can be replaced without touching
components: overwrite `public/media/intro.mp4`, optionally refresh the poster,
and rebuild.

`?intro=skip` bypasses all three opening phases for rehearsal and automated
navigation tests. `Esc` during the film or reveal goes straight to the hub. The
opening is deliberately independent of the monochrome deck theme: it is always
black, white, and gray. Completing the opening clears saved completion and theme
so a new presentation starts clean; `?intro=skip` preserves them.

## 12. Motion is cinematic but never blocking

Slide changes use a short fade, rise, and scale through one easing curve, and
section hand-offs add a translucent sheen. HUD labels crossfade, the progress
bar eases, and a brief theme pulse covers the light/dark swap. The aim is to
remove hard cuts without delaying input: navigation dispatches immediately and
animations only visualise the state change.

Reduced-motion users receive static final states: no entrance movement, no
section veil, no theme pulse, no WebGL ambient canvas, and no animated figure.
The diagram fallback carries the same geometry and a visible “Static figure”
label.

## 13. Participation is part of the content model

Activities and the quiz are first-class slide variants, not decorative asides.
The activity slide takes three to five steps; the projective activity embeds the
bilateral inkblot. The quiz takes two to four questions with two options each
and a zero-based answer index. This keeps the interaction editable in
`data/slides.ts` and keeps the presenter notes next to the content they support.

## 14. Section covers use procedural 3D; details stay typographic

Each section opens with a Three.js figure that gives the argument a visual
metaphor: nested persona fields, a structure spectrum, a projective form, a
trait matrix, and a fan of ten Rorschach cards. Dense material — definitions,
tables, limitations, references — stays in type. 3D is used for orientation,
not for reading.

## 15. Ambient background uses R3F with a CSS fallback

The ambient layer is a 1,200-point dust field: DPR capped at 1.5, no
antialiasing, and a seven-second animation budget before `frameloop` returns to
`demand`. It mounts 350 ms after hydration so WebGL startup never delays the
first hub paint. It pauses on hidden tabs, blank screen, and overlays. If WebGL
is unavailable or reduced motion is requested, the static CSS gradient is the
whole background.

## 16. Fonts are bundled

Playfair Display and Inter are imported from `@fontsource` Latin subsets, so
the typography is identical offline and no font request leaves the machine.

## 17. Failure is visible

Two layers protect the presentation: `validateDeck()` refuses to start on
invalid data and renders the exact problems on stage, while a React error
boundary catches unexpected render failures and offers a reload. Neither layer
falls back to a blank white page. A missing or unplayable opening film shows a
readable “Film unavailable” panel and a continue action rather than blocking the
deck.

## 18. Tests verify the exported build, not the dev server

Playwright builds and serves `out/`, matching how the deck is actually
presented. Navigation tests enter through `?intro=skip`; a dedicated intro suite
covers welcome, film, reveal, auto-advance, skip, and reset. Every test fails on
console errors, uncaught exceptions, external requests, or failed requests.
Layout tests check the letterboxed stage and fit at 1920 × 1080, 1366 × 768,
1280 × 720, and 1024 × 768. The Edge project covers a second Chromium browser
when available.

## 19. Interpretation keeps its caution

The content presents projective and objective methods as complementary lenses.
The Rorschach and HTP slides name their limits (training, time, inter-rater
disagreement, limited standardisation) next to their strengths. The closing
returns to the ethical boundary: assessment describes a person and never
reduces them to a single score. This is a content requirement, not decoration.

## 20. Placeholder identity is explicit

`data/meta.ts` uses clearly editable course, university, instructor, and date
values, and `Student 4` and `Student 5` for the two presenters whose names are
not yet confirmed. Inventing real-looking names or institutions would make the
deck harder to correct before delivery. Bilal, Fatima, and Mahnoor are set.

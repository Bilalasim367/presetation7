# Progress

## Current state — complete monochrome deck

Status: **implementation complete; final verification in progress.**

The presentation is a five-part, presenter-led deck built on one fixed
1920 × 1080 stage. It opens with a welcome screen, a replaceable 16:9 film, and
a five-name reveal before the group hub. Every student section is complete,
every slide has presenter notes, and every section includes an activity or quiz
plus at least one procedural visual.

### Delivered

#### Structure

- [x] Five student-led sections, 41 slides total:
  - **Bilal — Introduction** (8 slides)
  - **Fatima — Formal & Informal Assessment** (7 slides)
  - **Iman fatima — Objective Assessment** (8 slides)
  - **Mahnoor — Projective Assessment** (7 slides)
  - **Student 5 — Rorschach, HTP & Comparison** (11 slides)
- [x] An activity in sections 1, 2, 3, and 5; a four-question quiz in section 4.
- [x] Every slide carries presenter notes, opened with `P`.
- [x] References slide is marked `draft` until citations are checked by hand.

#### Opening sequence

- [x] Welcome screen with the deck title and a single begin action.
- [x] Opening film at `public/media/intro.mp4`, with pause, seek, skip, and a
      readable failure state that still continues into the deck.
- [x] Five-name reveal (`DeckReveal`) that starts from the film's black frame,
      names each presenter, shows the deck title, and hands over to the hub.
- [x] `?intro=skip` bypasses welcome, film, and reveal for rehearsals.
- [x] `Esc` during the film or reveal goes straight to the hub.

#### Navigation and state

- [x] Reducer-owned view, section, slide, build, completion, overlays, blank
      screen, theme, timer visibility, and timer run id.
- [x] Full keyboard/clicker contract: arrows, Space, Page Up/Down, Enter,
      `1`–`5`, `M`, `P`, `?`, `B`, `T`, `N`, `F`, `Esc`.
- [x] Hash deep links (`#s1/1` … `#s5/11`) with invalid-hash fallback to the hub.
- [x] Completion and theme persist in `localStorage`; slide position stays in
      the hash only.
- [x] Section completion returns to the hub with a Complete state and the next
      uncompleted section suggested.
- [x] Deck validator fails closed with an on-stage, readable error screen.

#### Visual system

- [x] Strictly monochrome dark and light themes; no hue anywhere in the deck.
- [x] Section identity comes from luminance, typography, and composition.
- [x] One source of colour literals: `design/tokens.ts`; lint enforces it.
- [x] Seven Three.js scene definitions in `SectionDiagram`:
      `persona`, `purpose`, `classification`, `projective`, `objective`,
      `formalInformal`, and `rorschach`. Five are used as section-cover
      figures; `purpose` and `classification` remain available scene vocabulary.
- [x] Bilateral `InkblotVisual` for the projective activity.
- [x] Ambient dust field with a CSS fallback and a seven-second budget.
- [x] Cinematic slide entrances and exits (fade, rise, scale) and a translucent
      section veil at section hand-offs; no hard cuts between slides.
- [x] HUD crossfades, a theme pulse, and a smoothed progress bar.
- [x] Reduced-motion users get static final states: no WebGL canvas, no section
      veil, no entrance movement, no glow animation.

#### Layout and accessibility

- [x] Fixed 1920 × 1080 stage, scaled and letterboxed; no page scrolling.
- [x] Layout verified at 1920 × 1080, 1366 × 768, 1280 × 720, and 1024 × 768.
- [x] Monochrome palette contrast (WCAG relative luminance):

  | Pair | Dark | Light |
  | --- | --- | --- |
  | Text on background | 18.69 | 17.90 |
  | Muted on background | 7.24 | 6.08 |
  | Accent on background | 10.27 | 7.69 |
  | Highlight on background | 20.38 | 19.09 |
  | Section 3 (lowest section tone) on background | 9.29 | 5.81 |

- [x] Presenter notes and shortcuts are modal for navigation; `Esc` closes them
      before leaving the section.
- [x] Blank screen swallows every key except `B`.

### Verification log

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | PASS (0 errors) |
| ESLint + colour rule | `npm run lint` | PASS (55 source files, 0 violations) |
| Production build / export | `npm run build` | PASS (static export in `out/`) |
| Chrome 1920 × 1080 suite | `npx playwright test --project=chrome-1920x1080` | PASS (29 tests) |
| Edge 1920 × 1080 suite | `npx playwright test --project=edge-1920x1080` | PASS (21 tests) |
| Layout suites | `npx playwright test tests/e2e/layout.spec.ts` | PASS (12 tests across 3 viewports) |
| Full Playwright suite | `npm test` | PASS (62 tests, Chrome + Edge) |
| Exported size | `out/` | 45 files · 5.46 MB |

### Manual acceptance checklist

- [ ] Hub shows five cards, all marked Ready, card 1 Suggested, and `0 / 5`.
- [ ] Welcome begins the film; the film ends into the five-name reveal, then
      the hub. `?intro=skip` lands on the hub directly.
- [ ] Every section cover opens at its first slide with the correct presenter
      name in the HUD.
- [ ] Each section provides its activity or quiz, and the quiz reveals one
      question at a time with the correct option marked.
- [ ] Builds reveal one at a time; key words glow once; the next press after the
      final build advances the slide.
- [ ] Completing a section returns to the hub, marks it Complete, and persists
      across a reload.
- [ ] `#s5/8` is the HTP activity; comparison, references, and closing follow at
      9, 10, and 11.
- [ ] `P` notes, `?` shortcuts, and `Esc` work in the documented order.
- [ ] `B` blanks; only `B` restores. No other key leaks a reveal.
- [ ] `T` switches theme without a flash; both themes stay readable.
- [ ] `N` hides and restores the timer.
- [ ] Arrows, clickers (Page Up/Down), clicks, and on-screen arrows agree.
- [ ] 1920 × 1080, 1366 × 768, 1280 × 720, and 1024 × 768 have no scrollbars
      and no clipped content.
- [ ] Fullscreen `F` fills the projector without changing layout.
- [ ] The browser console is clean apart from the R3F `THREE.Clock` deprecation
      warning, and DevTools shows no external requests.

### Known gaps, by design

- `Iman fatima` and `Abdullah umar` are now set as presenters 4 and 5; course,
  university, instructor, and date are still editable placeholders.
- The references slide is `draft` until every citation is checked.
- The bundled `public/media/intro.mp4` is a short sample; replace it with the
  group's film and refresh the poster.
- The references slide is `draft` until every citation is checked.
- The deck targets a 16:9 projector; phones and 4:3 screens letterbox the stage.
- The timer is an elapsed-time aid, not a scheduled countdown.
- There is no audience-facing second screen or remote control.

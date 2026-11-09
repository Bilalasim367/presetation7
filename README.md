# Personality Assessment

An offline, fullscreen group presentation on projective and objective
personality assessment. The deck is a fixed 16:9 stage that scales to any
projector, is controlled by a keyboard or presentation clicker, and ships with
speaker notes, a five-part student structure, and procedural 3D visuals.

**Status:** complete. Five student-led sections — Bilal (Introduction), Fatima
(Formal & Informal), Iman fatima (Objective), Mahnoor (Projective), Abdullah umar
(Rorschach, HTP & Comparison) — with 42 slides, an activity or quiz in every
section, presenter notes, animated diagrams, a monochrome theme, and a fully
offline static export.

## Quick start

```bash
npm install
npm run dev
```

For the exact offline build that will be presented:

```bash
npm run build
npm run preview
```

Open `http://localhost:3000`. `preview` serves the static `out/` folder; no
server-side runtime is involved. Copy `out/` to a USB stick and serve it with
any static file server on the presentation machine.

## Opening sequence and your video

On a normal load the deck plays:

1. **Welcome** — the Assalam-o-Alaikum title screen.
2. **Opening film** — a 16:9 video with pause, seek, and skip controls.
3. **Reveal** — a short animation with the five presenter names that hands over
   to the group hub.
4. **Hub** — every student's section, completion state, and timings.

### Replace the film

1. Put your video at **`public/media/intro.mp4`** (overwrite the current file).
2. Optionally replace **`public/media/intro-poster.jpg`** with a still frame from
   the new film. The poster is only used before playback starts.
3. Use a **16:9** video, ideally **1920 × 1080**, encoded as **MP4 (H.264 +
   AAC)**. Keep the file reasonably small so it starts instantly from local disk.
4. If you use a different filename, update `introVideo` in **`data/meta.ts`** to
   the new public path, for example `"/media/my-film.mp4"`.
5. Rebuild and preview: `npm run build` then `npm run preview`.

The end of the film triggers the reveal automatically. `Enter`, `→`, or a click
also advances or skips it. Press `Esc` during the film or reveal to jump
straight to the hub.

Starting a new presentation through the welcome screen clears saved completion
and theme so the deck begins clean. `?intro=skip` preserves them, which keeps
rehearsal progress intact.

For rehearsals, append **`?intro=skip`** to the URL to bypass the welcome, film,
and reveal entirely: `http://localhost:3000/?intro=skip`.

## Presenting

The whole deck is one fixed 16:9 stage that scales to the projector and
letterboxes when the screen is not 16:9. The cursor hides after three seconds.

| Action | Keys |
| --- | --- |
| Begin the next section (hub) | `Enter`, `→`, `Space`, `PgDn`, or click |
| Next build / slide | `→`, `Space`, `PgDn`, `Enter`, click, or the right arrow |
| Previous build / slide | `←`, `PgUp`, or the left arrow |
| Jump to a section | `1`–`5` |
| Overview | `M` |
| Presenter notes | `P` |
| Shortcuts help | `?` |
| Fullscreen | `F` |
| Light / dark theme | `T` |
| Blank screen (only `B` returns) | `B` |
| Show / hide timer | `N` |
| Close overlay / exit fullscreen / hub | `Esc` |

Presentation clickers send Page Up and Page Down, which are mapped to previous
and next. Completed sections and the theme are remembered in the browser; the
current slide is in the URL (`#s1/2`). Nothing is transmitted.

## Editing the deck

All copy lives in two files:

- **`data/slides.ts`** — every section and slide.
- **`data/meta.ts`** — title, course, institution, date, presenter names,
  per-section target times, and the opening-video path.

Each entry in `SECTIONS` is one student's part. Presenter names live in
`meta.students`; they are currently set to Bilal, Fatima, Mahnoor, Iman fatima,
and Abdullah umar. Section titles and short titles live in `SECTION_PLAN` and
each section.

### Slide shape

```ts
{
  id: "unique-slide-id",
  variant: "bullets",          // see the list below
  heading: "Slide title",
  subheading: "Optional line",
  items: ["First point", "A **key phrase** glows here"],
  builds: 2,                   // or 0 to show everything at once
  notes: "Presenter notes, shown with P",
  status: "final",
}
```

Supported variants: `bullets`, `buildList`, `cards`, `table`, `visualText`,
`focus`, `closing`, `references`, `diagram`, `activity`, `quiz`.

- **`builds`** must be `0` or exactly the number of items, table rows, or quiz
  questions. The in-app validator refuses to start the deck on a mismatch.
- **`activity`** takes 3–5 string steps and renders a two-column participatory
  slide. Use `visual: "inkblot"` to place the projective inkblot beside it.
- **`quiz`** takes 2–4 questions per slide with two options each and a
  zero-based `answer` index. The correct option is marked when the question is
  revealed.
- **`diagram`** needs a `visual`: `persona`, `purpose`, `classification`,
  `projective`, `objective`, `formalInformal`, or `rorschach`. The geometry
  lives in `src/components/visuals/SectionDiagram.tsx`; figure labels live in
  `src/components/slides/DiagramSlide.tsx`.
- **`table`** takes `columns` and `rows`; long cells wrap automatically.
- **`references`** is a numbered list with a draft badge until citations are
  checked.
- Only `**double asterisks**` are markup. They render as emphasis and glow when
  their build appears. Single-asterisk italics are not supported.

Every slide should keep a `notes` field. Mark unverified references with
`status: "draft"`; the references slide is the only draft in the current deck.

### Adding a student or a slide

1. Add or edit the section object inside `SECTIONS` in `data/slides.ts`.
2. If the deck gains a section beyond five, extend `SectionId` and the colour
   tokens in `design/tokens.ts` first; the five-slot navigation is intentional.
3. Add the presenter's name to `meta.students` in the same order.
4. Run `npm run typecheck && npm run lint`, then rebuild.

## Development:

```bash
npm run typecheck   # strict TypeScript
npm run lint        # ESLint + no colour literals outside design/tokens.ts
npm run build       # static export to out/
npm run test        # Playwright suite
npm run verify      # typecheck, lint, and tests
```

The Playwright suite builds and serves `out/` automatically. If a preview is
already running on port 4173, skip the build:

```bash
npm run preview:test
PW_NO_SERVER=1 npm test
```

Use `PW_EDGE=0` to skip the Microsoft Edge project on machines without Edge.
Set `PW_FIREFOX=1` to add the optional Firefox navigation pass.

### Screenshots

With `npm run preview:test` running in another terminal:

```bash
npm run screenshots
```

Images are written to `screenshots/` at 1920 × 1080, 1366 × 768, 1280 × 720,
1024 × 768, and 390 × 844, covering dark, light, reduced-motion, notes, and
shortcuts views.

## Project constraints

- Offline only: no external fonts, images, analytics, or API calls at runtime.
- Static export only: no server actions, route handlers, middleware, or
  database.
- The deck is 16:9 at 1920 × 1080 logical pixels; all sizing is in that space.
- The palette is strictly monochrome. Colour literals live only in
  `design/tokens.ts`.
- Reduced motion is respected: static figures, no particles, no WebGL ambient
  canvas, no entrance movement, and no section veil.
- `AGENTS.md` and `CLAUDE.md` contain the working rules; `docs/` contains the
  rationale, progress, and hard prohibitions.

## Troubleshooting

**The page is blank on a lab machine.** Serve `out/` through a local static
server rather than opening `index.html` directly from the file system; browsers
block module scripts on `file://`.

**The film does not start.** Browsers may block autoplay with sound. Click the
play overlay, or begin the deck with the welcome button so the film starts from
a user gesture. `Esc` skips to the hub.

**The projector is 4:3.** The stage letterboxes to 1024 × 576 inside a
1024 × 768 screen. Text remains at its authored logical size.

**A slide looks empty.** Slides with `builds` start with their heading and reveal
their content as you advance. This also applies when a refresh lands on a slide
with `#sN/M`; press `→` until the slide is complete.

**Text looks too small on a very small screen.** The design target is a lecture
projector, not a phone. Use fullscreen (`F`) and a 16:9 display for the intended
result.

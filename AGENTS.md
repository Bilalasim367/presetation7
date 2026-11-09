# Personality Assessment — presenter deck

A fullscreen, offline, presenter-controlled university presentation. The deck is
built as a fixed 1920 × 1080 stage that scales into any projector, with a
keyboard/clicker navigation model and speaker tooling. All five student-led
sections (Bilal: Introduction, Fatima: Formal & Informal, Iman fatima: Objective,
Mahnoor: Projective, Abdullah umar: Rorschach, HTP & Comparison) are complete with
interactive visuals, an activity or quiz, builds, and speaker notes. A welcome
screen, opening film, and five-name reveal precede the group hub.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server. |
| `npm run build` | Production build and static export into `out/`. |
| `npm run preview` | Serve the exported `out/` folder on port 3000. |
| `npm run preview:test` | Serve `out/` on port 4173 for Playwright. |
| `npm run typecheck` | Strict TypeScript check, no emit. |
| `npm run lint` | ESLint plus the colour-literal rule. |
| `npm run test` | Playwright suite; builds and serves `out/` automatically. |
| `npm run test:smoke` | Navigation suite only. |
| `npm run screenshots` | Capture review screenshots; preview must already be running. |
| `npm run verify` | Typecheck, lint, then the full Playwright suite. |

Playwright environment flags:

- `PW_NO_SERVER=1` — use an already-running preview instead of building.
- `PW_EDGE=0` — skip the Microsoft Edge project (useful when Edge is absent).
- `PW_FIREFOX=1` — add the optional Firefox navigation project.
- `PREVIEW_URL` — override the URL used by `npm run screenshots`.

## Stack

Next.js 15 App Router, React 19, strict TypeScript, Tailwind CSS v4, Motion,
three / React Three Fiber / drei, lucide-react, and locally bundled
`@fontsource` Playfair Display + Inter. There are no server features, no
analytics, and no runtime network requests. `next.config.ts` uses
`output: "export"`.

## Layout of the code

```
src/app/                  Next.js shell, fonts, tokens CSS, global styles
src/components/
  Presentation.tsx        Orchestrator: intro phases, stage, hub/section views, overlays
  intro/                  Welcome screen, opening film, five-name deck reveal
  stage/                  Stage scaling, HUD, timer, progress, overlays, errors
  slides/                 Hub and the slide renderers, including activity and quiz
  visuals/                Three.js diagrams, inkblot, checklist, ambient field
src/state/navigation.ts   Reducer, hash parser, persistence, keyboard contract
data/                     Deck metadata, slide content, deck validator
design/tokens.ts          The only place colour literals may live
scripts/                  Colour rule, screenshot capture
tests/e2e/                Playwright navigation and layout suites
docs/                     Progress, decisions, and hard constraints
```

## Content editing

- All presentation copy lives in `data/slides.ts` and `data/meta.ts`.
- `**double asterisks**` mark key words. They become medium-weight emphasis and
  receive the 600 ms highlight glow when their build is revealed.
- `builds` must be `0` (show everything at once) or exactly the number of items,
  table rows, or quiz questions. The validator rejects anything else.
- Variants: `bullets`, `buildList`, `cards`, `table`, `visualText`, `focus`,
  `closing`, `references`, `diagram`, `activity`, `quiz`.
- The opening film is `public/media/intro.mp4`; its path is `meta.introVideo`.
  The film ends into the reveal, then the hub. `?intro=skip` bypasses all three.
- Every slide needs presenter notes. Mark unverified references as
  `status: "draft"`.
- Presenter names are set: Bilal, Fatima, Mahnoor, Iman fatima, and Abdullah umar.

## Navigation contract

| Key / action | Hub | In a section |
| --- | --- | --- |
| `→`, `Space`, `PgDn`, `Enter`, click | Begin next available section | Next build, then next slide, then hub |
| `←`, `PgUp` | — | Previous build, then previous slide, then hub |
| `1`–`5` | Enter that section if available | Jump to slide 1 of that section if available |
| `M` | — | Return to hub |
| `Esc` | — | Close overlay, exit fullscreen, else hub |
| `F` | Fullscreen | Fullscreen |
| `T` | Light/dark | Light/dark |
| `B` | Blank screen (only `B` restores) | Blank screen |
| `N` | Timer | Timer |
| `P` | — | Presenter notes |
| `?` | Shortcuts | Shortcuts |

The URL hash stores section and slide (`#s1/2`). Completed sections persist in
`localStorage`; the theme persists separately. An invalid or unavailable hash
falls back to the hub. Slide position is not stored in `localStorage`.

## Hard rules

- No colour literal outside `design/tokens.ts`. `npm run lint` enforces this.
- No external requests at runtime: fonts, chunks, icons, visuals, and the opening
  film all ship in `out/`.
- Never trust the client: the deck validator runs in the app and fails closed
  with a readable error screen.
- Reduced-motion users get static final states: no animated diagrams, no WebGL
  ambient canvas, no entrance movement, no section veil.
- Readability beats navigation reliability, which beats performance, which
  beats animation, which beats 3D.

See `docs/decisions.md` for the reasoning and
`docs/constraints/negative-rules.md` for the complete list of prohibitions.

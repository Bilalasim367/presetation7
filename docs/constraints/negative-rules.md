# Negative rules — do not do these

These rules are hard constraints for every stage of this project. If a change
requires breaking one of them, stop and get explicit approval first.

## Content and scope

1. Do not write content that the source material does not support. Keep
   `studentsdara/students.md` as the raw source and `data/slides.ts` as the
   curated deck.
2. Do not invent citations, statistics, test names, dates, institutions, or
   presenter names. Mark unverified references `status: "draft"`.
3. Do not present assessment as a judgment of a person's worth or as a label
   that fixes their identity.
4. Do not add sections, slides, or a sixth part without approval.
5. Do not silently change the approved wording in `data/slides.ts`. Wording
   changes are content changes and belong in review.
6. Do not leave a slide without presenter notes.

## Visual system

7. Do not add a colour literal outside `design/tokens.ts` — no hex, `rgb()`,
   `hsl()`, `oklch()`, named SVGs with baked colours, or inline gradients with
   hard-coded stops.
8. Do not bypass the stage scale with viewport-relative typography or a second
   responsive layout for slides. The 1920 × 1080 logical stage is the design
   canvas.
9. Do not re-enable browser scrolling, pull-to-refresh, overscroll, or text
   selection on presentation chrome.
10. Do not use blur, glassmorphism, neon gradients, floating cards, or stock
    decorative blobs to manufacture visual interest. Typography, composition,
    rule lines, and the token palette carry the design.
11. Do not animate everything. Infinite loops are limited to the ambient
    field, the suggested-card breath, and the small activity/diagram motion;
    every one of them must become static under reduced motion.
12. Do not use an animation to delay navigation or hide loading. The deck must
    respond immediately to input.

## Readability and accessibility

13. Do not shrink body text below 25 logical pixels or captions below 20.
14. Do not use muted text for primary content, and do not place small text on a
    pair below 4.5:1 contrast.
15. Do not remove focus outlines; restyle them with the accent token.
16. Do not trap keyboard users in an overlay: `Esc` must always close it.
17. Do not override `prefers-reduced-motion`. Reduced-motion users must receive
    static figures, no section veil, no entrance movement, and no WebGL ambient
    canvas.
18. Do not rely on colour alone to convey state: completions use text and icons
    as well as colour.

## Navigation and state

19. Do not auto-advance. Slides change only from an explicit presenter action.
20. Do not let a click on a button, link, overlay, or arrow also advance the
    slide. Interactive controls must stop propagation.
21. Do not store the current slide position in `localStorage`. The hash is the
    position; completion and theme are the only persisted preferences.
22. Do not let an invalid hash render a broken view. Fall back to the hub.
23. Do not let a key enter a section that does not exist or is unavailable.
24. Do not let `B` blank screen respond to anything except `B`.
25. Do not let `Esc` skip its order: overlay, then fullscreen, then hub.
26. Do not make the timer a wall clock. It starts on section entry and resets on
    re-entry.
27. Do not push every arrow key into browser history. Use `replaceState`.

## Offline and runtime

28. Do not add server features, route handlers, server actions, middleware,
    databases, cookies, or runtime environment secrets. The app is a static
    export.
29. Do not make any runtime request to an external origin — including fonts,
    analytics, telemetry, CDNs, avatars, remote images, or the opening film.
30. Do not use `next/image` with remote sources or unoptimised remote assets.
    The opening film must remain a local file under `public/media/`.
31. Do not add a dependency without a concrete need and version pin.
32. Do not use `Math.random()` or `Date.now()` during render. Deterministic
    seeded values keep screenshots and hydration stable.
33. Do not read `window`, `document`, or `localStorage` during render; do it in
    effects.
34. Do not exceed 1,200 points in the ambient field or mount more than one
    WebGL canvas per slide.
35. Do not exceed DPR 1.5 for the ambient canvas or leave it animating after its
    seven-second budget.
36. Do not leave a blank white page on failure. Validation errors and render
    errors must be visible and actionable.

## Engineering hygiene

37. Do not leave `console.log`, debug overlays, TODOs, commented-out code, or
    dead variants in the shipped source.
38. Do not disable strict TypeScript, the colour check, or ESLint to make a
    build pass.
39. Do not commit secrets, `node_modules/`, `.next/`, `out/`, test artefacts, or
    machine-specific paths.
40. Do not declare a stage complete without running typecheck, lint, the
    production build, and the Playwright suite, and without inspecting the
    rendered deck in a real browser.
41. Do not claim browser coverage that was not actually run. Record what ran in
    `docs/progress.md`.

import { expect, test } from "@playwright/test";
import {
  enterSection,
  enterSectionOne,
  expectClean,
  gotoHub,
  gotoSlide,
  installGuards,
  pressNext,
  readCompleted,
  readTheme,
  type PageGuards,
} from "./helpers";

let guards: PageGuards;

test.beforeEach(async ({ page }) => {
  guards = installGuards(page);
  await gotoHub(page);
});

test.afterEach(() => {
  expectClean(guards);
});

test("hub presents five available sections and the presenter names", async ({ page }) => {
  await expect(page.getByTestId("hub-title")).toHaveText("Personality Assessment");
  await expect(page.getByTestId("hub-title")).toBeVisible();

  for (let id = 1; id <= 5; id += 1) {
    const card = page.getByTestId(`hub-card-${id}`);
    await expect(card).toBeVisible();
    await expect(card).toBeEnabled();
    await expect(card).toHaveAttribute("data-available", "true");
  }

  await expect(page.getByTestId("hub-card-1")).toContainText("Suggested");
  for (let id = 2; id <= 5; id += 1) {
    await expect(page.getByTestId(`hub-card-${id}`)).toContainText("Ready");
  }

  for (const name of ["Bilal", "Fatima", "Mahnoor", "Iman fatima", "Abdullah umar"]) {
    await expect(page.getByTestId("hub").getByText(name, { exact: true })).toBeVisible();
  }

  await expect(page.getByTestId("hub-hint")).toContainText("Press Enter to begin");
  await expect(page.getByTestId("hub").getByText("0 / 5", { exact: true })).toBeVisible();
});

test("Enter and a card click both begin a section", async ({ page }) => {
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("hub")).toBeHidden();
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");
  await expect(page.getByTestId("slide-heading")).toContainText("The Persona Behind the Pattern");
  await expect(page.getByTestId("hud-section")).toContainText("Introduction · Bilal");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 2/8");
  await expect(page.getByTestId("slide-heading")).toContainText("Why Do We Need Personality?");

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("hub")).toBeVisible();

  await page.getByTestId("hub-card-4").click();
  await expect(page.getByTestId("hud-section")).toContainText("Objective · Iman fatima");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 4 · 1/8");
  await expect(page.getByTestId("slide-heading")).toContainText("The Objective Lens");

  await page.keyboard.press("m");
  await expect(page.getByTestId("hub")).toBeVisible();

  await page.getByTestId("hub-card-2").click();
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 1/7");
  await expect(page.getByTestId("slide-heading")).toContainText("Two Ways of Seeing a Person");
});

test("builds reveal in order, glow, and finish with the section", async ({ page }) => {
  await gotoSlide(page, 1, 2);
  await expect(page.getByTestId("slide-heading")).toContainText("Why Do We Need Personality?");

  const first = page.locator('[data-build-index="0"]');
  const second = page.locator('[data-build-index="1"]');
  const third = page.locator('[data-build-index="2"]');
  const fourth = page.locator('[data-build-index="3"]');

  await expect(first).toHaveAttribute("data-revealed", "false");
  await expect(second).toHaveAttribute("data-revealed", "false");
  await expect(third).toHaveAttribute("data-revealed", "false");
  await expect(fourth).toHaveAttribute("data-revealed", "false");

  await pressNext(page, 1);
  await expect(first).toHaveAttribute("data-revealed", "true");
  await expect(second).toHaveAttribute("data-revealed", "false");
  await expect(first).toContainText("Two people face the same exam");

  await pressNext(page, 1);
  await expect(second).toHaveAttribute("data-revealed", "true");
  await expect(second).toContainText("One seeks a crowded room");
  await expect(third).toHaveAttribute("data-revealed", "false");

  await pressNext(page, 1);
  await expect(third).toHaveAttribute("data-revealed", "true");
  await expect(third).toContainText("recognisable patterns");
  await expect(third.locator(".key-glow")).toHaveCount(1);
  await expect(fourth).toHaveAttribute("data-revealed", "false");

  await pressNext(page, 1);
  await expect(fourth).toHaveAttribute("data-revealed", "true");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 2/8");

  await pressNext(page, 1);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 3/8");
  await expect(page.getByTestId("slide-heading")).toContainText("Origin: The Persona");
});

test("previous walks builds and slides, then returns to the hub", async ({ page }) => {
  await gotoSlide(page, 2, 2);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 2/7");
  await expect(page.getByTestId("slide-heading")).toContainText("Formal Assessment");

  await pressNext(page, 2);
  await expect(page.locator('[data-build-index="1"]')).toHaveAttribute("data-revealed", "true");

  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-build-index="1"]')).toHaveAttribute("data-revealed", "false");
  await expect(page.locator('[data-build-index="0"]')).toHaveAttribute("data-revealed", "true");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 2/7");

  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-build-index="0"]')).toHaveAttribute("data-revealed", "false");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 2/7");

  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 1/7");
  await expect(page.getByTestId("slide-heading")).toContainText("Two Ways of Seeing a Person");

  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("hub")).toBeVisible();
});

test("on-screen arrows navigate without advancing twice", async ({ page }) => {
  await enterSectionOne(page);

  await page.getByTestId("nav-next").click();
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 2/8");

  await page.getByTestId("nav-prev").click();
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");

  await page.getByTestId("nav-prev").click();
  await expect(page.getByTestId("hub")).toBeVisible();
});

test("a deep link restores the exact slide and updates the hash", async ({ page }) => {
  await gotoSlide(page, 1, 3);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 3/8");
  await expect(page.getByTestId("slide-heading")).toContainText("Origin: The Persona");
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#s1/3");

  // Four builds, then the next slide.
  await pressNext(page, 5);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 4/8");
  await expect(page.getByTestId("slide-heading")).toContainText("Defining Personality");
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#s1/4");
});

test("invalid and unavailable hashes fall back to the hub", async ({ page }) => {
  const invalid = ["#s9/1", "#s1/99", "#s5/13", "#s6/1", "#s1", "#garbage"];

  for (const hash of invalid) {
    await page.goto(`/?intro=skip${hash}`);
    await expect(page.getByTestId("hub")).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  }
});

test("presenter notes open only in a section and close before the hub on Escape", async ({
  page,
}) => {
  await page.keyboard.press("p");
  await expect(page.getByTestId("notes-overlay")).toHaveCount(0);

  await enterSectionOne(page);
  await page.keyboard.press("p");
  const notes = page.getByTestId("notes-overlay");
  await expect(notes).toBeVisible();
  await expect(notes).toHaveAttribute("aria-modal", "true");
  await expect(notes).toContainText("Presenter notes");
  await expect(notes).toContainText("Open the presentation with the persona figure");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");

  await page.keyboard.press("Escape");
  await expect(notes).toBeHidden();
  await expect(page.getByTestId("hub")).toBeHidden();

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("hub")).toBeVisible();
});

test("shortcuts overlay opens from the keyboard and from the HUD", async ({ page }) => {
  await page.keyboard.press("Shift+Slash");
  const shortcuts = page.getByTestId("shortcuts-overlay");
  await expect(shortcuts).toBeVisible();
  await expect(shortcuts).toContainText("Keyboard & clicker");
  await expect(shortcuts).toContainText("Page Up and Page Down");

  await page.keyboard.press("Escape");
  await expect(shortcuts).toBeHidden();

  await enterSectionOne(page);
  await page.getByTestId("shortcuts-button").click();
  await expect(shortcuts).toBeVisible();
  await page.getByRole("button", { name: "Close shortcuts" }).click();
  await expect(shortcuts).toBeHidden();
});

test("blank screen swallows every key except B", async ({ page }) => {
  await enterSectionOne(page);
  const blank = page.getByTestId("blank-screen");

  await page.keyboard.press("b");
  await expect(blank).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("t");
  await page.keyboard.press("2");
  await page.keyboard.press("p");
  await page.keyboard.press("Shift+Slash");
  await expect(blank).toBeVisible();

  await page.keyboard.press("b");
  await expect(blank).toBeHidden();
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("notes-overlay")).toHaveCount(0);
  await expect(page.getByTestId("shortcuts-overlay")).toHaveCount(0);
});

test("theme toggles, persists, and survives a reload", async ({ page }) => {
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.keyboard.press("t");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect.poll(() => readTheme(page)).toBe("light");

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");

  await page.keyboard.press("t");
  await expect(html).toHaveAttribute("data-theme", "dark");
});

test("the timer is visible by default and N hides it", async ({ page }) => {
  await enterSectionOne(page);
  const timer = page.getByTestId("timer");

  await expect(timer).toBeVisible();
  await expect(timer).toHaveAttribute("aria-hidden", "false");
  await expect(timer).toContainText("Time");
  await expect(timer).toContainText(/\d{2}:\d{2}/);

  await page.keyboard.press("n");
  await expect(timer).toHaveAttribute("aria-hidden", "true");
  await expect(timer).toBeHidden();

  await page.keyboard.press("n");
  await expect(timer).toHaveAttribute("aria-hidden", "false");
  await expect(timer).toBeVisible();
});

test("keys 1–5 jump directly to each section cover", async ({ page }) => {
  const covers = [
    { key: "1", section: 1, total: 8, heading: "The Persona Behind the Pattern", hud: "Bilal" },
    { key: "2", section: 2, total: 7, heading: "Two Ways of Seeing a Person", hud: "Fatima" },
    { key: "3", section: 3, total: 9, heading: "The Objective Lens", hud: "Iman fatima" },
    { key: "4", section: 4, total: 6, heading: "The Projective Lens", hud: "Mahnoor" },
    { key: "5", section: 5, total: 13, heading: "Ten Cards, Three Drawings", hud: "Abdullah umar" },
  ];

  for (const cover of covers) {
    await page.keyboard.press(cover.key);
    await expect(page.getByTestId("slide-indicator")).toHaveText(
      `Section ${cover.section} · 1/${cover.total}`,
    );
    await expect(page.getByTestId("slide-heading")).toContainText(cover.heading);
    await expect(page.getByTestId("hud-section")).toContainText(cover.hud);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("hub")).toBeVisible();
  }
});

test("every section provides a live activity or quiz", async ({ page }) => {
  const activities = [
    { section: 1, slide: 8, total: 8, heading: "Same Situation, Different Response" },
    { section: 2, slide: 4, total: 7, heading: "Observe Us" },
    { section: 4, slide: 6, total: 6, heading: "What Do You See?" },
    { section: 4, slide: 5, total: 6, heading: "Complete the Sentence" },
    { section: 5, slide: 10, total: 13, heading: "Read the Drawing" },
  ];

  for (const activity of activities) {
    await gotoSlide(page, activity.section, activity.slide);
    await expect(page.getByTestId("slide-indicator")).toHaveText(
      `Section ${activity.section} · ${activity.slide}/${activity.total}`,
    );
    await expect(page.getByTestId("slide-heading")).toContainText(activity.heading);
    await expect(page.getByTestId("activity-slide")).toBeVisible();
    await expect(page.getByTestId("activity-slide").locator("li")).toHaveCount(3);
  }

  await gotoSlide(page, 4, 6);
  await expect(page.getByTestId("inkblot-visual")).toBeVisible();

  // Section 3 now carries the objective quiz.
  await gotoSlide(page, 3, 8);
  await expect(page.getByTestId("slide-heading")).toContainText("Small Quiz");
});

test("the quiz starts closed, reveals one question at a time, and marks the answer", async ({
  page,
}) => {
  await gotoSlide(page, 3, 8);
  await expect(page.getByTestId("slide-heading")).toContainText("Small Quiz");
  await expect(page.getByText("Ready when you are.")).toBeVisible();
  await expect(page.locator("[data-quiz-index]")).toHaveCount(0);

  await pressNext(page, 1);
  await expect(page.locator('[data-quiz-index="0"]')).toHaveAttribute("data-revealed", "true");
  await expect(page.locator('[data-quiz-index="1"]')).toHaveAttribute("data-revealed", "false");
  await expect(page.locator('[data-quiz-index="0"]').locator('[data-correct="true"]')).toContainText(
    "Already fixed",
  );
  await expect(page.getByText("Locked")).toHaveCount(3);

  await pressNext(page, 2);
  await expect(page.locator('[data-quiz-index="2"]')).toHaveAttribute("data-revealed", "true");
  await expect(page.locator('[data-quiz-index="3"]')).toHaveAttribute("data-revealed", "false");

  await pressNext(page, 1);
  await expect(page.locator("[data-revealed='true']")).toHaveCount(4);
  await expect(page.locator('[data-quiz-index="3"]').locator('[data-correct="true"]')).toContainText(
    "It gives the same result every time",
  );

  await pressNext(page, 1);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 3 · 9/9");
  await expect(page.getByTestId("slide-heading")).toContainText("A Fair and Structured Method");
});

test("diagram slides use the new formal/informal and Rorschach scenes", async ({ page }) => {
  const scenes = [
    { section: 1, slide: 1, scene: "persona", figure: "Fig. 01 · Persona field" },
    { section: 2, slide: 1, scene: "formalInformal", figure: "Fig. 06 · Structure spectrum" },
    { section: 5, slide: 1, scene: "rorschach", figure: "Fig. 07 · Card fan" },
  ];

  for (const entry of scenes) {
    await gotoSlide(page, entry.section, entry.slide);
    const diagram = page.getByTestId("section-diagram");
    await expect(diagram).toBeVisible();
    await expect(diagram).toHaveAttribute("data-scene", entry.scene);
    await expect(page.getByText(entry.figure)).toBeVisible();
  }
});

test("section five keeps its activity, comparison, references, and closing order", async ({
  page,
}) => {
  await gotoSlide(page, 5, 8);
  await expect(page.getByTestId("slide-heading")).toContainText("Projective Assessment: Advantages");

  await gotoSlide(page, 5, 9);
  await expect(page.getByTestId("slide-heading")).toContainText("Projective Assessment: Limitations");

  await gotoSlide(page, 5, 10);
  await expect(page.getByTestId("slide-heading")).toContainText("Read the Drawing");
  await expect(page.getByTestId("activity-slide")).toBeVisible();

  await gotoSlide(page, 5, 11);
  await expect(page.getByTestId("slide-heading")).toContainText("Projective vs Objective Assessment");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 5 · 11/13");

  await gotoSlide(page, 5, 12);
  await expect(page.getByTestId("slide-heading")).toContainText("Conclusion");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 5 · 12/13");

  await gotoSlide(page, 5, 13);
  await expect(page.getByTestId("slide-heading")).toContainText("Thank You");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 5 · 13/13");
});

test("section one completes through builds and slides, then persists", async ({ page }) => {
  await enterSectionOne(page);

  // 25 builds + 7 slide advances + the final advance into the hub.
  await pressNext(page, 33);

  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("hub-card-1")).toHaveAttribute("data-completed", "true");
  await expect(page.getByTestId("hub-card-1")).toContainText("Complete");
  await expect(page.getByTestId("hub-card-2")).toContainText("Suggested");
  await expect(page.getByTestId("hub").getByText("1 / 5", { exact: true })).toBeVisible();
  await expect.poll(() => readCompleted(page)).toBe("[1]");
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");

  await page.reload();
  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("hub-card-1")).toHaveAttribute("data-completed", "true");
});

test("section two completes in exactly 24 advances", async ({ page }) => {
  await enterSection(page, 2);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 1/7");

  // 17 builds + 6 slide advances + the final advance into the hub.
  await pressNext(page, 24);

  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("hub-card-2")).toHaveAttribute("data-completed", "true");
  await expect(page.getByTestId("hub-card-2")).toContainText("Complete");
  await expect.poll(() => readCompleted(page)).toBe("[2]");
});

test("progress reflects the slide and build position", async ({ page }) => {
  await enterSectionOne(page);
  const bar = page.getByTestId("progress-bar");

  await expect(page.getByTestId("progress-track")).toBeVisible();
  await expect(bar).toHaveAttribute("data-progress", "0.000");

  // Slide 1 has no builds; advance to slide 2.
  await pressNext(page, 1);
  await expect(bar).toHaveAttribute("data-progress", "0.125");

  // One of four builds on slide 2.
  await pressNext(page, 1);
  await expect(bar).toHaveAttribute("data-progress", "0.156");

  // All four builds on slide 2.
  await pressNext(page, 3);
  await expect(bar).toHaveAttribute("data-progress", "0.250");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("figures resolve statically, no WebGL canvas mounts, and no veil runs", async ({
    page,
  }) => {
    await enterSectionOne(page);

    await expect(page.getByTestId("section-diagram")).toHaveAttribute("data-animated", "false");
    await expect(
      page.getByTestId("section-diagram").getByText("Static figure · reduced motion"),
    ).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);

    await page.keyboard.press("2");
    await expect(page.getByTestId("slide-indicator")).toHaveText("Section 2 · 1/7");
    await expect(page.getByTestId("section-diagram")).toHaveAttribute("data-animated", "false");
    await expect(page.getByTestId("section-veil")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

import { expect, test, type Locator } from "@playwright/test";
import { expectClean, gotoHub, gotoSlide, installGuards, pressNext, type PageGuards } from "./helpers";

let guards: PageGuards;

test.beforeEach(({ page }) => {
  guards = installGuards(page);
});

test.afterEach(() => {
  expectClean(guards);
});

const expectInside = async (
  locator: Locator,
  box: { x: number; y: number; width: number; height: number },
): Promise<void> => {
  await expect(locator).toBeVisible();
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    return;
  }
  expect(bounds.x).toBeGreaterThanOrEqual(box.x - 1);
  expect(bounds.y).toBeGreaterThanOrEqual(box.y - 1);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(box.x + box.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(box.y + box.height + 1);
};

test("the 16:9 stage is letterboxed with no scrolling", async ({ page }) => {
  await gotoHub(page);

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) {
    return;
  }

  const scale = Math.min(viewport.width / 1920, viewport.height / 1080);
  const surface = page.getByTestId("stage-surface");
  const box = await surface.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  expect(box.width).toBeCloseTo(1920 * scale, 0);
  expect(box.height).toBeCloseTo(1080 * scale, 0);
  expect(box.x).toBeCloseTo((viewport.width - box.width) / 2, 0);
  expect(box.y).toBeCloseTo((viewport.height - box.height) / 2, 0);
  expect(box.width / box.height).toBeCloseTo(16 / 9, 2);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.innerHeight + 1);

  for (let id = 1; id <= 5; id += 1) {
    const card = page.getByTestId(`hub-card-${id}`);
    await expectInside(card, box);
  }
});

test("the section one cover fits inside the stage", async ({ page }) => {
  await gotoHub(page);
  await page.keyboard.press("1");
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) {
    return;
  }

  const box = await page.getByTestId("stage-surface").boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  const heading = page.getByTestId("slide-heading");
  await expectInside(heading, box);
  await expectInside(page.getByTestId("section-diagram"), box);
  await expectInside(page.getByTestId("progress-track"), box);

  await expect(page.getByTestId("hud-section")).toContainText("Introduction · Bilal");
  await expect(page.getByTestId("timer")).toBeVisible();

  await page.keyboard.press("t");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(heading).toBeVisible();
  await expect(page.getByTestId("section-diagram")).toBeVisible();
});

test("the section five activity fits inside the stage", async ({ page }) => {
  await gotoSlide(page, 5, 9);
  await expect(page.getByTestId("slide-heading")).toContainText("Read the Drawing");

  const box = await page.getByTestId("stage-surface").boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  const activity = page.getByTestId("activity-slide");
  await expectInside(activity, box);
  await expect(activity.locator("li")).toHaveCount(3);
  await expectInside(page.getByTestId("slide-heading"), box);
});

test("the final comparison table fits inside the stage", async ({ page }) => {
  await gotoSlide(page, 5, 11);
  await expect(page.getByTestId("slide-heading")).toContainText("Projective vs Objective Assessment");

  // Reveal all four comparison rows.
  await pressNext(page, 4);
  await expect(page.locator("[data-revealed='true']")).toHaveCount(4);

  const box = await page.getByTestId("stage-surface").boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  await expectInside(page.getByTestId("comparison-table"), box);
  await expectInside(page.getByTestId("slide-heading"), box);
});

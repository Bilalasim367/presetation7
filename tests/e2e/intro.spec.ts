import { expect, test } from "@playwright/test";
import { expectClean, installGuards, readCompleted, type PageGuards } from "./helpers";

let guards: PageGuards;

test.beforeEach(({ page }) => {
  guards = installGuards(page);
});

test.afterEach(() => {
  expectClean(guards);
});

test("welcome, film, name reveal, and hub form one continuous opening", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("personality-assessment.completed.v1", "[1,2]");
    } catch {
      // Storage may be unavailable; the in-memory reset still applies.
    }
  });

  await page.goto("/");
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
  await expect(page.getByRole("button", { name: /Begin the presentation/i })).toBeVisible();

  await page.getByRole("button", { name: /Begin the presentation/i }).click();
  await expect(page.getByTestId("intro-video")).toBeVisible();

  await page.keyboard.press("Enter");
  const reveal = page.getByTestId("deck-reveal");
  await expect(reveal).toBeVisible({ timeout: 10_000 });

  for (const name of ["Bilal", "Fatima", "Mahnoor", "Iman fatima", "Abdullah umar"]) {
    await expect(reveal.getByText(name, { exact: true })).toBeVisible();
  }
  await expect(reveal).toContainText("Five voices");

  await page.getByRole("button", { name: /Enter the deck/i }).click();
  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("hub-title")).toHaveText("Personality Assessment");
  await expect(page.getByTestId("welcome-screen")).toHaveCount(0);
  await expect(page.getByTestId("deck-reveal")).toHaveCount(0);
  await expect(page.getByTestId("hub").getByText("0 / 5", { exact: true })).toBeVisible();
  await expect.poll(() => readCompleted(page)).toBe("[]");
});

test("Escape during the film goes straight to the hub", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Begin the presentation/i }).click();
  await expect(page.getByTestId("intro-video")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("intro-video")).toHaveCount(0);
});

test("the name reveal hands over to the hub on its own", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("intro-video")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("deck-reveal")).toBeVisible({ timeout: 10_000 });

  await expect(page.getByTestId("hub")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("deck-reveal")).toHaveCount(0);
});

test("?intro=skip bypasses the whole opening sequence", async ({ page }) => {
  await page.goto("/?intro=skip");
  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("welcome-screen")).toHaveCount(0);
  await expect(page.getByTestId("intro-video")).toHaveCount(0);
  await expect(page.getByTestId("deck-reveal")).toHaveCount(0);
});

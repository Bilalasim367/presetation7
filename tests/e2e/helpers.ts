import { expect, type Page } from "@playwright/test";

export interface PageGuards {
  consoleErrors: string[];
  pageErrors: string[];
  externalRequests: string[];
  failedRequests: string[];
}

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

/**
 * Records everything a clean, offline presentation must not produce:
 * console errors, uncaught exceptions, external requests, and failed loads.
 */
export function installGuards(page: Page): PageGuards {
  const guards: PageGuards = {
    consoleErrors: [],
    pageErrors: [],
    externalRequests: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    if (message.type() === "error") {
      guards.consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    guards.pageErrors.push(error.stack ?? error.message);
  });

  page.on("request", (request) => {
    const url = request.url();
    if (/^(data|blob|about):/i.test(url)) {
      return;
    }
    try {
      if (LOCAL_HOSTS.has(new URL(url).hostname)) {
        return;
      }
    } catch {
      // A malformed URL is still a request worth failing on.
    }
    guards.externalRequests.push(url);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown failure";
    // Reloading cancels in-flight lazy chunks; Chromium reports that as
    // net::ERR_ABORTED. It is navigation cancellation, not a broken asset.
    if (failure === "net::ERR_ABORTED") {
      return;
    }
    guards.failedRequests.push(`${request.url()} :: ${failure}`);
  });

  return guards;
}

export function expectClean(guards: PageGuards | undefined): void {
  if (!guards) {
    return;
  }
  expect(guards.consoleErrors, "browser console errors").toEqual([]);
  expect(guards.pageErrors, "uncaught page errors").toEqual([]);
  expect(guards.externalRequests, "external network requests").toEqual([]);
  expect(guards.failedRequests, "failed requests").toEqual([]);
}

/** Bypass the welcome screen, opening film, and name reveal. */
export async function gotoHub(page: Page): Promise<void> {
  await page.goto("/?intro=skip");
  await expect(page.getByTestId("hub")).toBeVisible();
  await expect(page.getByTestId("hub-title")).toBeVisible();
  // Let the post-hydration keyboard listener attach before the first key.
  await page.waitForTimeout(100);
}

/** Open a deep link: `/?intro=skip#sN/M`. */
export async function gotoSlide(page: Page, section: number, slide: number): Promise<void> {
  await page.goto(`/?intro=skip#s${section}/${slide}`);
  await expect(page.getByTestId("slide-indicator")).toHaveText(
    new RegExp(`^Section ${section} · ${slide}/\\d+$`),
  );
  await expect(page.getByTestId("hub")).toHaveCount(0);
}

export async function enterSection(page: Page, section: 1 | 2 | 3 | 4 | 5): Promise<void> {
  await gotoHub(page);
  await page.keyboard.press(String(section));
  await expect(page.getByTestId("hub")).toBeHidden();
  await expect(page.getByTestId("slide-indicator")).toContainText(`Section ${section} · 1/`);
}

export async function enterSectionOne(page: Page): Promise<void> {
  await enterSection(page, 1);
  await expect(page.getByTestId("slide-indicator")).toHaveText("Section 1 · 1/8");
  await expect(page.getByTestId("slide-heading")).toContainText("The Persona Behind the Pattern");
}

/**
 * Walks forward with a short pause between presses. The keyboard listener is
 * re-registered after every state change, so a pause keeps rapid batched
 * presses from outrunning React's effect flush.
 */
export async function pressNext(page: Page, times: number): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(45);
  }
}

export const readCompleted = async (page: Page): Promise<string | null> =>
  page.evaluate(() => window.localStorage.getItem("personality-assessment.completed.v1"));

export const readTheme = async (page: Page): Promise<string | null> =>
  page.evaluate(() => window.localStorage.getItem("personality-assessment.theme.v1"));

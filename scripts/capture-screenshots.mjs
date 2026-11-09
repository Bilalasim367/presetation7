/**
 * Captures the presentation at projector and 4:3 sizes for the Stage 1 report.
 *
 * Usage:
 *   npm run build
 *   npm run preview:test        (in another terminal)
 *   npm run screenshots
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const OUT = "screenshots";

await mkdir(OUT, { recursive: true });

const consoleErrors = [];
const externalRequests = [];

const attachDiagnostics = (page) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("request", (request) => {
    const url = request.url();
    if (/^(data|blob|about):/i.test(url)) {
      return;
    }
    try {
      const host = new URL(url).hostname;
      if (host === "127.0.0.1" || host === "localhost" || host === "::1") {
        return;
      }
    } catch {
      // fall through and record it
    }
    externalRequests.push(url);
  });
};

const shot = async (page, name, settle = 300) => {
  await page.mouse.move(2, 2);
  await page.waitForTimeout(settle);
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path });
  console.log(`  ${path}`);
};

const gotoHub = async (page) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByTestId("hub").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
};

const enterSection = async (page) => {
  await page.keyboard.press("Enter");
  await page.getByTestId("slide-indicator").waitFor({ state: "visible" });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="slide-indicator"]')?.textContent?.includes("1/3"),
  );
  await page.waitForTimeout(500);
};

const waitForMask = async (page) => {
  await page
    .locator('[data-testid="mask-dissolve"][data-words-visible="true"]')
    .waitFor({ state: "visible", timeout: 12_000 });
  await page.waitForTimeout(900);
};

const browser = await chromium.launch();

try {
  console.log("Desktop 1920×1080 (dark)");
  const main = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  const page = await main.newPage();
  attachDiagnostics(page);

  await gotoHub(page);
  await shot(page, "01-hub-dark-1920x1080");

  await enterSection(page);
  await page.waitForTimeout(1800);
  await shot(page, "02-mask-mid-dissolve-1920x1080", 0);
  await waitForMask(page);
  await shot(page, "03-mask-five-threads-1920x1080", 0);

  await page.keyboard.press("p");
  await page.getByTestId("notes-overlay").waitFor({ state: "visible" });
  await shot(page, "04-presenter-notes-1920x1080");
  await page.keyboard.press("Escape");
  await page.getByTestId("notes-overlay").waitFor({ state: "hidden" });

  await page.keyboard.press("Shift+Slash");
  await page.getByTestId("shortcuts-overlay").waitFor({ state: "visible" });
  await shot(page, "05-shortcuts-1920x1080");
  await page.keyboard.press("Escape");
  await page.getByTestId("shortcuts-overlay").waitFor({ state: "hidden" });

  await page.keyboard.press("ArrowRight");
  await page.getByTestId("slide-heading").filter({ hasText: "Definition" }).waitFor();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await shot(page, "06-definition-builds-1920x1080", 700);

  await page.keyboard.press("ArrowRight");
  await page.getByTestId("slide-heading").filter({ hasText: "What Is Personality" }).waitFor();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await shot(page, "07-assessment-builds-1920x1080", 700);

  await page.keyboard.press("ArrowRight");
  await page.getByTestId("hub").waitFor({ state: "visible" });
  await shot(page, "08-hub-complete-1920x1080", 900);

  await page.keyboard.press("t");
  await page.waitForTimeout(500);
  await shot(page, "09-hub-light-1920x1080", 600);

  await page.getByTestId("hub-card-1").click();
  await page.getByTestId("slide-indicator").waitFor({ state: "visible" });
  await page.waitForTimeout(900);
  await shot(page, "10-mask-light-1920x1080", 0);

  // Return to hub, toggle back to dark mode
  await page.keyboard.press("Escape");
  await page.getByTestId("hub").waitFor({ state: "visible" });
  await page.keyboard.press("t");
  await page.waitForTimeout(300);

  // Section 2
  await page.keyboard.press("2");
  await page.getByTestId("slide-heading").filter({ hasText: "Five Practical Domains" }).waitFor();
  for (let i = 0; i < 5; i += 1) await page.keyboard.press("ArrowRight");
  await shot(page, "14-section2-domains-1920x1080", 600);
  await page.keyboard.press("Escape");
  await page.getByTestId("hub").waitFor({ state: "visible" });

  // Section 3
  await page.goto(`${BASE}/#s3/2`, { waitUntil: "networkidle" });
  await page.getByTestId("slide-heading").filter({ hasText: "Two Contrasting Paradigms" }).waitFor();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await shot(page, "15-section3-focus-1920x1080", 600);
  await page.keyboard.press("Escape");
  await page.getByTestId("hub").waitFor({ state: "visible" });

  // Section 4
  await page.keyboard.press("4");
  await page.getByTestId("slide-heading").filter({ hasText: "The Projective Hypothesis" }).waitFor();
  await page.getByTestId("inkblot-visual").waitFor({ state: "visible" });
  await shot(page, "16-section4-inkblot-1920x1080", 600);
  await page.keyboard.press("Escape");
  await page.getByTestId("hub").waitFor({ state: "visible" });

  // Section 5
  await page.keyboard.press("5");
  await page.getByTestId("slide-heading").filter({ hasText: "The Objective Tradition" }).waitFor();
  await page.getByTestId("checklist-visual").waitFor({ state: "visible" });
  await shot(page, "17-section5-checklist-1920x1080", 600);

  // Section 5 table
  await page.goto(`${BASE}/#s5/3`, { waitUntil: "networkidle" });
  await page.getByTestId("comparison-table").waitFor({ state: "visible" });
  for (let i = 0; i < 6; i += 1) await page.keyboard.press("ArrowRight");
  await shot(page, "18-section5-table-1920x1080", 600);

  // Section 5 closing
  await page.goto(`${BASE}/#s5/4`, { waitUntil: "networkidle" });
  await page.getByTestId("slide-heading").filter({ hasText: "A Unified Vision" }).waitFor();
  await shot(page, "19-section5-closing-1920x1080", 600);

  // Section 5 references
  await page.goto(`${BASE}/#s5/5`, { waitUntil: "networkidle" });
  await page.getByTestId("slide-heading").filter({ hasText: "Foundational Literature" }).waitFor();
  for (let i = 0; i < 5; i += 1) await page.keyboard.press("ArrowRight");
  await shot(page, "20-section5-references-1920x1080", 600);

  await main.close();

  console.log("Reduced motion 1920×1080");
  const reduced = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const reducedPage = await reduced.newPage();
  attachDiagnostics(reducedPage);
  await gotoHub(reducedPage);
  await enterSection(reducedPage);
  await reducedPage.waitForTimeout(500);
  await shot(reducedPage, "11-mask-reduced-motion-1920x1080", 0);
  await reduced.close();

  console.log("Projector and 4:3 viewports");
  const sizes = [
    [1366, 768],
    [1280, 720],
    [1024, 768],
    [390, 844],
  ];

  for (const [width, height] of sizes) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });
    const viewportPage = await context.newPage();
    attachDiagnostics(viewportPage);
    await gotoHub(viewportPage);
    await shot(viewportPage, `12-hub-${width}x${height}`);

    if (width === 1024) {
      await enterSection(viewportPage);
      await shot(viewportPage, `13-section-${width}x${height}`, 800);
    }

    await context.close();
  }
} finally {
  await browser.close();
}

if (consoleErrors.length > 0) {
  console.error("\nConsole errors captured:");
  for (const error of consoleErrors) {
    console.error(`  ${error}`);
  }
}
if (externalRequests.length > 0) {
  console.error("\nExternal requests captured:");
  for (const request of externalRequests) {
    console.error(`  ${request}`);
  }
}

if (consoleErrors.length > 0 || externalRequests.length > 0) {
  process.exit(1);
}

console.log("\nScreenshots complete with no console errors or external requests.");

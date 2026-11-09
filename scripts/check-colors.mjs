/**
 * Enforces the single-source colour rule.
 *
 * Every colour literal must live in design/tokens.ts. Components consume CSS
 * custom properties generated from those tokens. This script fails the lint
 * step if a hex, rgb(), or hsl() literal appears anywhere else.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRECTORIES = ["src", "data", "design", "scripts", "tests"];
const SCAN_FILES = [
  "next.config.ts",
  "playwright.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const ALLOWED_FILES = new Set(["design/tokens.ts", "scripts/check-colors.mjs"]);
const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  "out",
  "test-results",
  "playwright-report",
  "screenshots",
]);

const CHECKS = [
  { label: "hex colour", pattern: /#[0-9a-fA-F]{3,8}\b/g },
  { label: "rgb()/rgba() colour", pattern: /\brgba?\s*\(/g },
  { label: "hsl()/hsla() colour", pattern: /\bhsla?\s*\(/g },
];

const walk = (directory) => {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      found.push(...walk(join(directory, entry.name)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    if (SCAN_EXTENSIONS.has(extension)) {
      found.push(join(directory, entry.name));
    }
  }
  return found;
};

const files = [];
for (const directory of SCAN_DIRECTORIES) {
  const absolute = join(ROOT, directory);
  try {
    if (statSync(absolute).isDirectory()) {
      files.push(...walk(absolute));
    }
  } catch {
    // The directory is optional (for example before tests are written).
  }
}
for (const file of SCAN_FILES) {
  const absolute = join(ROOT, file);
  try {
    if (statSync(absolute).isFile()) {
      files.push(absolute);
    }
  } catch {
    // Optional config.
  }
}

const violations = [];

for (const file of files) {
  const relativePath = relative(ROOT, file).replaceAll("\\", "/");
  if (ALLOWED_FILES.has(relativePath)) {
    continue;
  }

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const check of CHECKS) {
      check.pattern.lastIndex = 0;
      if (check.pattern.test(line)) {
        violations.push({
          file: relativePath,
          line: index + 1,
          label: check.label,
          text: line.trim().slice(0, 160),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`Colour rule violated in ${violations.length} place(s):\n`);
  for (const violation of violations) {
    console.error(`  ${violation.file}:${violation.line}  ${violation.label}`);
    console.error(`    ${violation.text}`);
  }
  console.error("\nMove every colour literal into design/tokens.ts and reference it by token.");
  process.exit(1);
}

console.log(`Colour rule OK — ${files.length} source files checked, no literals outside design/tokens.ts.`);

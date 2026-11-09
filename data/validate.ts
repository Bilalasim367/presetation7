import type { SectionId } from "../design/tokens";
import { meta } from "./meta";
import {
  getDefaultBuildCount,
  SECTION_PLAN,
  SECTIONS,
  type CardItem,
  type QuizQuestion,
  type Section,
  type Slide,
  type Variant,
} from "./slides";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

const VARIANTS: readonly Variant[] = [
  "bullets",
  "cards",
  "buildList",
  "table",
  "visualText",
  "focus",
  "closing",
  "references",
  "diagram",
  "activity",
  "quiz",
];

const VISUALS: readonly NonNullable<Slide["visual"]>[] = [
  "maskDissolve",
  "inkblot",
  "checklist",
  "none",
  "persona",
  "purpose",
  "classification",
  "projective",
  "objective",
  "formalInformal",
  "rorschach",
];

const REQUIRED_META_STRINGS = [
  ["deckTitle", meta.deckTitle],
  ["deckSubtitle", meta.deckSubtitle],
  ["course", meta.course],
  ["university", meta.university],
  ["instructor", meta.instructor],
  ["date", meta.date],
  ["language", meta.language],
] as const;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isCardItem = (value: unknown): value is CardItem =>
  typeof value === "object" &&
  value !== null &&
  isNonEmptyString((value as CardItem).title) &&
  isNonEmptyString((value as CardItem).text);

const isQuizQuestion = (value: unknown): value is QuizQuestion =>
  typeof value === "object" &&
  value !== null &&
  isNonEmptyString((value as { q?: unknown }).q) &&
  Array.isArray((value as { options?: unknown }).options) &&
  Number.isInteger((value as { answer?: unknown }).answer);

const slideLabel = (section: Section, index: number, slide: Slide): string =>
  `Section ${section.id}, slide ${index + 1}${slide.id ? ` (${slide.id})` : ""}`;

const checkRichText = (value: string, where: string, errors: string[]): void => {
  const markers = value.match(/\*\*/g)?.length ?? 0;
  if (markers % 2 !== 0) {
    errors.push(`${where}: unbalanced ** key-word markers`);
  }
  if (/\*\*\s*\*\*/.test(value)) {
    errors.push(`${where}: empty ** key-word emphasis`);
  }
};

const validateSlide = (
  slide: Slide,
  section: Section,
  index: number,
  errors: string[],
  warnings: string[],
): void => {
  const where = slideLabel(section, index, slide);

  if (!isNonEmptyString(slide.id)) {
    errors.push(`${where}: missing slide id`);
  }
  if (!isNonEmptyString(slide.heading)) {
    errors.push(`${where}: missing heading`);
  } else {
    checkRichText(slide.heading, where, errors);
  }
  if (slide.subheading !== undefined) {
    if (!isNonEmptyString(slide.subheading)) {
      errors.push(`${where}: subheading is empty`);
    } else {
      checkRichText(slide.subheading, where, errors);
    }
  }
  if (!VARIANTS.includes(slide.variant)) {
    errors.push(`${where}: unknown variant "${String(slide.variant)}"`);
    return;
  }
  if (slide.status !== undefined && slide.status !== "final" && slide.status !== "draft") {
    errors.push(`${where}: status must be "final" or "draft"`);
  }
  if (slide.visual !== undefined && !VISUALS.includes(slide.visual)) {
    errors.push(`${where}: unknown visual "${String(slide.visual)}"`);
  }

  const defaultBuilds = getDefaultBuildCount(slide);
  if (slide.builds !== undefined) {
    if (!Number.isInteger(slide.builds) || slide.builds < 0) {
      errors.push(`${where}: builds must be a whole number of 0 or more`);
    } else if (slide.builds !== 0 && slide.builds !== defaultBuilds) {
      errors.push(
        `${where}: builds is ${slide.builds} but the slide has ${defaultBuilds} revealable items; use 0 for all-at-once or match the item count`,
      );
    }
  }

  if (slide.notes !== undefined && typeof slide.notes !== "string") {
    errors.push(`${where}: notes must be text`);
  }

  const hasItems = slide.items !== undefined && Array.isArray(slide.items) && slide.items.length > 0;

  switch (slide.variant) {
    case "bullets":
    case "buildList": {
      if (!hasItems) {
        errors.push(`${where}: missing items`);
        break;
      }
      if (slide.items && slide.items.length > 6) {
        errors.push(`${where}: ${slide.items.length} items exceed the 6-item readability limit`);
      }
      slide.items?.forEach((item, itemIndex) => {
        if (typeof item !== "string" || !item.trim()) {
          errors.push(`${where}: item ${itemIndex + 1} must be a non-empty string`);
          return;
        }
        checkRichText(item, `${where}, item ${itemIndex + 1}`, errors);
      });
      break;
    }
    case "visualText": {
      if (!hasItems) {
        errors.push(`${where}: missing items`);
        break;
      }
      if (slide.items && slide.items.length > 4) {
        errors.push(`${where}: ${slide.items.length} paragraphs exceed the 4-paragraph limit for a visual slide`);
      }
      slide.items?.forEach((item, itemIndex) => {
        if (typeof item !== "string" || !item.trim()) {
          errors.push(`${where}: paragraph ${itemIndex + 1} must be a non-empty string`);
          return;
        }
        checkRichText(item, `${where}, paragraph ${itemIndex + 1}`, errors);
      });
      break;
    }
    case "cards": {
      if (!hasItems || !slide.items) {
        errors.push(`${where}: missing card items`);
        break;
      }
      if (slide.items.length > 5) {
        errors.push(`${where}: ${slide.items.length} cards exceed the 5-card limit`);
      }
      slide.items.forEach((item, itemIndex) => {
        if (!isCardItem(item)) {
          errors.push(`${where}: card ${itemIndex + 1} needs a title and text`);
          return;
        }
        checkRichText(item.title, `${where}, card ${itemIndex + 1} title`, errors);
        checkRichText(item.text, `${where}, card ${itemIndex + 1} text`, errors);
      });
      break;
    }
    case "focus": {
      if (!hasItems || !slide.items) {
        errors.push(`${where}: needs two focus cards`);
        break;
      }
      if (slide.items.length !== 2) {
        errors.push(`${where}: focus slides need exactly 2 cards, found ${slide.items.length}`);
      }
      slide.items.forEach((item, itemIndex) => {
        if (!isCardItem(item)) {
          errors.push(`${where}: focus card ${itemIndex + 1} needs a title and text`);
          return;
        }
        checkRichText(item.title, `${where}, focus card ${itemIndex + 1} title`, errors);
        checkRichText(item.text, `${where}, focus card ${itemIndex + 1} text`, errors);
      });
      break;
    }
    case "table": {
      if (!slide.table) {
        errors.push(`${where}: missing table`);
        break;
      }
      const { columns, rows } = slide.table;
      if (!Array.isArray(columns) || columns.length < 2 || columns.length > 4) {
        errors.push(`${where}: table needs 2–4 columns`);
      } else {
        columns.forEach((column, columnIndex) => {
          if (!isNonEmptyString(column)) {
            errors.push(`${where}: table column ${columnIndex + 1} is empty`);
          }
        });
      }
      if (!Array.isArray(rows) || rows.length === 0 || rows.length > 9) {
        errors.push(`${where}: table needs 1–9 rows`);
      } else {
        rows.forEach((row, rowIndex) => {
          if (!Array.isArray(row) || row.length !== columns.length) {
            errors.push(
              `${where}: table row ${rowIndex + 1} has ${Array.isArray(row) ? row.length : 0} cells; expected ${columns.length}`,
            );
            return;
          }
          row.forEach((cell, cellIndex) => {
            if (!isNonEmptyString(cell)) {
              errors.push(`${where}: table row ${rowIndex + 1}, cell ${cellIndex + 1} is empty`);
            } else {
              checkRichText(cell, `${where}, table row ${rowIndex + 1} cell ${cellIndex + 1}`, errors);
            }
          });
        });
      }
      break;
    }
    case "closing": {
      if (defaultBuilds !== 0) {
        errors.push(`${where}: closing slides cannot have builds`);
      }
      break;
    }
    case "diagram": {
      if (!hasItems) {
        errors.push(`${where}: diagram slides need a short caption`);
        break;
      }
      if (slide.items && slide.items.length > 3) {
        errors.push(`${where}: diagram slides allow at most 3 caption lines`);
      }
      slide.items?.forEach((item, itemIndex) => {
        if (typeof item !== "string" || !item.trim()) {
          errors.push(`${where}: caption ${itemIndex + 1} must be a non-empty string`);
          return;
        }
        checkRichText(item, `${where}, caption ${itemIndex + 1}`, errors);
      });
      break;
    }
    case "activity": {
      if (!hasItems) {
        errors.push(`${where}: activity slides need at least one step`);
        break;
      }
      if (slide.items && slide.items.length > 5) {
        errors.push(`${where}: ${slide.items.length} steps exceed the 5-step activity limit`);
      }
      slide.items?.forEach((item, itemIndex) => {
        if (typeof item !== "string" || !item.trim()) {
          errors.push(`${where}: step ${itemIndex + 1} must be a non-empty string`);
          return;
        }
        checkRichText(item, `${where}, step ${itemIndex + 1}`, errors);
      });
      break;
    }
    case "quiz": {
      if (!Array.isArray(slide.quiz) || slide.quiz.length === 0) {
        errors.push(`${where}: quiz slides need at least one question`);
        break;
      }
      slide.quiz.forEach((question, questionIndex) => {
        if (!isQuizQuestion(question)) {
          errors.push(`${where}: question ${questionIndex + 1} needs a question and an integer answer`);
          return;
        }
        checkRichText(question.q, `${where}, question ${questionIndex + 1}`, errors);
        if (question.options.length < 2 || question.options.length > 4) {
          errors.push(`${where}: question ${questionIndex + 1} needs 2–4 options`);
        }
        if (question.answer < 0 || question.answer >= question.options.length) {
          errors.push(
            `${where}: question ${questionIndex + 1} answer index ${question.answer} is outside its options`,
          );
        }
        question.options.forEach((option, optionIndex) => {
          if (!isNonEmptyString(option)) {
            errors.push(
              `${where}: question ${questionIndex + 1}, option ${optionIndex + 1} is empty`,
            );
          } else {
            checkRichText(
              option,
              `${where}, question ${questionIndex + 1} option ${optionIndex + 1}`,
              errors,
            );
          }
        });
      });
      break;
    }
    case "references": {
      if (!hasItems) {
        errors.push(`${where}: missing references`);
        break;
      }
      slide.items?.forEach((item, itemIndex) => {
        if (typeof item !== "string" || !item.trim()) {
          errors.push(`${where}: reference ${itemIndex + 1} must be a non-empty string`);
          return;
        }
        checkRichText(item, `${where}, reference ${itemIndex + 1}`, errors);
      });
      if (slide.status !== "draft") {
        warnings.push(`${where}: references should be marked draft until every entry is verified`);
      }
      break;
    }
    default:
      break;
  }

  if (slide.status === "draft" && !slide.notes) {
    warnings.push(`${where}: draft slide has no presenter notes`);
  }
  if (!slide.notes) {
    warnings.push(`${where}: no presenter notes`);
  }
};

/**
 * Validates the whole deck. Runs in the page render on both server and client,
 * and can be called directly from tests. It never throws.
 */
export const validateDeck = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  REQUIRED_META_STRINGS.forEach(([name, value]) => {
    if (!isNonEmptyString(value)) {
      errors.push(`meta.${name}: missing value`);
    }
  });

  if (!Array.isArray(meta.students) || meta.students.length !== 5) {
    errors.push("meta.students: expected exactly 5 presenter names");
  } else {
    meta.students.forEach((student, index) => {
      if (!isNonEmptyString(student)) {
        errors.push(`meta.students[${index}]: missing presenter name`);
      }
    });
  }

  ([1, 2, 3, 4, 5] as SectionId[]).forEach((id) => {
    const target = meta.targetSeconds[id];
    if (!Number.isFinite(target) || target <= 0) {
      errors.push(`meta.targetSeconds[${id}]: must be a positive number of seconds`);
    }
  });

  if (SECTION_PLAN.length !== 5) {
    errors.push(`Section plan: expected 5 sections, found ${SECTION_PLAN.length}`);
  }

  const planIds = new Set<number>();
  SECTION_PLAN.forEach((entry, index) => {
    if (!Number.isInteger(entry.id) || entry.id < 1 || entry.id > 5) {
      errors.push(`Section plan entry ${index + 1}: id must be 1–5`);
    }
    if (planIds.has(entry.id)) {
      errors.push(`Section plan: duplicate section id ${entry.id}`);
    }
    planIds.add(entry.id);
    if (!isNonEmptyString(entry.title)) {
      errors.push(`Section plan, section ${entry.id}: missing title`);
    }
    if (!isNonEmptyString(entry.shortTitle)) {
      errors.push(`Section plan, section ${entry.id}: missing short title`);
    }
    if (!isNonEmptyString(entry.icon)) {
      errors.push(`Section plan, section ${entry.id}: missing icon`);
    }
  });

  const sectionIds = new Set<number>();
  const slideIds = new Set<string>();

  SECTIONS.forEach((section) => {
    if (!planIds.has(section.id)) {
      errors.push(`Section ${section.id}: not present in the five-section plan`);
    }
    if (sectionIds.has(section.id)) {
      errors.push(`Section ${section.id}: duplicate section id`);
    }
    sectionIds.add(section.id);

    if (!isNonEmptyString(section.title)) {
      errors.push(`Section ${section.id}: missing title`);
    }
    if (!isNonEmptyString(section.shortTitle)) {
      errors.push(`Section ${section.id}: missing short title`);
    }
    if (!isNonEmptyString(section.icon)) {
      errors.push(`Section ${section.id}: missing icon`);
    }
    if (!Array.isArray(section.slides) || section.slides.length === 0) {
      errors.push(`Section ${section.id}: has no slides`);
      return;
    }

    section.slides.forEach((slide, index) => {
      if (isNonEmptyString(slide.id)) {
        const key = `${section.id}:${slide.id}`;
        if (slideIds.has(key)) {
          errors.push(`Section ${section.id}, slide ${index + 1}: duplicate slide id "${slide.id}"`);
        }
        slideIds.add(key);
      }
      validateSlide(slide, section, index, errors, warnings);
    });
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};

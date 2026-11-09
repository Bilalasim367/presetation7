import type { SectionId } from "../design/tokens";

export interface PresentationMeta {
  readonly deckTitle: string;
  readonly deckSubtitle: string;
  readonly course: string;
  readonly university: string;
  readonly instructor: string;
  readonly date: string;
  readonly language: string;
  /** Replace the five placeholders with the real presenter names. */
  readonly students: readonly [string, string, string, string, string];
  /** Presentation target per section, in seconds. */
  readonly targetSeconds: Readonly<Record<SectionId, number>>;
  /** 16:9 opening film shown after the welcome sequence. Replace the file, keep the path. */
  readonly introVideo: string;
}

export const meta = {
  deckTitle: "Personality Assessment",
  deckSubtitle: "Projective and Objective Assessment",
  course: "Introduction to Psychology",
  university: "University",
  instructor: "Course Instructor",
  date: "07 November 2026",
  language: "English",
  students: ["Bilal", "Fatima", "Mahnoor", "Iman fatima", "Abdullah umar"],
  targetSeconds: {
    1: 240,
    2: 240,
    3: 240,
    4: 240,
    5: 300,
  },
  introVideo: "/media/intro.mp4",
} as const satisfies PresentationMeta;

export const courseLine = [meta.course, meta.university, meta.date].join(" · ");

export const formatClock = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatTarget = (seconds: number): string => `${Math.round(seconds / 60)} min`;

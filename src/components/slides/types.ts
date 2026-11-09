import type { Section, Slide } from "@data/slides";
import type { ThemeName } from "@design/tokens";

export interface SlideViewProps {
  section: Section;
  slide: Slide;
  build: number;
  theme: ThemeName;
}

"use client";

import { BulletsSlide } from "./BulletsSlide";
import { BuildListSlide } from "./BuildListSlide";
import { CardsSlide } from "./CardsSlide";
import { ClosingSlide } from "./ClosingSlide";
import { DiagramSlide } from "./DiagramSlide";
import { FocusSlide } from "./FocusSlide";
import { ActivitySlide } from "./ActivitySlide";
import { QuizSlide } from "./QuizSlide";
import { ReferencesSlide } from "./ReferencesSlide";
import { TableSlide } from "./TableSlide";
import { VisualTextSlide } from "./VisualTextSlide";
import type { SlideViewProps } from "./types";

export function SlideRenderer(props: SlideViewProps) {
  switch (props.slide.variant) {
    case "bullets":
      return <BulletsSlide {...props} />;
    case "buildList":
      return <BuildListSlide {...props} />;
    case "cards":
      return <CardsSlide {...props} />;
    case "table":
      return <TableSlide {...props} />;
    case "visualText":
      return <VisualTextSlide {...props} />;
    case "focus":
      return <FocusSlide {...props} />;
    case "closing":
      return <ClosingSlide {...props} />;
    case "references":
      return <ReferencesSlide {...props} />;
    case "diagram":
      return <DiagramSlide {...props} />;
    case "activity":
      return <ActivitySlide {...props} />;
    case "quiz":
      return <QuizSlide {...props} />;
    default:
      return null;
  }
}

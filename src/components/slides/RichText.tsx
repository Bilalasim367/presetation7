import { Fragment, type ReactNode } from "react";

interface RichTextProps {
  text: string;
  glow?: boolean;
  className?: string;
}

/**
 * Renders the deck's tiny markup language: **key words** become medium-weight
 * emphasis. When `glow` is true the emphasis briefly shines in the highlight
 * colour, then settles back to the surrounding text colour.
 */
export const RichText = ({ text, glow = false, className }: RichTextProps): ReactNode => {
  const segments = text.split("**");

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.length === 0) {
          return null;
        }

        const emphasized = index % 2 === 1;
        return emphasized ? (
          <strong
            key={`${index}-${segment}`}
            className={`font-medium text-text ${glow ? "key-glow" : ""}`}
          >
            {segment}
          </strong>
        ) : (
          <Fragment key={`${index}-${segment}`}>{segment}</Fragment>
        );
      })}
    </span>
  );
};

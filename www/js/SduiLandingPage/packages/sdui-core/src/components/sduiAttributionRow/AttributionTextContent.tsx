"use client";
import { toHtmlElement } from "../../utils/htmlElement";
import type { SduiTextTruncate } from "../../types";
import { getAttributionTextContentStyles } from "./attributionRowStyleUtils";

export interface AttributionTextContentProps {
  title?: string;
  titleFontStyle?: string;
  /**
   * @example h1, p, span
   * @default span
   */
  titleHeadingLevel?: string;
  titleTextColor?: string;
  titleTextTruncate?: SduiTextTruncate;
  titleMaxLines?: number;
  subtitle?: string;
  subtitleTextColor?: string;
  subtitleFontStyle?: string;
  /**
   * @example h1, p, span
   * @default span
   */
  subtitleHeadingLevel?: string;

  subtitleTextTruncate?: SduiTextTruncate;
  subtitleMaxLines?: number;
  gapBetweenTitleAndSubtitle?: number;
}

export const AttributionTextContent = ({
  title,
  titleFontStyle,
  titleTextColor,
  titleHeadingLevel,
  titleTextTruncate,
  titleMaxLines,
  subtitle,
  subtitleFontStyle,
  subtitleTextColor,
  subtitleHeadingLevel,
  subtitleTextTruncate,
  subtitleMaxLines,
  gapBetweenTitleAndSubtitle,
}: AttributionTextContentProps) => {
  const { containerStyles, titleStyles, subtitleStyles } = getAttributionTextContentStyles({
    titleFontStyle,
    titleTextColor,
    titleTextTruncate,
    titleMaxLines,
    subtitleFontStyle,
    subtitleTextColor,
    subtitleTextTruncate,
    subtitleMaxLines,
    gapBetweenTitleAndSubtitle,
  });

  const TitleWebTextElement = toHtmlElement(titleHeadingLevel);
  const SubtitleWebTextElement = toHtmlElement(subtitleHeadingLevel);
  return (
    <div {...containerStyles} data-testid="attribution-text-content-container">
      {title && <TitleWebTextElement {...titleStyles}>{title}</TitleWebTextElement>}
      {subtitle && <SubtitleWebTextElement {...subtitleStyles}>{subtitle}</SubtitleWebTextElement>}
    </div>
  );
};

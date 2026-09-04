"use client";
import type { SduiDim2, SduiRendererInjectedProps } from "../../types";
import { AttributionTextContent, type AttributionTextContentProps } from "./AttributionTextContent";
import { getAttributionRowStyles } from "./attributionRowStyleUtils";

export interface SduiAttributionRowProps
  extends AttributionTextContentProps,
    SduiRendererInjectedProps {
  imageComponent?: React.ReactNode;
  rightButtonContent?: React.ReactNode;
  size?: SduiDim2;
}

export const SduiAttributionRow = ({
  rightButtonContent,
  imageComponent,
  size,
  title,
  titleFontStyle,
  titleHeadingLevel,
  titleTextColor,
  titleTextTruncate,
  titleMaxLines,
  subtitle,
  subtitleTextColor,
  subtitleFontStyle,
  subtitleHeadingLevel,
  subtitleTextTruncate,
  subtitleMaxLines,
  gapBetweenTitleAndSubtitle,
}: SduiAttributionRowProps) => {
  const { containerStyles, thumbnailStyles, buttonStyles } = getAttributionRowStyles({ size });

  return (
    <div {...containerStyles}>
      {imageComponent && <div {...thumbnailStyles}>{imageComponent}</div>}
      <AttributionTextContent
        title={title}
        titleFontStyle={titleFontStyle}
        titleHeadingLevel={titleHeadingLevel}
        titleTextColor={titleTextColor}
        titleTextTruncate={titleTextTruncate}
        titleMaxLines={titleMaxLines}
        subtitle={subtitle}
        subtitleTextColor={subtitleTextColor}
        subtitleFontStyle={subtitleFontStyle}
        subtitleHeadingLevel={subtitleHeadingLevel}
        subtitleTextTruncate={subtitleTextTruncate}
        subtitleMaxLines={subtitleMaxLines}
        gapBetweenTitleAndSubtitle={gapBetweenTitleAndSubtitle}
      />
      {rightButtonContent && <div {...buttonStyles}>{rightButtonContent}</div>}
    </div>
  );
};

import { clsx } from "clsx";
import { buildFoundationTokenCss } from "../../utils/foundationToCss";
import type { SduiDim2, SduiTextTruncate } from "../../types";
import { buildSizeCss } from "../../utils/valueToCss";

interface GetAttributionTextContentStylesParams {
  titleFontStyle?: string;
  titleTextColor?: string;
  titleTextTruncate?: SduiTextTruncate;
  titleMaxLines?: number;
  subtitleFontStyle?: string;
  subtitleTextColor?: string;
  subtitleTextTruncate?: SduiTextTruncate;
  subtitleMaxLines?: number;
  gapBetweenTitleAndSubtitle?: number;
}

const getLineClampStyles = (maxLines?: number) =>
  maxLines === undefined
    ? {}
    : {
        overflow: "hidden" as const,
        display: "-webkit-box" as const,
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical" as const,
      };

export const getAttributionTextContentStyles = ({
  titleFontStyle,
  titleTextTruncate,
  titleTextColor,
  titleMaxLines,
  subtitleFontStyle,
  subtitleTextTruncate,
  subtitleTextColor,
  subtitleMaxLines,
  gapBetweenTitleAndSubtitle,
}: GetAttributionTextContentStylesParams) => {
  return {
    containerStyles: {
      className: clsx("flex", "flex-col", "items-start", "max-width-full", "min-width-none"),
      style: {
        ...(gapBetweenTitleAndSubtitle ? { rowGap: `${gapBetweenTitleAndSubtitle}px` } : {}),
      },
    },
    titleStyles: {
      className: clsx(
        "clip",
        buildFoundationTokenCss(titleFontStyle),
        titleTextTruncate,
        "padding-none",
      ),
      style: {
        ...getLineClampStyles(titleMaxLines),
        color: titleTextColor,
        whiteSpace: "pre-line",
      },
    },
    subtitleStyles: {
      className: clsx(
        buildFoundationTokenCss(subtitleFontStyle),
        "clip",
        subtitleTextTruncate,
        "padding-none",
      ),
      style: {
        ...getLineClampStyles(subtitleMaxLines),
        color: subtitleTextColor,
        whiteSpace: "pre-line",
      },
    },
  };
};

interface GetAttributionRowStylesParams {
  size?: SduiDim2;
}

export const getAttributionRowStyles = ({ size }: GetAttributionRowStylesParams) => {
  return {
    containerStyles: {
      className: clsx("flex", "relative", "flex-row", "items-center", "width-full", "gap-x-small"),
      style: {
        // automaticSize is set as "x" because we only need to set the height
        ...buildSizeCss(size, "x"),
      },
    },
    thumbnailStyles: {
      className: clsx("height-full", "aspect-1-1", "flex", "flex-col", "radius-medium", "clip"),
      style: {
        marginRight: "12px",
      },
    },
    buttonStyles: {
      className: clsx("margin-left-auto"),
    },
  };
};

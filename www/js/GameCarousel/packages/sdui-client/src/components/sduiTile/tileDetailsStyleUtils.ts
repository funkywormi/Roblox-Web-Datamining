import { clsx } from "clsx";
import type { CSSProperties } from "react";
import {
  buildFoundationTokenCss,
  buildTextXAlignmentCss,
  buildSduiTokenClass,
  getSduiNumeric,
  getSduiToken,
  type SduiTokenOrLiteral,
  type SduiTextXAlignment,
} from "@rbx/sdui-core";
import { getPaddingStyles } from "./sduiTileStyleUtils";

interface GetTileDetailsStylesParams {
  containmentPadding?: SduiTokenOrLiteral | null;
  isContained?: boolean;
  titleFont?: SduiTokenOrLiteral | null;
  titleLines?: number;
  titleTextXAlignment?: SduiTextXAlignment;
}

export const getTileDetailsStyles = ({
  containmentPadding,
  isContained = false,
  titleFont,
  titleLines = 1,
  titleTextXAlignment,
}: GetTileDetailsStylesParams) => {
  const resolvedContainmentPadding =
    containmentPadding ?? ({ kind: "token", value: "Padding.Small" } as const);
  const containmentPaddingXStyles = getPaddingStyles(resolvedContainmentPadding, "paddingX");
  const containmentPaddingBottomClass = buildSduiTokenClass(
    resolvedContainmentPadding,
    "paddingBottom",
  );
  const containmentPaddingNumeric = getSduiNumeric(resolvedContainmentPadding);
  const titleFontClass =
    buildFoundationTokenCss(getSduiToken(titleFont ?? undefined)) ?? "text-title-medium";
  const titleClampStyle: CSSProperties | undefined =
    titleLines === 1
      ? undefined
      : {
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: titleLines,
          WebkitBoxOrient: "vertical",
        };

  return {
    detailsStyles: {
      className: clsx(
        "flex",
        "flex-col",
        "width-full",
        "[box-sizing:border-box]",
        isContained && containmentPaddingXStyles.className,
        isContained && containmentPaddingBottomClass,
      ),
      style: isContained
        ? {
            ...containmentPaddingXStyles.style,
            ...(containmentPaddingNumeric != null
              ? { paddingBottom: containmentPaddingNumeric }
              : {}),
          }
        : undefined,
    },
    titleStyles: {
      className: clsx(
        "content-emphasis",
        titleFontClass,
        titleLines === 1 && "text-truncate-end text-no-wrap [overflow-wrap:break-word]",
        buildTextXAlignmentCss(titleTextXAlignment ?? "left"),
      ),
      style: titleClampStyle,
    },
    footerStyles: {
      className: clsx("flex", "flex-col", "width-full"),
    },
  };
};

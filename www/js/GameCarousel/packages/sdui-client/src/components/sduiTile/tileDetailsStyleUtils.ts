import { clsx } from "clsx";
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
  titleTextXAlignment?: SduiTextXAlignment;
}

export const getTileDetailsStyles = ({
  containmentPadding,
  isContained = false,
  titleFont,
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
        buildTextXAlignmentCss(titleTextXAlignment ?? "left"),
      ),
    },
    footerStyles: {
      className: clsx("flex", "flex-col", "width-full"),
    },
  };
};

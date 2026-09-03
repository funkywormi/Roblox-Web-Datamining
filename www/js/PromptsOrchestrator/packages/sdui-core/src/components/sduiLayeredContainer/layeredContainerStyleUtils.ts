import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { SduiDim2, SduiTokenOrLiteral } from "../../types";
import { buildSduiNumericStyle, buildSduiTokenClass } from "../../utils/styleValue";
import { buildSizeCss } from "../../utils/valueToCss";

interface GetLayeredContainerStylesParams {
  size?: SduiDim2;
  classNames?: string;
  foregroundMaxWidth?: SduiTokenOrLiteral;
  foregroundHorizontalPadding?: SduiTokenOrLiteral;
  foregroundTopPadding?: SduiTokenOrLiteral;
  foregroundBottomPadding?: SduiTokenOrLiteral;
}

export const getLayeredContainerStyles = ({
  size,
  classNames,
  foregroundMaxWidth,
  foregroundHorizontalPadding,
  foregroundTopPadding,
  foregroundBottomPadding,
}: GetLayeredContainerStylesParams) => {
  const sizeCss = buildSizeCss(size);
  const hasExplicitHeight = size != null && (size.yScale !== 0 || size.yOffset !== 0);

  return {
    containerStyles: {
      className: classNames,
      style: {
        ...sizeCss,
      } satisfies CSSProperties,
    },
    backgroundStyles: {
      className: "absolute inset-[0] pointer-events-none",
    },
    foregroundStyles: {
      className: clsx(
        "relative",
        "width-full",
        "pointer-events-auto",
        hasExplicitHeight && "height-full",
        "flex",
        "justify-center",
        buildSduiTokenClass(foregroundHorizontalPadding, "paddingX"),
        buildSduiTokenClass(foregroundTopPadding, "paddingTop"),
        buildSduiTokenClass(foregroundBottomPadding, "paddingBottom"),
      ),
      style: {
        ...buildSduiNumericStyle(foregroundTopPadding, paddingTop => ({ paddingTop })),
        ...buildSduiNumericStyle(foregroundBottomPadding, paddingBottom => ({ paddingBottom })),
        ...buildSduiNumericStyle(foregroundHorizontalPadding, padding => ({
          paddingLeft: padding,
          paddingRight: padding,
        })),
      } satisfies CSSProperties,
    },
    foregroundContentStyles: {
      className: clsx(
        "width-full",
        hasExplicitHeight && "height-full",
        buildSduiTokenClass(foregroundMaxWidth, "maxWidth"),
      ),
      style: {
        ...buildSduiNumericStyle(foregroundMaxWidth, maxWidth => ({ maxWidth })),
      } satisfies CSSProperties,
    },
  };
};

import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { SduiTokenOrLiteral } from "../../types";
import { buildSduiNumericStyle, buildSduiTokenClass } from "../../utils/styleValue";

interface GetPageHeaderStylesParams {
  backgroundMaxWidth?: SduiTokenOrLiteral;
  foregroundMaxWidth?: SduiTokenOrLiteral;
  foregroundHorizontalPadding?: SduiTokenOrLiteral;
  foregroundBottomPadding?: SduiTokenOrLiteral;
  foregroundFill?: boolean;
  foregroundTopPadding?: SduiTokenOrLiteral;
}

export const getPageHeaderStyles = ({
  backgroundMaxWidth,
  foregroundMaxWidth,
  foregroundHorizontalPadding,
  foregroundBottomPadding,
  foregroundFill,
  foregroundTopPadding,
}: GetPageHeaderStylesParams) => {
  return {
    containerStyles: {
      className: "relative flex justify-center items-start",
    },
    backgroundStyles: {
      className: clsx(
        "relative",
        "width-full",
        buildSduiTokenClass(backgroundMaxWidth, "maxWidth"),
      ),
      style: {
        ...buildSduiNumericStyle(backgroundMaxWidth, maxWidth => ({ maxWidth })),
      } satisfies CSSProperties,
    },
    foregroundStyles: {
      className: clsx(
        "absolute bottom-[0] left-[0] width-full flex justify-center",
        foregroundFill && "top-[0] flex-col items-center",
        buildSduiTokenClass(foregroundHorizontalPadding, "paddingX"),
        foregroundFill && buildSduiTokenClass(foregroundTopPadding, "paddingTop"),
        buildSduiTokenClass(foregroundBottomPadding, "paddingBottom"),
      ),
      style: {
        ...(foregroundFill
          ? buildSduiNumericStyle(foregroundTopPadding, paddingTop => ({ paddingTop }))
          : {}),
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
        foregroundFill ? "height-full" : null,
        buildSduiTokenClass(foregroundMaxWidth, "maxWidth"),
      ),
      style: {
        ...buildSduiNumericStyle(foregroundMaxWidth, maxWidth => ({ maxWidth })),
      } satisfies CSSProperties,
    },
  };
};

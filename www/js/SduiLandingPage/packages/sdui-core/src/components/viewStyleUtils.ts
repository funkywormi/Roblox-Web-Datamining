import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { SduiDim2, SduiScaleBasis, SduiTokenOrLiteral } from "../types";
import { buildSduiNumericStyle, buildSduiTokenClass } from "../utils/styleValue";
import { buildSizeCss } from "../utils/valueToCss";

interface GetViewStylesParams {
  classNames?: string;
  size?: SduiDim2;
  maxWidth?: SduiTokenOrLiteral;
  /** From `ViewSchema.WebProps.y_scale_basis`. */
  yScaleBasis?: SduiScaleBasis;
}

/**
 * Builds className + inline styles for View from proto `size` (UDim2) plus
 * web-only `maxWidth` / `classNames` / `yScaleBasis`.
 */
export function getViewStyles({ classNames, size, maxWidth, yScaleBasis }: GetViewStylesParams) {
  const style: CSSProperties = {
    ...buildSizeCss(size, undefined, { yScaleBasis }),
    ...buildSduiNumericStyle(maxWidth, value => ({ maxWidth: value })),
  };

  return {
    className: clsx(classNames, buildSduiTokenClass(maxWidth, "maxWidth")),
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}

import { clsx } from "clsx";
import type { CSSProperties } from "react";
import {
  buildFoundationColorCssVar,
  buildPositionAndAnchorPointCss,
  buildSduiNumericStyle,
  buildSduiTokenClass,
  buildSizeCss,
  type SduiDim2,
  type SduiScaleBasis,
  type SduiTokenOrLiteral,
  type SduiVector2,
} from "@rbx/sdui-core";

interface GetViewStylesParams {
  classNames?: string;
  size?: SduiDim2;
  maxWidth?: SduiTokenOrLiteral;
  /** From `ViewSchema.WebProps.y_scale_basis`. */
  yScaleBasis?: SduiScaleBasis;
  anchorPoint?: SduiVector2;
  position?: SduiDim2;
  zIndex?: number;
  clipsDescendants?: boolean;
  visible?: boolean;
  backgroundStyle?: SduiTokenOrLiteral;
}

function resolveBackgroundColor(
  backgroundStyle: SduiTokenOrLiteral | undefined,
  backgroundTokenClass: string | undefined,
): string | undefined {
  if (backgroundTokenClass != null || backgroundStyle?.kind !== "token") return undefined;
  return buildFoundationColorCssVar(backgroundStyle.value) ?? backgroundStyle.value;
}

/**
 * Builds the View className and inline style from its schema props.
 */
export function getViewStyles({
  classNames,
  size,
  maxWidth,
  yScaleBasis,
  anchorPoint,
  position,
  zIndex,
  clipsDescendants,
  visible,
  backgroundStyle,
}: GetViewStylesParams) {
  const backgroundTokenClass = buildSduiTokenClass(backgroundStyle, "background");
  const backgroundColor = resolveBackgroundColor(backgroundStyle, backgroundTokenClass);
  const placement =
    position != null || anchorPoint != null
      ? buildPositionAndAnchorPointCss(position, anchorPoint)
      : {};

  const style: CSSProperties = {
    ...buildSizeCss(size, undefined, { yScaleBasis }),
    ...buildSduiNumericStyle(maxWidth, value => ({ maxWidth: value })),
    ...placement,
    ...(zIndex != null ? { zIndex } : {}),
    ...(backgroundColor != null ? { backgroundColor } : {}),
  };

  return {
    className: clsx(
      classNames,
      buildSduiTokenClass(maxWidth, "maxWidth"),
      backgroundTokenClass,
      clipsDescendants && "clip",
      visible === false && "hidden",
    ),
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}

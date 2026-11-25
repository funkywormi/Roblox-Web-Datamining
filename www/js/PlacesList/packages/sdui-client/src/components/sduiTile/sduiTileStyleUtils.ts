import { clsx } from "clsx";
import type { CSSProperties } from "react";
import {
  buildSduiTokenClass,
  getSduiNumeric,
  getSduiToken,
  resolveFoundationRadiusClass,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";

interface GetSduiTileStylesParams {
  cornerRadius?: SduiTokenOrLiteral | null;
  isContained?: boolean;
}

export function getRadiusStyles(
  value: SduiTokenOrLiteral | null | undefined,
  defaultClass?: string,
) {
  const radiusClass = resolveFoundationRadiusClass(getSduiToken(value ?? undefined));
  const radius = getSduiNumeric(value ?? undefined);

  return {
    className: radiusClass ?? (radius == null ? defaultClass : undefined),
    style: radiusClass == null && radius != null ? { borderRadius: radius } : undefined,
  };
}

export function getPaddingStyles(
  value: SduiTokenOrLiteral | null | undefined,
  usageKey?: string,
): { className?: string; style?: CSSProperties } {
  const tokenClass = buildSduiTokenClass(value ?? undefined, usageKey);
  const padding = getSduiNumeric(value ?? undefined);
  if (tokenClass != null) return { className: tokenClass };
  if (padding == null) return {};

  if (usageKey === "paddingX") {
    return { style: { paddingLeft: padding, paddingRight: padding } };
  }
  return { style: { padding } };
}

export const getSduiTileStyles = ({
  cornerRadius,
  isContained = false,
}: GetSduiTileStylesParams) => {
  const cardRadius = getRadiusStyles(cornerRadius, "radius-medium");

  return {
    rootStyles: {
      className: clsx(
        "sdui-tile",
        "relative",
        "flex",
        "flex-col",
        "width-full",
        isContained && "bg-surface-100",
        isContained && cardRadius.className,
      ),
      style: isContained ? cardRadius.style : undefined,
    },
    activationStyles: {
      className: clsx(
        "absolute",
        "inset-[0px]",
        "[z-index:1]",
        "width-full",
        "height-full",
        "[border-radius:inherit]",
        "focus-visible:[outline:var(--stroke-thick)_solid_var(--color-action-emphasis-background)]",
        "focus-visible:[outline-offset:var(--gap-xsmall)]",
      ),
    },
    visualStyles: {
      className: clsx(
        "sdui-tile-visual",
        "relative",
        "[z-index:2]",
        "pointer-events-none",
        "flex",
        "flex-col",
        "gap-medium",
      ),
    },
  };
};

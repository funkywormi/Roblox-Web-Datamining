"use client";
import { clsx } from "clsx";
import { SystemBanner } from "@rbx/foundation-ui";
import { toSystemBannerSeverity, toSystemBannerVariant } from "../../utils/foundationEnums";
import { buildPositionAndAnchorPointCss } from "../../utils/valueToCss";
import type {
  SduiDim2,
  SduiRendererInjectedProps,
  SduiResolvedAction,
  SduiVector2,
} from "../../types";
import {
  renderBannerActions,
  SDUI_BANNER_CONTAINER_CLASS,
  type SduiBannerAction,
} from "./renderUtils";

export type SduiSystemBannerProps = SduiRendererInjectedProps & {
  severity?: string;
  variant?: string;
  title?: string;
  description?: string;
  actions?: SduiBannerAction[];
  onClose?: SduiResolvedAction;
  closeButtonAriaLabel?: string;
  position?: SduiDim2;
  anchorPoint?: SduiVector2;
  zIndex?: number;
  visible?: boolean;
};

/**
 * SDUI wrapper around Foundation `SystemBanner`.
 * Skips render when `visible === false`. Layout uses position/anchor CSS.
 */
export function SduiSystemBanner({
  severity,
  variant,
  title,
  description,
  actions,
  onClose,
  closeButtonAriaLabel,
  position,
  anchorPoint,
  zIndex,
  visible,
}: SduiSystemBannerProps) {
  if (visible === false) return null;

  const resolvedSeverity = toSystemBannerSeverity(severity, "Info");
  const resolvedVariant = toSystemBannerVariant(variant, "Standard");

  const layoutStyle = {
    ...(position != null || anchorPoint != null
      ? buildPositionAndAnchorPointCss(position, anchorPoint)
      : {}),
    ...(zIndex != null ? { zIndex } : {}),
  };

  return (
    <SystemBanner
      // Match the AlertV2 design and how it looks on Lua
      className={clsx(SDUI_BANNER_CONTAINER_CLASS, "radius-none")}
      title={title ?? ""}
      description={description}
      severity={resolvedSeverity}
      variant={resolvedVariant}
      actions={renderBannerActions(actions, {
        styleContext: { variant: resolvedVariant, severity: resolvedSeverity },
        stacksWhenNarrow: true,
      })}
      onDismiss={onClose?.onActivated}
      dismissIconAriaLabel={closeButtonAriaLabel}
      style={layoutStyle}
    />
  );
}

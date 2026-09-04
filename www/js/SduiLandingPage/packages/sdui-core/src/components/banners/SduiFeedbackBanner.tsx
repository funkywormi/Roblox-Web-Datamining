"use client";
import { FeedbackBanner } from "@rbx/foundation-ui";
import type { SduiFoundationIconClass } from "../../foundation/sduiFoundationIcons";
import { toFeedbackBannerSeverity } from "../../utils/foundationEnums";
import type { SduiRendererInjectedProps, SduiResolvedAction } from "../../types";
import { renderBannerActions, type SduiBannerAction } from "./renderUtils";

export type SduiFeedbackBannerProps = SduiRendererInjectedProps & {
  severity?: string;
  title?: string;
  description?: string;
  actions?: SduiBannerAction[];
  onClose?: SduiResolvedAction;
  icon?: SduiFoundationIconClass;
  closeButtonAriaLabel?: string;
};

/**
 * SDUI wrapper around Foundation FeedbackBanner component.
 * Uses `layout="Stacked"` and does not expose `variant` or `showIcon` for Lua parity.
 */
export function SduiFeedbackBanner({
  severity,
  title,
  description,
  actions,
  onClose,
  icon,
  closeButtonAriaLabel,
}: SduiFeedbackBannerProps) {
  const resolvedSeverity = toFeedbackBannerSeverity(severity, "Info");

  // infoIconOverride is only valid on the "Info" branch of FeedbackBanner's prop union,
  // so build the discriminated part separately to satisfy the union.
  const severityProps =
    resolvedSeverity === "Info"
      ? {
          severity: "Info" as const,
          infoIconOverride: icon,
        }
      : { severity: resolvedSeverity };

  return (
    <FeedbackBanner
      title={title}
      description={description}
      layout="Stacked"
      actions={renderBannerActions(actions)}
      onDismiss={onClose?.onActivated}
      dismissIconAriaLabel={closeButtonAriaLabel}
      {...severityProps}
    />
  );
}

"use client";
import { Icon, type TIconSize } from "@rbx/foundation-ui";

import type { SduiFoundationIconClass } from "../foundation/sduiFoundationIcons";
import type { SduiRendererInjectedProps } from "../types";

export interface SduiIconProps extends SduiRendererInjectedProps {
  /**
   * Allowlisted Tailwind icon class resolved from `IconSchema.icon`
   * (`FoundationIconConfigProp`) in the binding layer, matching `SduiIconButton`.
   */
  icon?: SduiFoundationIconClass;
  /** Foundation icon size, passed through from the server `size` IconSizeProp. */
  size?: TIconSize;
}

/**
 * SDUI wrapper for the Foundation `Icon` component (`UiComponentType.ICON`).
 *
 * Renders the single Tailwind icon class resolved from `IconSchema.icon`
 * (`FoundationIconConfigProp`) in the binding layer, matching `SduiIconButton`.
 * An unresolved / non-allowlisted icon renders nothing rather than a broken glyph.
 */
export function SduiIcon({ icon, size }: SduiIconProps) {
  if (!icon) return null;

  return <Icon name={icon} size={size} />;
}

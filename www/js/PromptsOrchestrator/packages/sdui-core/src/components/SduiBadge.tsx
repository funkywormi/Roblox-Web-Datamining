import React from "react";
import { Badge } from "@rbx/foundation-ui";
import type { TBadgeShape, TBadgeSize, TBadgeVariant } from "@rbx/foundation-ui";
import type { SduiFoundationIconClass } from "../foundation/sduiFoundationIcons";
import type { SduiRendererInjectedProps } from "../types";

export interface SduiBadgeProps extends SduiRendererInjectedProps {
  text?: string;
  /** Allowlisted Tailwind icon class resolved from `BadgeSchema.foundation_icon`. */
  foundationIcon?: SduiFoundationIconClass;
  variant?: TBadgeVariant;
  size?: TBadgeSize;
  shape?: TBadgeShape;
}

export function SduiBadge({
  text,
  foundationIcon,
  variant,
  size,
  shape,
}: SduiBadgeProps): React.JSX.Element {
  return <Badge label={text} icon={foundationIcon} variant={variant} size={size} shape={shape} />;
}

export default SduiBadge;

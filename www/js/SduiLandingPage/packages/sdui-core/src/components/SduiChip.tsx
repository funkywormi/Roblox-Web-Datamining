"use client";
import React, { useCallback } from "react";
import { Chip } from "@rbx/foundation-ui";
import type { TChipSize } from "@rbx/foundation-ui";
import { buildPositionAndAnchorPointCss } from "../utils/valueToCss";
import type {
  SduiDim2,
  SduiRendererInjectedProps,
  SduiResolvedAction,
  SduiVector2,
} from "../types";

export type SduiChipProps = SduiRendererInjectedProps & {
  text?: string;
  onActivated?: SduiResolvedAction;
  isChecked?: boolean;
  isDisabled?: boolean;
  size?: TChipSize;
  anchorPoint?: SduiVector2;
  position?: SduiDim2;
};

/**
 * SDUI wrapper around Foundation `Chip`, mirroring lua `SduiSharedContent.SduiChip`.
 *
 * Icon/accessory props (`leading`, `trailing`, legacy `*IconName` fields) are not
 * wired on web yet. See lua `SduiChip.lua` when a surface needs them.
 */
export function SduiChip({
  text,
  onActivated,
  isChecked = false,
  isDisabled = false,
  size,
  anchorPoint,
  position,
}: SduiChipProps): React.JSX.Element {
  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      onActivated?.onActivated({ isChecked });
    },
    [onActivated],
  );
  const layoutStyle = buildPositionAndAnchorPointCss(position, anchorPoint);

  return (
    <Chip
      text={text ?? ""}
      isChecked={isChecked}
      isDisabled={isDisabled}
      size={size}
      style={layoutStyle}
      onCheckedChange={handleCheckedChange}
    />
  );
}

export default SduiChip;

import React from "react";
import type { SduiDim2, SduiRendererInjectedProps, SduiTokenOrLiteral } from "../../types";
import { getLayeredContainerStyles } from "./layeredContainerStyleUtils";

export interface SduiLayeredContainerProps extends SduiRendererInjectedProps {
  backgroundComponent?: React.ReactNode;
  foregroundComponent?: React.ReactNode;
  classNames?: string;
  size?: SduiDim2;
  foregroundMaxWidth?: SduiTokenOrLiteral;
  foregroundHorizontalPadding?: SduiTokenOrLiteral;
  foregroundTopPadding?: SduiTokenOrLiteral;
  foregroundBottomPadding?: SduiTokenOrLiteral;
}

/**
 * Generic two-layer container. The foreground remains in normal flow and
 * determines intrinsic size; the background fills those resolved bounds.
 *
 * Horizontal padding is applied outside `foregroundMaxWidth` (same pattern as
 * PageHeader) so wide viewports keep the full max-width content column.
 */
export function SduiLayeredContainer({
  backgroundComponent,
  foregroundComponent,
  classNames,
  size,
  foregroundMaxWidth,
  foregroundHorizontalPadding,
  foregroundTopPadding,
  foregroundBottomPadding,
}: SduiLayeredContainerProps) {
  const { containerStyles, backgroundStyles, foregroundStyles, foregroundContentStyles } =
    getLayeredContainerStyles({
      size,
      classNames,
      foregroundMaxWidth,
      foregroundHorizontalPadding,
      foregroundTopPadding,
      foregroundBottomPadding,
    });

  return (
    <div {...containerStyles} data-testid="sdui-layered-container">
      <div aria-hidden="true" {...backgroundStyles} data-testid="sdui-layered-container-background">
        {backgroundComponent}
      </div>
      <div {...foregroundStyles} data-testid="sdui-layered-container-foreground">
        <div {...foregroundContentStyles} data-testid="sdui-layered-container-foreground-content">
          {foregroundComponent}
        </div>
      </div>
    </div>
  );
}

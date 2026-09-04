"use client";
import React from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { SlotOverlay } from "@rbx/discovery-sdui-components";
import {
  SduiErrorName,
  type SduiRendererInjectedProps,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { resolveFoundationNumberToken } from "../utils/resolveFoundationNumberToken";

export interface SduiSlotOverlayProps extends SduiRendererInjectedProps {
  topLeftSlot?: React.ReactNode;
  topMiddleSlot?: React.ReactNode;
  topRightSlot?: React.ReactNode;
  centerLeftSlot?: React.ReactNode;
  centerMiddleSlot?: React.ReactNode;
  centerRightSlot?: React.ReactNode;
  bottomLeftSlot?: React.ReactNode;
  bottomMiddleSlot?: React.ReactNode;
  bottomRightSlot?: React.ReactNode;
  padding?: SduiTokenOrLiteral;
  children?: React.ReactNode;
}

export function SduiSlotOverlay({
  topLeftSlot,
  topMiddleSlot,
  topRightSlot,
  centerLeftSlot,
  centerMiddleSlot,
  centerRightSlot,
  bottomLeftSlot,
  bottomMiddleSlot,
  bottomRightSlot,
  padding,
  children,
}: SduiSlotOverlayProps): React.JSX.Element {
  const tokens = useTokens();
  const { errorReporter, pageContext } = useSduiServices();

  return (
    <SlotOverlay
      topLeftSlot={topLeftSlot}
      topMiddleSlot={topMiddleSlot}
      topRightSlot={topRightSlot}
      centerLeftSlot={centerLeftSlot}
      centerMiddleSlot={centerMiddleSlot}
      centerRightSlot={centerRightSlot}
      bottomLeftSlot={bottomLeftSlot}
      bottomMiddleSlot={bottomMiddleSlot}
      bottomRightSlot={bottomRightSlot}
      padding={resolveFoundationNumberToken(padding, tokens, (tokenPath, detail) => {
        errorReporter.reportSduiError(
          SduiErrorName.TokenBindingFailed,
          `Failed to resolve SlotOverlay padding token "${tokenPath}": ${detail}`,
          pageContext,
          { propName: "padding", name: "SlotOverlay" },
        );
      })}
    >
      {children}
    </SlotOverlay>
  );
}

export default SduiSlotOverlay;

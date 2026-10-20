"use client";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipTrigger,
  tooltipAligns,
  tooltipSides,
  type TTooltipAlign,
  type TTooltipSide,
} from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps } from "@rbx/sdui-core";

const DEFAULT_SIDE: TTooltipSide = "right";
const DEFAULT_ALIGN: TTooltipAlign = "start";

export type SduiTooltipProps = SduiRendererInjectedProps & {
  title?: string;
  text?: string;
  /** "Top" | "Bottom" | "Left" | "Right". Default Right. */
  side?: string;
  /** "Start" | "Center" | "End". Default Start. */
  align?: string;
  /** Trigger element. Tooltip with no anchor renders nothing. */
  anchor?: ReactNode;
};

function resolveSide(side: string | undefined): TTooltipSide {
  return tooltipSides.find(candidate => candidate === side?.toLowerCase()) ?? DEFAULT_SIDE;
}

function resolveAlign(align: string | undefined): TTooltipAlign {
  return tooltipAligns.find(candidate => candidate === align?.toLowerCase()) ?? DEFAULT_ALIGN;
}

function getPosition(
  side: string | undefined,
  align: string | undefined,
): `${TTooltipSide}-${TTooltipAlign}` {
  return `${resolveSide(side)}-${resolveAlign(align)}`;
}

export function SduiTooltip({ title, text, side, align, anchor }: SduiTooltipProps) {
  if (anchor == null) {
    return null;
  }

  return (
    <Tooltip
      position={getPosition(side, align)}
      title={title}
      description={text}
      delayDurationMs={0}
      hasBeak={false}
    >
      <TooltipTrigger asChild>
        {/* The SDUI renderer does not forward Radix's trigger props or ref to the
         * rendered anchor, so Radix needs a measurable DOM wrapper. This means
         * aria-describedby lands on the wrapper rather than the focused anchor.
         * TODO: A long-term solution is needed to forward trigger props and refs
         * through the SDUI renderer.
         * pointer-events-auto: game tiles set pointer-events: none on the footer
         * and only restore it for links and buttons. This span is the hover target. */}
        <span className="pointer-events-auto" data-testid="sdui-tooltip-trigger">
          {anchor}
        </span>
      </TooltipTrigger>
    </Tooltip>
  );
}

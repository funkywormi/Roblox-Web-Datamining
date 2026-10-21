"use client";
import React, { useState } from "react";
import { IconButton, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import type { SduiResolvedAction } from "@rbx/sdui-core";
import { SduiSectionHeader, type SduiSectionHeaderProps } from "@rbx/sdui-common";
import "../../../../css/gameCarousel/_tooltip.scss";

export type DiscoverySduiSectionHeaderProps = SduiSectionHeaderProps & {
  /** Tooltip body; when set (and iconComponent is not), renders an info icon with a tooltip. */
  infoText?: string;
  /** Accepted from shared templates; stripped before rendering (see component body). */
  onInfoIconActivated?: SduiResolvedAction;
};

export function DiscoverySduiSectionHeader(
  props: DiscoverySduiSectionHeaderProps,
): React.JSX.Element {
  const {
    infoText,
    onInfoIconActivated: _onInfoIconActivated,
    iconComponent,
    ...sectionHeaderProps
  } = props;
  // Controlled so a tap toggles it: Radix ignores touch and closes on click.
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // FUI Tooltip, not GamesInfoTooltip: core-ui's Tooltip (react-bootstrap) breaks on React 19.
  const resolvedIconComponent =
    iconComponent ??
    (infoText != null && infoText !== "" ? (
      <Tooltip
        position="left-center"
        title={null}
        description={infoText}
        ariaLabel={infoText}
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
      >
        <TooltipTrigger asChild>
          <IconButton
            icon="icon-regular-circle-i"
            size="Small"
            variant="Utility"
            isCircular
            ariaLabel={infoText}
            className="info-tooltip-container icon-centered"
            data-testid="info-tooltip-icon"
            onClick={() => setTooltipOpen(prev => !prev)}
          />
        </TooltipTrigger>
      </Tooltip>
    ) : undefined);

  return <SduiSectionHeader {...sectionHeaderProps} iconComponent={resolvedIconComponent} />;
}

export default DiscoverySduiSectionHeader;

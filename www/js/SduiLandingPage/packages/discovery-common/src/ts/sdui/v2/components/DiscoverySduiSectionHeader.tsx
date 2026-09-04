"use client";
import React from "react";
import {
  SduiSectionHeader,
  type SduiSectionHeaderProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import GamesInfoTooltip from "../../../common/components/GamesInfoTooltip";
import "../../../../css/gameCarousel/_tooltip.scss";

export type DiscoverySduiSectionHeaderProps = SduiSectionHeaderProps & {
  /** Tooltip body; when set (and iconComponent is not), renders GamesInfoTooltip. */
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

  const resolvedIconComponent =
    iconComponent ??
    (infoText != null && infoText !== "" ? (
      <GamesInfoTooltip tooltipText={infoText} placement="left" centerIcon />
    ) : undefined);

  return <SduiSectionHeader {...sectionHeaderProps} iconComponent={resolvedIconComponent} />;
}

export default DiscoverySduiSectionHeader;

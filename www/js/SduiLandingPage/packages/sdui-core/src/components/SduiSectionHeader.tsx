"use client";
import { type ReactNode } from "react";
import { clsx } from "clsx";
import {
  SduiTokenOrLiteral,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "../types";
import { buildFoundationTokenCss } from "../utils/foundationToCss";
import { buildSduiNumericStyle, getSduiToken } from "../utils/styleValue";
import { SduiTextIconRow } from "./SduiTextIconRow";
import { ActionWrapper } from "./primitives/ActionWrapper";
import { SDUI_SECTION_HEADER_DEFAULTS } from "../consts/defaults";

export interface SduiSectionHeaderProps extends SduiRendererInjectedProps {
  // TODO: Support onSubtitleActivated
  subtitleText?: string;
  titleText?: string;
  /** Renders the title as a semantic heading (e.g. "h1"). */
  titleHeadingLevel?: string;
  /** Renders the subtitle as a semantic heading. */
  subtitleHeadingLevel?: string;
  verticalGap?: SduiTokenOrLiteral;
  onTitleActivated?: SduiResolvedAction;
  titleIcon?: string;
  titleIconWidth?: number;
  /** Gap between title text and title icon. Has no effect if titleIcon is not provided. */
  titleGap?: SduiTokenOrLiteral;
  /** Optional right-side slot (e.g. info tooltip). */
  iconComponent?: ReactNode;
}

/** Matches Lua: hide only when nil or exact "". Whitespace-only is real content. */
function hasSubtitleText(subtitleText: string | undefined): subtitleText is string {
  return subtitleText != null && subtitleText !== "";
}

export function SduiSectionHeader({
  subtitleText,
  titleText,
  titleHeadingLevel,
  subtitleHeadingLevel,
  verticalGap,
  onTitleActivated,
  titleIcon,
  titleIconWidth,
  titleGap,
  iconComponent,
}: SduiSectionHeaderProps) {
  const verticalGapToken =
    verticalGap == null ? SDUI_SECTION_HEADER_DEFAULTS.verticalGap : getSduiToken(verticalGap);

  const titleSubtitleContainerClassName = clsx(
    "flex",
    "min-w-0",
    "flex-1",
    "w-full",
    "flex-col",
    "items-start",
    buildFoundationTokenCss(verticalGapToken, "gap"),
  );
  const titleSubtitleContainerStyle = buildSduiNumericStyle(verticalGap, px => ({ gap: px }));

  const titleRow =
    titleText != null ? (
      <SduiTextIconRow
        text={titleText}
        textColor={SDUI_SECTION_HEADER_DEFAULTS.titleColor}
        fontStyle={SDUI_SECTION_HEADER_DEFAULTS.titleFontStyle}
        textHeadingLevel={titleHeadingLevel}
        icon={titleIcon}
        iconWidth={titleIconWidth}
        gap={titleGap}
      />
    ) : null;

  const subtitleRow = hasSubtitleText(subtitleText) ? (
    <SduiTextIconRow
      text={subtitleText}
      textColor={SDUI_SECTION_HEADER_DEFAULTS.subtitleColor}
      fontStyle={SDUI_SECTION_HEADER_DEFAULTS.subtitleFontStyle}
      textHeadingLevel={subtitleHeadingLevel}
    />
  ) : null;

  return (
    <div data-testid="section-header" className="relative flex w-full items-center justify-between">
      <div data-testid="section-header-title-subtitle-container" className="min-w-0 flex-1 w-full">
        <ActionWrapper
          href={onTitleActivated?.href}
          clientNavigation={onTitleActivated?.clientNavigation}
          onClick={onTitleActivated?.onActivated}
          ariaLabel={onTitleActivated != null ? titleText : undefined}
          className={titleSubtitleContainerClassName}
          style={titleSubtitleContainerStyle}
        >
          {titleRow}
          {subtitleRow}
        </ActionWrapper>
      </div>
      {iconComponent}
    </div>
  );
}

"use client";
import type React from "react";
import { clsx } from "clsx";
import {
  buildFoundationTokenCss,
  buildUIFlexModeCss,
  getSduiNumeric,
  getSduiToken,
  parseUIFlexMode,
  toHtmlElement,
  type SduiResolvedAction,
  type SduiRendererInjectedProps,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";
import { SDUI_TILE_FOOTER_DEFAULTS } from "../../consts/defaults";
import { ActionWrapper } from "../primitives/ActionWrapper";
import { renderRobloxGlyphText } from "../primitives/RobloxGlyphText";

export interface SduiTileFooterProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining TileFooter schema features
  sectionGap?: SduiTokenOrLiteral;
  textIconGap?: SduiTokenOrLiteral;
  iconWidth?: SduiTokenOrLiteral;
  fontStyle?: string;
  leftIcon?: string;
  leftIconComponent?: React.ReactNode;
  leftText?: string;
  leftTextFlexMode?: string;
  onActivated?: SduiResolvedAction;
  rightIcon?: string;
  rightTextFlexMode?: string;
  rightIconComponent?: React.ReactNode;
  rightText?: string;
  textColor?: string;
  leftHeadingLevel?: string;
  rightHeadingLevel?: string;
}

/**
 * Isomorphic tile footer component.
 */
export function SduiTileFooter({
  sectionGap,
  textIconGap,
  iconWidth,
  fontStyle = SDUI_TILE_FOOTER_DEFAULTS.fontStyle,
  leftIcon,
  leftIconComponent,
  leftText = "",
  leftTextFlexMode,
  onActivated,
  rightIcon,
  rightIconComponent,
  rightText,
  rightTextFlexMode,
  textColor = SDUI_TILE_FOOTER_DEFAULTS.textColor,
  leftHeadingLevel,
  rightHeadingLevel,
}: SduiTileFooterProps) {
  const textColorClassName = buildFoundationTokenCss(textColor, "content") ?? textColor;
  const textClassName = clsx(
    "height-full",
    "width-full",
    "text-truncate-end",
    buildFoundationTokenCss(fontStyle) ?? fontStyle,
    textColorClassName,
  );
  const textStyle = { padding: 0 };

  const iconWidthToken = getSduiToken(iconWidth);
  const iconWidthPx = getSduiNumeric(iconWidth);
  const iconClassName = clsx(
    "shrink-0",
    buildFoundationTokenCss(iconWidthToken, "width"),
    buildFoundationTokenCss(iconWidthToken, "height"),
  );
  const iconStyle = {
    ...(!iconWidthToken && { width: iconWidthPx, height: iconWidthPx }),
    flexShrink: 0,
  };

  const textIconGapToken = getSduiToken(textIconGap);
  const textIconGapPx = getSduiNumeric(textIconGap);
  const textIconGapClassName = buildFoundationTokenCss(textIconGapToken, "gap");

  const sectionGapToken = getSduiToken(sectionGap);
  const sectionGapPx = getSduiNumeric(sectionGap);
  const sectionGapClassName = buildFoundationTokenCss(sectionGapToken, "gap");

  const LeftTextElement = toHtmlElement(leftHeadingLevel);
  const RightTextElement = toHtmlElement(rightHeadingLevel);
  const leftIconNode =
    leftIconComponent ??
    (leftIcon && (
      <span
        className={clsx(leftIcon, iconClassName)}
        aria-hidden="true"
        data-testid="icon-component"
        style={iconStyle}
      />
    ));
  const rightIconNode =
    rightIconComponent ??
    (rightIcon && (
      <span
        className={clsx(rightIcon, iconClassName)}
        aria-hidden="true"
        data-testid="icon-component"
        style={iconStyle}
      />
    ));

  const parsedLeftFlexMode = parseUIFlexMode(leftTextFlexMode) ?? "none";
  const leftFlexClassName = buildUIFlexModeCss(parsedLeftFlexMode);
  const leftSection = (
    <div
      className={clsx(
        "flex",
        "flex-row",
        "items-center",
        "min-width-0",
        "max-width-full",
        leftFlexClassName,
        textIconGapClassName,
        textColorClassName,
      )}
      data-testid="tile-footer-left"
      style={{ ...(textIconGapPx != null ? { gap: textIconGapPx } : {}) }}
    >
      {leftIconNode}
      <LeftTextElement data-sdui-text="true" className={textClassName} style={textStyle}>
        {renderRobloxGlyphText(leftText)}
      </LeftTextElement>
    </div>
  );

  const parsedRightFlexMode = parseUIFlexMode(rightTextFlexMode) ?? "shrink";
  const rightFlexClassName = buildUIFlexModeCss(parsedRightFlexMode);
  const rightSection =
    rightText != null || rightIcon != null || rightIconComponent != null ? (
      <div
        className={clsx(
          "flex",
          "flex-row",
          "items-center",
          "min-width-0",
          "max-width-full",
          rightFlexClassName,
          textIconGapClassName,
          textColorClassName,
        )}
        data-testid="tile-footer-right"
        style={{ ...(textIconGapPx != null ? { gap: textIconGapPx } : {}) }}
      >
        {rightIconNode}
        {rightText && (
          <RightTextElement data-sdui-text="true" className={textClassName} style={textStyle}>
            {renderRobloxGlyphText(rightText)}
          </RightTextElement>
        )}
      </div>
    ) : null;

  const containerClassName = clsx(
    "flex",
    "flex-row",
    "items-center",
    "width-full",
    "stroke-none",
    "bg-none",
    "padding-none",
    "margin-none",
    "text-no-wrap",
    "clip",
    sectionGapClassName,
  );

  return (
    <ActionWrapper
      href={onActivated?.href}
      clientNavigation={onActivated?.clientNavigation}
      onClick={onActivated?.onActivated}
      className={containerClassName}
      style={{ ...(sectionGapPx != null ? { gap: sectionGapPx } : {}) }}
    >
      {leftSection}
      {rightSection}
    </ActionWrapper>
  );
}

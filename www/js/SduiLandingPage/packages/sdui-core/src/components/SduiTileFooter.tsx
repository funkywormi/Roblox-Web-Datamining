"use client";
import type React from "react";
import { clsx } from "clsx";
import { type SduiRendererInjectedProps, type SduiTokenOrLiteral } from "../types";
import { buildFoundationTokenCss } from "../utils/foundationToCss";
import { toHtmlElement } from "../utils/htmlElement";
import { getSduiNumeric, getSduiToken } from "../utils/styleValue";
import { SDUI_TILE_FOOTER_DEFAULTS } from "../consts/defaults";

export interface SduiTileFooterProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining TileFooter schema features
  sectionGap?: SduiTokenOrLiteral;
  textIconGap?: SduiTokenOrLiteral;
  iconWidth?: SduiTokenOrLiteral;
  fontStyle?: string;
  leftIcon?: string;
  leftIconComponent?: React.ReactNode;
  leftText?: string;
  rightIcon?: string;
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
  rightIcon,
  rightIconComponent,
  rightText,
  textColor = SDUI_TILE_FOOTER_DEFAULTS.textColor,
  leftHeadingLevel,
  rightHeadingLevel,
}: SduiTileFooterProps) {
  const textClassName = clsx(
    "h-full",
    "w-full",
    "truncate",
    buildFoundationTokenCss(fontStyle) ?? fontStyle,
    buildFoundationTokenCss(textColor, "content") ?? textColor,
  );
  const textStyle = { padding: 0 };

  const iconWidthToken = getSduiToken(iconWidth);
  const iconWidthPx = getSduiNumeric(iconWidth);
  const iconClassName = clsx(
    "flex-shrink-0",
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

  const leftSection = (
    <div
      className={clsx(
        "flex",
        "flex-row",
        "items-center",
        "min-w-0",
        "flex-shrink-0",
        "w-fit",
        "max-w-full",
        textIconGapClassName,
      )}
      style={{ ...(textIconGapPx != null ? { gap: textIconGapPx } : {}) }}
    >
      {leftIconNode}
      <LeftTextElement data-sdui-text="true" className={textClassName} style={textStyle}>
        {leftText}
      </LeftTextElement>
    </div>
  );

  const rightSection =
    rightText != null || rightIcon != null || rightIconComponent != null ? (
      <div
        className={clsx(
          "flex",
          "flex-row",
          "items-center",
          "min-w-0",
          "flex-shrink",
          textIconGapClassName,
        )}
        style={{ ...(textIconGapPx != null ? { gap: textIconGapPx } : {}) }}
      >
        {rightIconNode}
        {rightText && (
          <RightTextElement data-sdui-text="true" className={textClassName} style={textStyle}>
            {rightText}
          </RightTextElement>
        )}
      </div>
    ) : null;

  const containerClassName = clsx(
    "flex",
    "flex-row",
    "items-center",
    "w-full",
    "border-0",
    "bg-transparent",
    "p-0",
    "m-0",
    "whitespace-nowrap",
    "overflow-hidden",
    sectionGapClassName,
  );

  return (
    <div
      className={containerClassName}
      style={{ ...(sectionGapPx != null ? { gap: sectionGapPx } : {}) }}
      aria-label={leftText}
    >
      {leftSection}
      {rightSection}
    </div>
  );
}

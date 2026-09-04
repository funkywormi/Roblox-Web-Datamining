"use client";
import { useMemo, type CSSProperties } from "react";
import { clsx } from "clsx";
import domPurify from "dompurify";
import {
  buildFoundationTokenCss,
  buildPositionAndAnchorPointCss,
  buildSizeCss,
  toHtmlElement,
  type SduiAutomaticSize,
  type SduiDim2,
  type SduiRendererInjectedProps,
  type SduiVector2,
} from "@rbx/sdui-core";

const DOM_PURIFY_CONFIG = {
  ALLOWED_TAGS: ["em", "i", "strong", "b", "u", "a", "br"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

export interface SduiTextProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining Text schema features
  anchorPoint?: SduiVector2;
  position?: SduiDim2;
  size?: SduiDim2;
  text?: string;
  fontStyle?: string;
  automaticSize?: SduiAutomaticSize;
  textStyle?: string;
  isRenderedText?: boolean;
  headingLevel?: string;
  fontFamily?: string;
  fontWeight?: CSSProperties["fontWeight"];
}

/**
 * Client text component. Renders a block of text with optional HTML
 * rendering.
 */
export function SduiText({
  anchorPoint,
  position,
  size,
  text = "",
  fontStyle,
  automaticSize,
  textStyle,
  isRenderedText,
  headingLevel,
  fontFamily,
  fontWeight,
}: SduiTextProps) {
  const Element = toHtmlElement(headingLevel);

  const positionAndAnchorPointCss = buildPositionAndAnchorPointCss(position, anchorPoint);
  const sizeCss = buildSizeCss(size, automaticSize);

  const style: CSSProperties = {
    wordWrap: "break-word",
    whiteSpace: "pre-line",
    fontFamily,
    fontWeight,
    ...positionAndAnchorPointCss,
    ...sizeCss,
  };

  const className = clsx(
    "text-truncate-end",
    buildFoundationTokenCss(fontStyle),
    buildFoundationTokenCss(textStyle, "content"),
  );

  const sanitizedHtml = useMemo(
    () => (isRenderedText ? domPurify.sanitize(text, DOM_PURIFY_CONFIG) : undefined),
    [text, isRenderedText],
  );

  if (sanitizedHtml != null) {
    return (
      <Element
        data-testid="sdui-text"
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return (
    <Element data-testid="sdui-text" className={className} style={style}>
      {text}
    </Element>
  );
}

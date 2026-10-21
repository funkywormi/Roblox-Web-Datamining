"use client";
import { useMemo, type CSSProperties } from "react";
import { clsx } from "clsx";
import {
  buildFoundationTokenCss,
  buildPositionAndAnchorPointCss,
  buildSizeCss,
  buildTextTruncateCss,
  buildTextXAlignmentCss,
  buildTextYAlignmentCss,
  parseTextTruncate,
  parseTextXAlignment,
  parseTextYAlignment,
  toHtmlElement,
  type SduiAutomaticSize,
  type SduiDim2,
  type SduiRendererInjectedProps,
  type SduiVector2,
} from "@rbx/sdui-core";
import { renderRobloxGlyphText } from "@rbx/sdui-common";
import { renderSanitizedRichText } from "./sanitizedRichText";

function textTruncateClass(mode: ReturnType<typeof parseTextTruncate>): string {
  return mode == null ? "text-truncate-end" : buildTextTruncateCss(mode);
}

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
  textWrapped?: boolean;
  textTruncate?: string;
  textXAlignment?: string;
  textYAlignment?: string;
  /** Web-only class names from `TextSchema.WebProps.class_names`. App `tag` is ignored. */
  classNames?: string;
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
  textWrapped,
  textTruncate,
  textXAlignment,
  textYAlignment,
  classNames,
}: SduiTextProps) {
  const Element = toHtmlElement(headingLevel);

  const positionAndAnchorPointCss = buildPositionAndAnchorPointCss(position, anchorPoint);
  const sizeCss = buildSizeCss(size, automaticSize);
  const truncateMode = parseTextTruncate(textTruncate);
  const truncateClass = textTruncateClass(truncateMode);
  const textXAlignmentMode = parseTextXAlignment(textXAlignment);
  const textYAlignmentMode = parseTextYAlignment(textYAlignment);
  const needsTextBox =
    (truncateMode != null && truncateMode !== "none") ||
    textXAlignmentMode != null ||
    textYAlignmentMode != null;

  const style: CSSProperties = {
    wordWrap: "break-word",
    whiteSpace: textWrapped === false ? "nowrap" : "pre-line",
    fontFamily,
    fontWeight,
    ...positionAndAnchorPointCss,
    ...sizeCss,
  };

  // In order for truncation and x-alignment to work correctly for inline elements,
  // we use inline-flex display and a bounded width.
  // We also use the flex properties to correctly y-align text inside the entire box.
  const parentClassName = clsx(
    needsTextBox && "inline-flex max-width-full",
    textYAlignmentMode != null && buildTextYAlignmentCss(textYAlignmentMode),
    buildFoundationTokenCss(fontStyle),
    buildFoundationTokenCss(textStyle, "content"),
    classNames,
  );
  const contentClassName = clsx(
    needsTextBox && "width-full min-width-0",
    truncateClass,
    textXAlignmentMode != null && buildTextXAlignmentCss(textXAlignmentMode),
  );

  const content = useMemo(
    () => (isRenderedText ? renderSanitizedRichText(text) : renderRobloxGlyphText(text)),
    [text, isRenderedText],
  );

  return (
    <Element data-testid="sdui-text" className={parentClassName} style={style}>
      <span className={contentClassName}>{content}</span>
    </Element>
  );
}

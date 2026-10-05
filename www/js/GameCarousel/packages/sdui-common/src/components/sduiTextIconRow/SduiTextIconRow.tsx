"use client";
import { clsx } from "clsx";
import {
  buildFoundationTokenCss,
  buildSduiNumericStyle,
  getSduiToken,
  toHtmlElement,
  type SduiRendererInjectedProps,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";

export interface SduiTextIconRowProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining TextIconRow schema features
  text?: string;
  textColor?: string;
  fontStyle?: string;
  textHeadingLevel?: string;
  /** Gap between text and icon. Has no effect if icon is not provided. */
  gap?: SduiTokenOrLiteral;
  /** Class name of icon to render (optional). */
  icon?: string;
  iconWidth?: number;
}

export function SduiTextIconRow({
  text,
  textColor,
  fontStyle,
  textHeadingLevel,
  gap,
  icon,
  iconWidth,
}: SduiTextIconRowProps) {
  const TextElement = toHtmlElement(textHeadingLevel);
  const gapToken = getSduiToken(gap);
  const resolvedIconWidth = iconWidth ?? 16;

  return (
    <div
      data-testid="text-icon-row"
      className={clsx(
        "inline-flex width-full items-center stroke-none bg-none padding-none margin-none",
        icon != null && buildFoundationTokenCss(gapToken, "gap"),
      )}
      style={icon != null ? buildSduiNumericStyle(gap, px => ({ gap: px })) : {}}
      aria-label={text}
    >
      <TextElement
        data-sdui-text="true"
        data-testid="text-icon-row-text"
        className={clsx(
          "min-width-0",
          "shrink",
          "text-truncate-end",
          "text-no-wrap",
          buildFoundationTokenCss(fontStyle) ?? fontStyle,
          buildFoundationTokenCss(textColor, "content") ?? textColor,
        )}
        style={{ padding: 0 }}
      >
        {text}
      </TextElement>
      {icon != null ? (
        <span
          className={clsx(icon, "shrink-0")}
          aria-hidden="true"
          data-testid="icon-component"
          style={{
            width: resolvedIconWidth,
            height: resolvedIconWidth,
            flexShrink: 0,
          }}
        />
      ) : null}
    </div>
  );
}

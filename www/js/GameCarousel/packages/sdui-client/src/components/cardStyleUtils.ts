import { clsx } from "clsx";
import type { CSSProperties } from "react";
import {
  buildFoundationColorCssVar,
  buildSduiTokenClass,
  getSduiNumeric,
  getSduiToken,
  resolveFoundationRadiusClass,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";

interface GetCardStylesParams {
  cornerRadius?: SduiTokenOrLiteral | null;
  backgroundStyle?: SduiTokenOrLiteral | null;
  descriptionMaxLines?: number;
}

function resolveBackgroundColor(
  backgroundStyle: SduiTokenOrLiteral | null | undefined,
  backgroundTokenClass: string | undefined,
): string | undefined {
  if (backgroundTokenClass != null || backgroundStyle?.kind !== "token") return undefined;
  return buildFoundationColorCssVar(backgroundStyle.value) ?? backgroundStyle.value;
}

export const getCardStyles = ({
  cornerRadius,
  backgroundStyle,
  descriptionMaxLines,
}: GetCardStylesParams) => {
  const backgroundTokenClass = buildSduiTokenClass(backgroundStyle ?? undefined, "background");
  const backgroundColor = resolveBackgroundColor(backgroundStyle, backgroundTokenClass);
  const cornerRadiusClass = resolveFoundationRadiusClass(getSduiToken(cornerRadius ?? undefined));
  const cornerRadiusPx = getSduiNumeric(cornerRadius ?? undefined);

  const descriptionClampStyle: CSSProperties =
    descriptionMaxLines != null && descriptionMaxLines > 0
      ? {
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: descriptionMaxLines,
          WebkitBoxOrient: "vertical",
        }
      : {};

  return {
    containerStyles: {
      className: clsx(
        "flex",
        "flex-row",
        "items-stretch",
        "clip",
        "width-full",
        "height-full",
        "stroke-standard",
        "stroke-default",
        backgroundTokenClass ?? "bg-surface-100",
        cornerRadiusClass ?? (cornerRadiusPx == null ? "radius-medium" : undefined),
      ),
      style: {
        ...(cornerRadiusClass == null && cornerRadiusPx != null
          ? { borderRadius: cornerRadiusPx }
          : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
      } satisfies CSSProperties,
    },
    contentStyles: {
      className: clsx(
        "flex",
        "flex-col",
        "justify-between",
        "grow-1",
        "min-width-0",
        "gap-xsmall",
        "padding-top-large",
        "padding-bottom-large",
        "padding-left-large",
        "padding-right-small",
      ),
    },
    textStackStyles: {
      className: clsx("flex", "flex-col", "gap-xsmall"),
    },
    titleStyles: {
      className: clsx("text-label-large", "content-emphasis", "margin-none"),
      style: {
        overflowWrap: "break-word",
        wordBreak: "normal",
      } satisfies CSSProperties,
    },
    descriptionStyles: {
      className: clsx("text-body-medium", "content-default", "margin-none"),
      style: {
        overflowWrap: "break-word",
        wordBreak: "normal",
        ...descriptionClampStyle,
      } satisfies CSSProperties,
    },
    ctaStyles: {
      className: clsx("flex", "padding-top-medium"),
    },
    imageColumnStyles: {
      className: clsx("relative", "self-stretch", "shrink-0", "width-2500", "clip"),
    },
  };
};

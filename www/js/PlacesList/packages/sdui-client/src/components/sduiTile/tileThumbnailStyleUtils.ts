import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { buildSduiTokenClass, resolveSduiColor, type SduiTokenOrLiteral } from "@rbx/sdui-core";
import { getPaddingStyles, getRadiusStyles } from "./sduiTileStyleUtils";

interface GetTileThumbnailStylesParams {
  cornerRadius?: SduiTokenOrLiteral | null;
  imageAspectRatio?: number;
  imageCornerRadius?: SduiTokenOrLiteral | null;
  imagePadding?: SduiTokenOrLiteral | null;
  isContained?: boolean;
  thumbnailBackgroundStyle?: SduiTokenOrLiteral | null;
  thumbnailPadding?: SduiTokenOrLiteral | null;
}

function normalizeTileAspectRatio(value: number | undefined): number {
  return value != null && Number.isFinite(value) && value > 0 ? value : 1;
}

export const getTileThumbnailStyles = ({
  cornerRadius,
  imageAspectRatio,
  imageCornerRadius,
  imagePadding,
  isContained = false,
  thumbnailBackgroundStyle,
  thumbnailPadding,
}: GetTileThumbnailStylesParams) => {
  const aspectRatio = normalizeTileAspectRatio(imageAspectRatio);
  const cardRadius = getRadiusStyles(cornerRadius, "radius-medium");
  const insetRadius = getRadiusStyles(imageCornerRadius, "radius-circle");
  const imagePaddingStyles = getPaddingStyles(imagePadding);
  const thumbnailPaddingStyles = getPaddingStyles(thumbnailPadding, "paddingX");
  const thumbnailBackgroundClass = buildSduiTokenClass(
    thumbnailBackgroundStyle ?? undefined,
    "background",
  );

  return {
    shellStyles: {
      className: clsx("width-full", "[box-sizing:border-box]", thumbnailPaddingStyles.className),
      style: thumbnailPaddingStyles.style,
    },
    thumbnailStyles: {
      className: clsx(
        "relative",
        "width-full",
        thumbnailBackgroundClass,
        cardRadius.className,
        isContained && "clip",
      ),
      style: {
        paddingBottom: `${100 / aspectRatio}%`,
        backgroundColor:
          thumbnailBackgroundClass == null ? resolveSduiColor(thumbnailBackgroundStyle) : undefined,
        ...cardRadius.style,
      } satisfies CSSProperties,
    },
    imageStyles: {
      className: clsx(
        "sdui-tile-image",
        "absolute",
        "inset-[0px]",
        "width-full",
        "height-full",
        "clip",
        "[box-sizing:border-box]",
        imagePaddingStyles.className,
        cardRadius.className,
      ),
      style: {
        ...imagePaddingStyles.style,
        ...cardRadius.style,
      } satisfies CSSProperties,
    },
    insetImageStyles: {
      className: clsx("width-full", "height-full", "clip", insetRadius.className),
      style: insetRadius.style,
    },
    overlayStyles: {
      className: clsx("sdui-tile-overlay", "absolute", "inset-[0px]"),
    },
  };
};

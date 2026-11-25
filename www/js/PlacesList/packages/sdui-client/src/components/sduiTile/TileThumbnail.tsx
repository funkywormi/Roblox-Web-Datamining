import type { ReactNode } from "react";
import type { SduiTokenOrLiteral } from "@rbx/sdui-core";
import { SduiImage } from "../SduiImage";
import { getTileThumbnailStyles } from "./tileThumbnailStyleUtils";

const THUMBNAIL_SIZE = { xScale: 1, xOffset: 0, yScale: 1, yOffset: 0 };

export interface TileThumbnailProps {
  cornerRadius?: SduiTokenOrLiteral | null;
  image?: string;
  imageAspectRatio?: number;
  imageComponent?: ReactNode;
  imageCornerRadius?: SduiTokenOrLiteral | null;
  imagePadding?: SduiTokenOrLiteral | null;
  isContained?: boolean;
  thumbnailBackgroundStyle?: SduiTokenOrLiteral | null;
  thumbnailOverlayComponent?: ReactNode;
  thumbnailPadding?: SduiTokenOrLiteral | null;
}

/** Aspect-ratio image frame for a tile, including optional inset padding and an overlay. */
export function TileThumbnail({
  cornerRadius,
  image,
  imageAspectRatio,
  imageComponent,
  imageCornerRadius,
  imagePadding,
  isContained = false,
  thumbnailBackgroundStyle,
  thumbnailOverlayComponent,
  thumbnailPadding,
}: TileThumbnailProps) {
  const isInset = imagePadding != null;
  const defaultImage =
    image != null ? <SduiImage image={image} size={THUMBNAIL_SIZE} scaleType="crop" /> : null;
  const imageContent = imageComponent ?? defaultImage;

  const { shellStyles, thumbnailStyles, imageStyles, insetImageStyles, overlayStyles } =
    getTileThumbnailStyles({
      cornerRadius,
      imageAspectRatio,
      imageCornerRadius,
      imagePadding,
      isContained,
      thumbnailBackgroundStyle,
      thumbnailPadding,
    });

  return (
    <div data-testid="sdui-tile-thumbnail-shell" {...shellStyles}>
      <div
        data-testid="sdui-tile-thumbnail"
        data-inset={isInset ? "true" : "false"}
        {...thumbnailStyles}
      >
        <div data-testid="sdui-tile-image" {...imageStyles}>
          {isInset ? (
            <div data-testid="sdui-tile-inset-image" {...insetImageStyles}>
              {imageContent}
            </div>
          ) : (
            imageContent
          )}
        </div>
        {thumbnailOverlayComponent != null && (
          <div data-testid="sdui-tile-overlay" {...overlayStyles}>
            {thumbnailOverlayComponent}
          </div>
        )}
      </div>
    </div>
  );
}

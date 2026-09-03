"use client";

import "./css/sduiImage.css";
import type { CSSProperties, ReactNode } from "react";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import {
  buildFoundationTokenCss,
  buildObjectFitCss,
  buildSizeCss,
  getSduiToken,
  parseImageString,
  type SduiDim2,
  type SduiRendererInjectedProps,
  type SduiScaleType,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";
import { useResolvedImageUrl } from "../assets/useResolvedImageUrl";
import { ImageWithShimmer } from "./primitives/ImageWithShimmer";

/**
 * Maps scaleType directly to a CSS `mask-size` value.
 * - `"fit"` → `"contain"` (preserves aspect ratio, fits within box)
 * - `"stretch"` → `"100% 100%"` (fills box, distorts if needed)
 * - everything else → `"cover"` (preserves aspect ratio, fills box)
 */
function buildMaskSizeCss(
  scaleType: SduiScaleType | undefined,
  aspectRatio: number | undefined,
): string {
  if (scaleType === "fit") return "contain";
  if (scaleType === "stretch") return "100% 100%";
  if (scaleType == null && aspectRatio != null) return "contain";
  return "cover";
}

export interface SduiImageProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining Image schema features
  image?: string;
  size?: SduiDim2;
  aspectRatio?: number;
  /**
   * ImageSchema `scale_type`, already parsed by `ScaleTypeProp`
   * (`stretch` | `slice` | `tile` | `fit` | `crop`).
   * Currently applied on the asset (`rbxassetid`) path only — not Thumbnail2d.
   */
  scaleType?: SduiScaleType;
  /**
   * Foundation color token (e.g. `"Color.Content.Emphasis"`) used to tint
   * monochrome (white-on-transparent) images. The image is rendered as a CSS
   * mask and the token color is applied as the background — this adapts
   * automatically to light/dark theme.
   */
  imageStyle?: SduiTokenOrLiteral | null;
  alt?: string;
}

export function SduiImage({
  image,
  size,
  aspectRatio,
  scaleType,
  imageStyle: imageStyleProp,
  alt = "",
}: SduiImageProps) {
  // parse rbxassetid or rbxthumb
  const parsedImage = image ? parseImageString(image) : null;
  const assetId = parsedImage?.kind === "asset" ? parsedImage.assetId : undefined;
  // TODO: The single asset API is a short-term fix; API selection should eventually be template-driven.
  const { src, status } = useResolvedImageUrl(assetId, true);
  const fillsBox = scaleType != null && aspectRatio == null;
  const tintClass = buildFoundationTokenCss(getSduiToken(imageStyleProp ?? undefined), "content");

  // TODO: Convert image container inline styles to Tailwind classes.
  const imageStyle: CSSProperties = {
    ...(size != null ? buildSizeCss(size) : {}),
    ...(aspectRatio != null
      ? {
          width: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }
      : {}),
    ...(fillsBox
      ? {
          position: "relative",
          overflow: "hidden",
        }
      : {}),
  };

  const innerContainerStyle: CSSProperties | undefined =
    aspectRatio != null
      ? {
          aspectRatio: `${aspectRatio} / 1`,
          minWidth: "100%",
          flex: 1,
          ...(tintClass != null ? { position: "relative" as const } : {}),
        }
      : fillsBox
        ? {
            width: "100%",
            height: "100%",
            ...(tintClass != null ? { position: "relative" as const } : {}),
          }
        : tintClass != null
          ? { position: "relative" as const }
          : undefined;

  const renderImageContainer = (content?: ReactNode) => (
    <div data-testid="sdui-image" style={imageStyle}>
      <div data-testid="sdui-image-container" style={innerContainerStyle}>
        {content}
      </div>
    </div>
  );

  // No image configured: empty container
  if (!image || parsedImage == null) return renderImageContainer();

  // Thumbnail images delegate to Thumbnail2d which owns its own shimmer.
  if (parsedImage.kind === "thumbnail") {
    return renderImageContainer(
      <Thumbnail2d
        type={parsedImage.thumbnail.type}
        targetId={parsedImage.thumbnail.targetId}
        format={ThumbnailFormat.webp}
        size={parsedImage.thumbnail.size}
        containerClass="sdui-thumbnail-image-container"
        altName={alt}
      />,
    );
  }

  // Asset resolution failed: show broken-image icon (matches Thumbnail2d error behavior)
  if (status === "error") return renderImageContainer(<ImageWithShimmer errored />);

  const objectFit =
    scaleType != null ? buildObjectFitCss(scaleType) : aspectRatio != null ? "contain" : undefined;

  return renderImageContainer(
    <ImageWithShimmer
      src={src}
      alt={alt}
      tintClass={tintClass}
      maskSize={tintClass != null ? buildMaskSizeCss(scaleType, aspectRatio) : undefined}
      imgStyle={
        objectFit != null
          ? {
              width: "100%",
              height: "100%",
              objectFit,
            }
          : undefined
      }
    />,
  );
}

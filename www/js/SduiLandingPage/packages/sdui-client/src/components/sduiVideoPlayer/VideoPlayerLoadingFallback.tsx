"use client";

import { useState } from "react";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import {
  buildObjectFitCss,
  parseImageString,
  SduiSkeleton,
  type SduiScaleType,
} from "@rbx/sdui-core";
import { useResolvedImageUrl } from "../../assets/useResolvedImageUrl";
import { ImageWithShimmer } from "../primitives/ImageWithShimmer";
import { getVideoPlayerStyles } from "./videoPlayerStyleUtils";

export interface VideoPlayerLoadingFallbackProps {
  /** ImageStringProp value (`rbxassetid://...` or `rbxthumb://...`). */
  loadingImage?: string;
  scaleType?: SduiScaleType;
  loadingStyles: ReturnType<typeof getVideoPlayerStyles>["loadingStyles"];
  /** When the video has failed, show a broken placeholder if no usable loading image remains. */
  hasFailed?: boolean;
}

function VideoPlayerLoadingFallbackInner({
  loadingImage,
  scaleType,
  loadingStyles,
  hasFailed = false,
}: VideoPlayerLoadingFallbackProps) {
  const parsedImage = loadingImage ? parseImageString(loadingImage) : null;
  const assetId = parsedImage?.kind === "asset" ? parsedImage.assetId : undefined;
  // TODO: The single asset API is a short-term fix; API selection should eventually be template-driven.
  const { src, status } = useResolvedImageUrl(assetId, true);
  const [decodeFailed, setDecodeFailed] = useState(false);

  const objectFit = scaleType != null ? buildObjectFitCss(scaleType) : undefined;
  const imageStyle = objectFit != null ? { objectFit } : undefined;
  const assetImageFailed = parsedImage?.kind === "asset" && (status === "error" || decodeFailed);

  let content = <SduiSkeleton testId="sdui-video-player-loading-skeleton" />;

  if (parsedImage?.kind === "thumbnail") {
    // Thumbnail2d owns its own shimmer / icon-broken states.
    content = (
      <Thumbnail2d
        type={parsedImage.thumbnail.type}
        targetId={parsedImage.thumbnail.targetId}
        format={ThumbnailFormat.webp}
        size={parsedImage.thumbnail.size}
        containerClass="width-full height-full"
      />
    );
  } else if (parsedImage?.kind === "asset" && !assetImageFailed) {
    content = (
      <ImageWithShimmer
        src={src}
        containerClassName="width-full height-full"
        imgClassName="width-full height-full"
        imgStyle={imageStyle}
        onError={() => {
          setDecodeFailed(true);
        }}
      />
    );
  } else if (assetImageFailed || (hasFailed && parsedImage == null)) {
    // Match SduiImage: broken icon when the asset image fails, or when the video
    // failed and there is no usable loading image to keep on screen.
    content = <ImageWithShimmer errored containerClassName="width-full height-full" />;
  }

  return (
    <div {...loadingStyles} data-testid="sdui-video-player-loading">
      {content}
    </div>
  );
}

export function VideoPlayerLoadingFallback(props: VideoPlayerLoadingFallbackProps) {
  // Remount when `loadingImage` changes so decode-failure state resets without an Effect.
  return <VideoPlayerLoadingFallbackInner {...props} key={props.loadingImage ?? ""} />;
}

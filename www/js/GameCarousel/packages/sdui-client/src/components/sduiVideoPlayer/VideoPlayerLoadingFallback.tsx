"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import { buildObjectFitCss, parseImageString, type SduiScaleType } from "@rbx/sdui-core";
import { SduiSkeleton } from "@rbx/sdui-common";
import { useResolvedImageUrl } from "../../assets/useResolvedImageUrl";
import { ImageWithShimmer } from "../primitives/ImageWithShimmer";
import { getVideoPlayerStyles } from "./videoPlayerStyleUtils";
import "../css/sduiVideoPlayer.css";

export interface VideoPlayerLoadingFallbackProps {
  /** ImageStringProp value (`rbxassetid://...` or `rbxthumb://...`). */
  loadingImage?: string;
  scaleType?: SduiScaleType;
  loadingStyles: ReturnType<typeof getVideoPlayerStyles>["loadingStyles"];
  /** When the video has failed, show a broken placeholder if no usable loading image remains. */
  hasFailed?: boolean;
  /**
   * Video playback readiness. The loading image usually decodes well before the video
   * can play, so this keeps the shimmer running for the whole wait instead of ending it
   * when the image lands.
   */
  isReady?: boolean;
}

function VideoPlayerLoadingFallbackInner({
  loadingImage,
  scaleType,
  loadingStyles,
  hasFailed = false,
  isReady = false,
}: VideoPlayerLoadingFallbackProps) {
  const parsedImage = loadingImage ? parseImageString(loadingImage) : null;
  const assetId = parsedImage?.kind === "asset" ? parsedImage.assetId : undefined;
  // TODO: The single asset API is a short-term fix; API selection should eventually be template-driven.
  const { src, status } = useResolvedImageUrl(assetId, true);
  const [decodeFailed, setDecodeFailed] = useState(false);

  // No image to show and nothing has failed yet. SduiSkeleton animates its own equivalent sweep,
  // so this is the one state that takes no shimmer overlay.
  if (parsedImage == null && !hasFailed) {
    return (
      <div {...loadingStyles} data-testid="sdui-video-player-loading">
        <SduiSkeleton testId="sdui-video-player-loading-skeleton" />
      </div>
    );
  }

  const objectFit = scaleType != null ? buildObjectFitCss(scaleType) : undefined;
  const imageStyle = objectFit != null ? { objectFit } : undefined;
  const assetImageFailed = parsedImage?.kind === "asset" && (status === "error" || decodeFailed);
  // Image decode usually finishes before the video can play, so the poster's own shimmer ends
  // long before the wait does. This drives a shimmer overlay that covers the whole wait.
  const keepShimmering = !isReady && !hasFailed;

  // Match SduiImage: broken icon when the asset image fails, or when the video failed and there
  // is no usable loading image to keep on screen.
  let content = <ImageWithShimmer errored containerClassName="width-full height-full" />;

  if (parsedImage?.kind === "thumbnail") {
    content = (
      <Thumbnail2d
        type={parsedImage.thumbnail.type}
        targetId={parsedImage.thumbnail.targetId}
        format={ThumbnailFormat.webp}
        size={parsedImage.thumbnail.size}
        containerClass="sdui-video-poster width-full height-full"
      />
    );
  } else if (parsedImage?.kind === "asset" && !assetImageFailed) {
    content = (
      <ImageWithShimmer
        src={src}
        containerClassName="sdui-video-poster width-full height-full"
        imgClassName="width-full height-full"
        imgStyle={imageStyle}
        onError={() => {
          setDecodeFailed(true);
        }}
      />
    );
  }

  return (
    // `sdui-video-loading` is load-bearing: sduiVideoPlayer.css needs a third class to outweigh
    // @rbx/thumbnails' themed `.dark-theme .thumbnail-2d-container` background.
    <div
      {...loadingStyles}
      className={clsx("sdui-video-loading", loadingStyles.className)}
      data-testid="sdui-video-player-loading"
    >
      {content}
      {/* The poster's own sweep is suppressed, since we want to maintain the shimmering state
      until the video is ready. This sweep runs for the whole wait instead.
      It has to be a sibling element rather than a class on the container: `.shimmer` paints through
      `background-image`, which renders behind an element's own descendants. */}
      {keepShimmering && (
        <span
          data-testid="sdui-video-player-shimmer-overlay"
          className="shimmer absolute inset-[0] pointer-events-none"
        />
      )}
    </div>
  );
}

export function VideoPlayerLoadingFallback(props: VideoPlayerLoadingFallbackProps) {
  // Remount when `loadingImage` changes so decode-failure state resets without an Effect.
  return <VideoPlayerLoadingFallbackInner {...props} key={props.loadingImage ?? ""} />;
}

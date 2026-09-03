"use client";

import { useState, type CSSProperties } from "react";
import { clsx } from "clsx";

interface ImageWithShimmerProps {
  src?: string | null;
  alt?: string;
  imgStyle?: CSSProperties;
  containerClassName?: string;
  imgClassName?: string;
  errored?: boolean; // Show `icon-broken`
  /** Called when the image element fails to load. */
  onError?: () => void;
  /**
   * Foundation Tailwind content class (e.g. `"content-emphasis"`) used to tint
   * monochrome (white-on-transparent) images. When set, the image is rendered
   * as a CSS mask with the token color applied via `currentColor`.
   */
  tintClass?: string;
  /**
   * CSS `mask-size` value for tinted images (e.g. `"contain"`, `"cover"`,
   * `"100% 100%"`). Defaults to `"cover"`.
   */
  maskSize?: string;
}

function ImageWithShimmerInner({
  src,
  alt = "",
  imgStyle,
  containerClassName,
  imgClassName,
  errored = false,
  onError,
  tintClass,
  maskSize = "cover",
}: ImageWithShimmerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const isErrored = errored || isError;
  const isShimmering = !isErrored && (src == null || !isLoaded);

  const containerClass = clsx(
    "thumbnail-2d-container sdui-thumbnail-image-container",
    containerClassName,
    isShimmering && "shimmer",
    isErrored && "icon-broken",
  );

  if (tintClass != null && !isErrored) {
    return (
      <span data-testid="image-shimmer-container" className={containerClass}>
        {src != null && (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className={clsx(imgClassName, !isLoaded && "loading")}
            style={{ width: "100%", height: "100%", opacity: 0, ...imgStyle }}
            onLoad={() => {
              setIsLoaded(true);
            }}
            onError={() => {
              setIsError(true);
              onError?.();
            }}
          />
        )}
        <div
          data-testid="sdui-image-tinted"
          role="img"
          aria-label={alt}
          className={tintClass}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "currentColor",
            maskImage: src ? `url("${src}")` : "none",
            WebkitMaskImage: src ? `url("${src}")` : "none",
            maskSize,
            WebkitMaskSize: maskSize,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      </span>
    );
  }

  return (
    <span data-testid="image-shimmer-container" className={containerClass}>
      {!isErrored && src != null && (
        <img
          data-testid="sdui-image-content"
          src={src}
          alt={alt}
          className={clsx(imgClassName, isLoaded ? undefined : "loading")}
          onLoad={() => {
            setIsLoaded(true);
          }}
          onError={() => {
            setIsError(true);
            onError?.();
          }}
          style={imgStyle}
        />
      )}
    </span>
  );
}

/**
 * Replicates Thumbnail2d's shimmer/load/error states for non-thumbnail images.
 * See workspace/components/thumbnails/src/containers/Thumbnail2d.jsx for the original.
 *
 * CSS classes come from @rbx/core-ui globals: `.shimmer` (animated gradient),
 * `.icon-broken` (SVG placeholder), and `sduiImage.css` for the opacity fade-in.
 */
export function ImageWithShimmer(props: ImageWithShimmerProps) {
  // Remount when `src` changes so load/error state resets without an Effect.
  return <ImageWithShimmerInner {...props} key={props.src ?? ""} />;
}

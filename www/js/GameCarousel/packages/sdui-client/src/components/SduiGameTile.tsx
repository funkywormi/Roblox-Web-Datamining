import React, { isValidElement } from "react";
import { clsx } from "clsx";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import {
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
  type SduiTokenOrLiteral,
  buildFoundationTokenCss,
  getSduiNumeric,
  getSduiToken,
  toHtmlElement,
  parseImageString,
} from "@rbx/sdui-core";
import { ActionWrapper } from "@rbx/sdui-common";
import { useHoverIntent } from "@rbx/sdui-core/client";
import "./css/sduiGameTile.css";
import { SDUI_GAME_TILE_DEFAULTS } from "../consts/defaults";
import { useIsEligibleForVideoPreview } from "../hooks/useIsEligibleForVideoPreview";

export interface SduiGameTileProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining GameTile schema features
  imageAspectRatio?: number;
  titleText?: string;
  image?: string;
  onActivated?: SduiResolvedAction;
  cornerRadius?: SduiTokenOrLiteral;
  titleLines?: number;
  ctaButtonComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  imageComponent?: React.ReactNode;
  videoPlayer?: React.ReactNode;
  thumbnailOverlayComponent?: React.ReactNode;
  titleComponent?: React.ReactNode;
  thumbnailBackgroundStyle?: string;
  titleFont?: string;
  titleHeadingLevel?: string;
  /** Bound from GameTileSchema `universe_id`. The hover preview uses it for eligibility. */
  universeId?: string;
}

/**
 * Client-side game tile. Renders a thumbnail image with title text, an
 * optional footer, and an optional CTA button.
 *
 * Lives in sdui-client (not sdui-core) because it depends on @rbx/thumbnails
 * (Thumbnail2d), which is a browser-only package.
 *
 * Structure:
 *   ActionWrapper      (<a> / <button> / div)
 *     main content     (image | placeholder + video + overlay, then title)
 *     bottom content   (left: footer | right: cta button)
 */
export function SduiGameTile({
  imageAspectRatio = 1,
  titleText,
  image,
  onActivated,
  cornerRadius,
  titleLines = 1,
  ctaButtonComponent,
  footerComponent,
  imageComponent,
  videoPlayer,
  thumbnailOverlayComponent,
  titleComponent,
  thumbnailBackgroundStyle,
  titleFont,
  titleHeadingLevel,
  universeId,
}: SduiGameTileProps) {
  const cornerRadiusPx = getSduiNumeric(cornerRadius);
  const cornerRadiusClass = buildFoundationTokenCss(getSduiToken(cornerRadius));
  const hasActivationHandler = Boolean(onActivated?.onActivated);

  const { isHovered, onHoverStart, onHoverEnd } = useHoverIntent();

  const hasVideo = videoPlayer != null && Boolean(universeId);
  const { isEligibleForVideoPreview, isLoadingEligibility } = useIsEligibleForVideoPreview(
    universeId ?? "",
    hasVideo,
  );
  const showEligibilityShimmer = isHovered && hasVideo && isLoadingEligibility;
  const showEligiblePlayer = isHovered && hasVideo && isEligibleForVideoPreview;

  // image node: prefer passed imageComponent, then thumbnail/img, then placeholder
  const parsedImage = typeof image === "string" ? parseImageString(image) : null;

  const imageNode =
    imageComponent ??
    (parsedImage?.kind === "thumbnail" ? (
      <Thumbnail2d
        type={parsedImage.thumbnail.type}
        targetId={parsedImage.thumbnail.targetId}
        format={ThumbnailFormat.webp}
        size={parsedImage.thumbnail.size}
        containerClass="sdui-thumbnail-image-container"
      />
    ) : isValidElement(image) ? (
      image
    ) : typeof image === "string" ? (
      <img
        src={image}
        alt={titleText ?? ""}
        className={clsx(
          "width-full",
          "height-full",
          "block",
          "[object-fit:cover]",
          cornerRadiusClass,
        )}
        style={!cornerRadiusClass ? { borderRadius: cornerRadiusPx } : undefined}
      />
    ) : (
      <div
        data-testid="sdui-tile-placeholder"
        className={clsx("width-full", "height-full", cornerRadiusClass)}
        style={{
          aspectRatio: String(imageAspectRatio),
          backgroundColor: thumbnailBackgroundStyle ?? "transparent",
          ...(!cornerRadiusClass && { borderRadius: cornerRadiusPx }),
        }}
      />
    ));

  // title node
  const TitleElement = toHtmlElement(titleHeadingLevel, "div");
  const titleNode =
    titleComponent ??
    (titleText ? (
      <TitleElement
        data-sdui-text="true"
        className={clsx(
          "margin-none",
          "padding-none",
          titleLines === 1 && "text-truncate-end text-no-wrap [overflow-wrap:break-word]",
          buildFoundationTokenCss(titleFont ?? SDUI_GAME_TILE_DEFAULTS.titleFont) ??
            titleFont ??
            "text-title-medium",
          buildFoundationTokenCss(SDUI_GAME_TILE_DEFAULTS.titleColor, "content") ??
            "content-emphasis",
        )}
        style={
          titleLines === 1
            ? undefined
            : {
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: titleLines,
                WebkitBoxOrient: "vertical",
              }
        }
      >
        {titleText}
      </TitleElement>
    ) : null);

  return (
    <ActionWrapper
      data-testid="sdui-game-tile"
      className={clsx(
        "flex",
        "flex-col",
        "width-full",
        "height-full",
        "gap-small",
        "justify-between",
        hasActivationHandler && "sdui-game-tile-wrapper",
      )}
      onClick={onActivated?.onActivated}
      href={onActivated?.href}
      ariaLabel={titleText}
      onMouseOver={hasVideo ? onHoverStart : undefined}
      onMouseLeave={hasVideo ? onHoverEnd : undefined}
      onFocus={hasVideo ? onHoverStart : undefined}
      onBlur={hasVideo ? onHoverEnd : undefined}
    >
      <div data-testid="sdui-tile-main-content" className="flex flex-col gap-small">
        {/* thumbnail */}
        <div
          data-testid="sdui-tile-image-container"
          className={clsx(
            "sdui-tile-image-container",
            "relative",
            "width-full",
            "clip",
            cornerRadiusClass,
          )}
          style={{
            aspectRatio: String(imageAspectRatio),
            ...(!cornerRadiusClass && { borderRadius: cornerRadiusPx }),
          }}
        >
          {imageNode}
          {/* The image stays mounted underneath and acts as the poster. */}
          {showEligibilityShimmer || showEligiblePlayer ? (
            <div data-testid="sdui-tile-video-container" className="absolute inset-[0]">
              {showEligibilityShimmer ? (
                <span
                  data-testid="sdui-tile-video-shimmer"
                  className="shimmer absolute inset-[0] pointer-events-none"
                />
              ) : (
                videoPlayer
              )}
            </div>
          ) : null}
          {thumbnailOverlayComponent != null ? (
            <div className="sdui-tile-overlay-container" data-testid="sdui-tile-overlay-container">
              {thumbnailOverlayComponent}
            </div>
          ) : null}
        </div>
        {titleNode}
      </div>

      {/* footer and cta */}
      {footerComponent != null || ctaButtonComponent != null ? (
        <div data-testid="sdui-tile-footer-content" className="flex flex-row gap-xsmall width-full">
          <div className="fill min-width-0 clip flex flex-col justify-center">
            {footerComponent}
          </div>
          {ctaButtonComponent != null && <div className="flex shrink-0">{ctaButtonComponent}</div>}
        </div>
      ) : null}
    </ActionWrapper>
  );
}

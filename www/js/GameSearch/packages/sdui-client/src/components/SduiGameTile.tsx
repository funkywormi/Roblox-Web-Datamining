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
  SUPPORTED_ICON_CLASSES,
} from "@rbx/sdui-core";
import { abbreviateNumber } from "@rbx/core-scripts/format/number";
import { ActionWrapper, renderRobloxGlyphText, SduiTileFooter } from "@rbx/sdui-common";
import { useHoverIntent } from "@rbx/sdui-core/client";
import "./css/sduiGameTile.css";
import { SDUI_GAME_TILE_DEFAULTS } from "../consts/defaults";
import { useIsEligibleForVideoPreview } from "../hooks/useIsEligibleForVideoPreview";

const RATING_ICON_CLASS = SUPPORTED_ICON_CLASSES["icons/status/games/rating_small"];
const PLAYER_COUNT_ICON_CLASS = SUPPORTED_ICON_CLASSES["icons/status/games/people-playing_small"];

// TODO update to use a localized abbreviation function and
// move this to a utils file and export it for use in discovery-common
function formatPlayerCount(playerCount: number): string {
  if (playerCount === -1) {
    return "--";
  }
  return abbreviateNumber(playerCount);
}

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
  isContained?: boolean;
  /**
   * Pixels on the left, right, and bottom of the title and footer.
   * Used only when `isContained` is true. Omitted values use the small padding token.
   */
  containmentPadding?: number;
  /* When true, the tile always renders `footerComponent`. */
  disableDefaultFooterLogic?: boolean;
  /** Display string for the tile footer, such as "92%". */
  ratingText?: string;
  /* Shown on the tile footer when `ratingText` is non-empty. */
  playerCount?: number;
}

/**
 * Client-side game tile. Renders a thumbnail image with title text, an
 * optional footer, and an optional CTA button.
 *
 * Lives in sdui-client (not sdui-core) because it depends on @rbx/thumbnails
 * (Thumbnail2d), which is a browser-only package.
 *
 * Structure:
 *   div.sdui-game-tile
 *     main content: ActionWrapper with thumbnail, plus the title when the tile is not contained
 *     bottom content: title (if contained), rating footer or footerComponent, and the cta
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
  isContained,
  containmentPadding,
  disableDefaultFooterLogic,
  ratingText,
  playerCount,
}: SduiGameTileProps) {
  // Containment styling: corner radius, padding, surface color
  const cornerRadiusPx = getSduiNumeric(cornerRadius);
  const cornerRadiusClass = buildFoundationTokenCss(getSduiToken(cornerRadius));
  const hasExplicitContainmentPadding = isContained && containmentPadding != null;
  const containedRadiusClass = isContained
    ? (cornerRadiusClass ?? (cornerRadiusPx == null ? "radius-medium" : undefined))
    : undefined;
  const containedSurfaceClass = isContained
    ? buildFoundationTokenCss("Color.Surface.Surface_100", "background")
    : undefined;
  const containedPaddingClass =
    isContained && !hasExplicitContainmentPadding
      ? clsx(
          buildFoundationTokenCss("Padding.Small", "paddingX"),
          buildFoundationTokenCss("Padding.Small", "paddingBottom"),
        )
      : undefined;

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
        includeBackground={parsedImage.thumbnail.includeBackground}
        includeProfileFrame={parsedImage.thumbnail.includeProfileFrame}
        containerClass="sdui-thumbnail-image-container"
      />
    ) : isValidElement(image) ? (
      image
    ) : typeof image === "string" ? (
      <img
        src={image}
        alt={titleText ?? ""}
        className={clsx("width-full", "height-full", "block", "[object-fit:cover]")}
      />
    ) : (
      <div
        data-testid="sdui-tile-placeholder"
        className={clsx("width-full", "height-full")}
        style={{
          aspectRatio: String(imageAspectRatio),
          backgroundColor: thumbnailBackgroundStyle ?? "transparent",
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
        {renderRobloxGlyphText(titleText)}
      </TitleElement>
    ) : null);

  const mainContent = (
    <ActionWrapper
      className={clsx("sdui-game-tile-primary", "static", "flex", "flex-col", "gap-small")}
      onClick={onActivated?.onActivated}
      href={onActivated?.href}
      ariaLabel={titleText}
    >
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
          // Thumbnail bottom radius is overridden to 0px when game tile is contained.
          ...(isContained && {
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
          }),
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
      {/* If contained, title is rendered in the bottom content area for ease of padding. */}
      {!isContained ? titleNode : null}
    </ActionWrapper>
  );

  const showRatingFooter = !disableDefaultFooterLogic && ratingText != null && ratingText !== "";
  const resolvedFooter = showRatingFooter ? (
    <SduiTileFooter
      // Match discovery-common's SduiTileFooter defaults for the built-in rating row.
      textIconGap={{ kind: "token", value: "Gap.XSmall" }}
      sectionGap={{ kind: "token", value: "Gap.Small" }}
      iconWidth={{ kind: "numeric", value: 16 }}
      leftIcon={RATING_ICON_CLASS}
      leftText={ratingText}
      rightIcon={playerCount != null ? PLAYER_COUNT_ICON_CLASS : undefined}
      rightText={playerCount != null ? formatPlayerCount(playerCount) : undefined}
    />
  ) : (
    footerComponent
  );

  const footerRow =
    resolvedFooter != null || ctaButtonComponent != null ? (
      <div
        data-testid="sdui-tile-footer-content"
        className="sdui-game-tile-footer-row relative pointer-events-none flex flex-row gap-xsmall width-full"
      >
        <div className="sdui-game-tile-footer pointer-events-none fill min-width-0 clip flex flex-col justify-center">
          {resolvedFooter}
        </div>
        {ctaButtonComponent != null && (
          <div className="flex shrink-0 pointer-events-auto">{ctaButtonComponent}</div>
        )}
      </div>
    ) : null;

  return (
    <div
      data-testid="sdui-game-tile"
      // Use relative positioning on this parent element and static positioning on the
      // main content element so the main content's stretched ::after
      // pseudo-element uses the parent as the containing block.
      className={clsx(
        "sdui-game-tile",
        "relative",
        "flex",
        "flex-col",
        "width-full",
        "height-full",
        "gap-small",
        "justify-between",
        hasActivationHandler && "sdui-game-tile-wrapper",
        isContained && "clip",
        containedSurfaceClass,
        containedRadiusClass,
      )}
      style={
        isContained && !containedRadiusClass && cornerRadiusPx != null
          ? { borderRadius: cornerRadiusPx }
          : undefined
      }
      onMouseOver={hasVideo ? onHoverStart : undefined}
      onMouseLeave={hasVideo ? onHoverEnd : undefined}
      onFocus={hasVideo ? onHoverStart : undefined}
      onBlur={hasVideo ? onHoverEnd : undefined}
    >
      {mainContent}
      {isContained && (titleNode != null || footerRow != null) ? (
        <div
          data-testid="sdui-tile-bottom-content"
          className={clsx("flex flex-col gap-small width-full", containedPaddingClass)}
          style={
            hasExplicitContainmentPadding
              ? {
                  paddingLeft: containmentPadding,
                  paddingRight: containmentPadding,
                  paddingBottom: containmentPadding,
                }
              : undefined
          }
        >
          {titleNode}
          {footerRow}
        </div>
      ) : (
        footerRow
      )}
    </div>
  );
}

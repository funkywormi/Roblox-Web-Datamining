import React, { isValidElement, useCallback, useEffect, useMemo, useRef } from "react";
import { clsx } from "clsx";
import {
  ActionType,
  DataStatus,
  createActionResolver,
  isSduiManagedChildList,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
  type SduiTokenOrLiteral,
  buildFoundationTokenCss,
  getSduiNumeric,
  getSduiToken,
  toHtmlElement,
  parseImageString,
  renderSduiNestedChild,
  SUPPORTED_ICON_CLASSES,
} from "@rbx/sdui-core";
import { abbreviateNumber } from "@rbx/core-scripts/format/number";
import {
  ActionWrapper,
  renderRobloxGlyphText,
  SDUI_TILE_OVERFLOW_MENU_HOST_CLASS,
  SduiTileFooter,
  SduiTileOverflowMenu,
  useSduiTilePointerHover,
} from "@rbx/sdui-common";
import { useHoverIntent, useOptionalSduiServices } from "@rbx/sdui-core/client";
import "./css/sduiGameTile.css";
import { SDUI_GAME_TILE_DEFAULTS } from "../consts/defaults";
import { useIsEligibleForVideoPreview } from "../hooks/useIsEligibleForVideoPreview";
import { useIsTouchVideoAutoplay } from "../hooks/useIsTouchVideoAutoplay";
import { useViewportVideoAutoplay } from "../hooks/useViewportVideoAutoplay";
import { useHiddenGameTile } from "./gameTileFeedback/useHiddenGameTile";
import { VideoPlaybackAutoplayContext } from "./sduiVideoPlayer/VideoPlaybackAutoplayContext";
import { WwwThumbnail2d } from "./primitives/WwwThumbnail2d";

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

export type SduiGameTileOverflowMenuOpenChange = {
  isOpen: boolean;
  universeId: string;
  collectionId: string;
  availableMenuItemIds: string[];
};

/** A `LazyNestedComponentProp` arrives unrendered, so the tile decides when and how it renders. */
type SduiLazyNestedComponent = React.ReactNode | SduiManagedChildList;

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
  /** Mounted only while the preview plays. */
  videoPlayer?: SduiLazyNestedComponent;
  thumbnailOverlayComponent?: React.ReactNode;
  titleComponent?: React.ReactNode;
  thumbnailBackgroundStyle?: string;
  titleFont?: string;
  titleHeadingLevel?: string;
  /** Bound from GameTileSchema `universe_id`. Used for hover preview and default OpenGameDetails navigation. */
  universeId?: string | number;
  /** Bound from GameTileSchema `place_id`. Used for default OpenGameDetails navigation when `onActivated` is omitted. */
  placeId?: string | number;
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
  /** Sort the tile belongs to. "Not interested" hides the tile within this collection only. */
  collectionId?: string;
  /** OVERFLOW_MENU shown at the thumbnail's top-right on hover or focus. */
  overflowMenuComponent?: SduiLazyNestedComponent;
  /**
   * Shown in place of `overflowMenuComponent` while a mouse hovers the tile and
   * the menu is closed, typically an X that marks the game "Not interested".
   * Keyboard focus and touch keep the menu.
   */
  directActionComponent?: SduiLazyNestedComponent;
  /** Replaces the thumbnail once the tile is hidden through "Not interested". */
  hiddenStateComponent?: SduiLazyNestedComponent;
  /** Local prop: called when the overflow menu opens or closes, for page telemetry. */
  onOverflowMenuOpenChange?: (event: SduiGameTileOverflowMenuOpenChange) => void;
}

/**
 * Client-side game tile. Renders a thumbnail image with title text, an
 * optional footer, and an optional CTA button.
 *
 * Lives in sdui-client (not sdui-core) because it renders Thumbnail2d, a client component that
 * fetches thumbnails.
 *
 * Structure:
 *   div.sdui-game-tile
 *     main content: ActionWrapper with thumbnail, plus the title when the tile is not contained
 *     bottom content: title (if contained), rating footer or footerComponent, and the cta
 */
export function SduiGameTile({
  analyticsContext,
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
  placeId,
  isContained,
  containmentPadding,
  disableDefaultFooterLogic,
  ratingText,
  playerCount,
  collectionId,
  overflowMenuComponent,
  directActionComponent: directActionComponentProp,
  hiddenStateComponent,
  onOverflowMenuOpenChange,
}: SduiGameTileProps) {
  const services = useOptionalSduiServices();
  const normalizedUniverseId =
    universeId != null && String(universeId).trim() !== "" ? String(universeId) : undefined;
  const normalizedPlaceId =
    placeId != null && String(placeId).trim() !== "" ? String(placeId) : undefined;

  // Matches Lua `SduiGameTile.lua`: when a GameTile template omits `onActivated`
  // (e.g. HomeGameTile), fall back to `ACTION_TYPE_OPEN_GAME_DETAILS` using placeId + universeId.
  // Not memoized: the href reads hydrated universe data and analytics fields that update in
  // place, so a memo would serve a stale referral link.
  let defaultOnActivated: SduiResolvedAction | undefined;
  if (
    onActivated == null &&
    services &&
    normalizedPlaceId &&
    normalizedUniverseId &&
    services.actionHandlerRegistry.getActionHandler(ActionType.OPEN_GAME_DETAILS)
  ) {
    const resolveAction = createActionResolver(services, services.configKey);
    defaultOnActivated = resolveAction({
      status: DataStatus.Ready,
      actionData: {
        actionType: ActionType.OPEN_GAME_DETAILS,
        actionParams: {
          placeId: normalizedPlaceId,
          universeId: normalizedUniverseId,
        },
        analyticsContext,
      },
    });
  }

  const resolvedOnActivated = onActivated ?? defaultOnActivated;
  // Memoized so the tile's own re-renders, such as hover changes, keep the same element.
  const directActionComponent = useMemo(
    () => renderSduiNestedChild(directActionComponentProp),
    [directActionComponentProp],
  );

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

  const hasActivationHandler = Boolean(resolvedOnActivated?.onActivated);

  const tileRef = useRef<HTMLDivElement>(null);
  const { isHovered, onHoverStart, onHoverEnd } = useHoverIntent();
  const hasVideo =
    (isSduiManagedChildList(videoPlayer) ? videoPlayer.configs.length > 0 : Boolean(videoPlayer)) &&
    Boolean(normalizedUniverseId);
  // A coarse primary pointer cannot hover, so the video plays while the tile is in the viewport.
  const isTouchInput = useIsTouchVideoAutoplay();
  const isHoverPlaybackEnabled = hasVideo && !isTouchInput;
  const { isEligibleForVideoPreview, isLoadingEligibility } = useIsEligibleForVideoPreview(
    normalizedUniverseId ?? "",
    hasVideo,
  );
  // The menu and hidden state take local props, so both must arrive unrendered.
  const feedbackConfig =
    isSduiManagedChildList(overflowMenuComponent) &&
    isSduiManagedChildList(hiddenStateComponent) &&
    collectionId &&
    normalizedUniverseId
      ? { collectionId, universeId: normalizedUniverseId, overflowMenuComponent }
      : undefined;
  const isFeedbackSupported = feedbackConfig != null;
  const hiddenTile = useHiddenGameTile(feedbackConfig?.collectionId, feedbackConfig?.universeId);
  const isHidden = hiddenTile != null;
  const isFeedbackSent = hiddenTile?.isFeedbackSent;
  const hiddenState = useMemo(
    () =>
      isFeedbackSent == null
        ? null
        : renderSduiNestedChild(hiddenStateComponent, { isFeedbackSent }),
    [hiddenStateComponent, isFeedbackSent],
  );
  // Ineligible and hidden tiles never mount a player, so they must not claim the autoplay slot.
  // Reduced motion is checked inside the hook, at registration time.
  const {
    markEnded,
    markBlocked,
    isPlaybackRequested: isViewportPlaybackRequested,
  } = useViewportVideoAutoplay({
    enabled: hasVideo && isTouchInput && isEligibleForVideoPreview && !isHidden,
    universeId: normalizedUniverseId,
    elementRef: tileRef,
  });
  const playbackCallbacks = useMemo(
    () => ({ onPlaybackEnded: markEnded, onPlaybackBlocked: markBlocked }),
    [markEnded, markBlocked],
  );
  const isPlaybackRequested = isTouchInput ? isViewportPlaybackRequested : isHovered;
  const showEligibilityShimmer = isPlaybackRequested && hasVideo && isLoadingEligibility;
  const showEligiblePlayer = isPlaybackRequested && hasVideo && isEligibleForVideoPreview;

  // The hidden tile has no hover handlers, so a restored tile would otherwise keep a stale hover
  // and start its preview with the pointer elsewhere.
  useEffect(() => {
    if (isHidden) {
      onHoverEnd();
    }
  }, [isHidden, onHoverEnd]);
  const { isPointerHovering, handlers: pointerHoverHandlers } = useSduiTilePointerHover(
    isFeedbackSupported && directActionComponent != null,
  );
  const onMenuOpenChange = useCallback(
    (isOpen: boolean, availableMenuItemIds: string[]) => {
      if (collectionId && normalizedUniverseId) {
        onOverflowMenuOpenChange?.({
          isOpen,
          universeId: normalizedUniverseId,
          collectionId,
          availableMenuItemIds,
        });
      }
    },
    [collectionId, normalizedUniverseId, onOverflowMenuOpenChange],
  );

  // image node: prefer passed imageComponent, then thumbnail/img, then placeholder
  const parsedImage = typeof image === "string" ? parseImageString(image) : null;
  const tilePosterImage =
    imageComponent == null && typeof image === "string" && parsedImage != null ? image : undefined;
  const videoPosterProps = useMemo(
    () => (tilePosterImage != null ? { defaultLoadingImage: tilePosterImage } : undefined),
    [tilePosterImage],
  );

  const imageNode =
    imageComponent ??
    (parsedImage?.kind === "thumbnail" ? (
      <WwwThumbnail2d
        thumbnail={parsedImage.thumbnail}
        containerClassName="sdui-thumbnail-image-container"
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
      onClick={resolvedOnActivated?.onActivated}
      href={resolvedOnActivated?.href}
      target={resolvedOnActivated?.target}
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
          <div
            data-testid="sdui-tile-video-container"
            className="sdui-tile-video-container absolute inset-[0]"
          >
            {showEligibilityShimmer ? (
              <span
                data-testid="sdui-tile-video-shimmer"
                className="shimmer absolute inset-[0] pointer-events-none"
              />
            ) : (
              <VideoPlaybackAutoplayContext.Provider value={playbackCallbacks}>
                {renderSduiNestedChild(videoPlayer, videoPosterProps)}
              </VideoPlaybackAutoplayContext.Provider>
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

  if (isHidden) {
    return (
      <div
        ref={tileRef}
        data-testid="sdui-game-tile"
        className="sdui-game-tile relative flex flex-col width-full"
        {...pointerHoverHandlers}
      >
        <div
          data-testid="sdui-tile-hidden-container"
          className={clsx("width-full", "clip", cornerRadiusClass ?? "radius-medium")}
          style={{ aspectRatio: String(imageAspectRatio) }}
        >
          {hiddenState}
        </div>
      </div>
    );
  }

  const overflowMenu = feedbackConfig ? (
    <SduiTileOverflowMenu
      overflowMenuComponent={feedbackConfig.overflowMenuComponent}
      directActionComponent={directActionComponent}
      isPointerHovering={isPointerHovering}
      onOpenChange={onMenuOpenChange}
    />
  ) : null;

  return (
    <div
      ref={tileRef}
      data-testid="sdui-game-tile"
      // Use relative positioning on this parent element and static positioning on the
      // main content element so the main content's stretched ::after
      // pseudo-element uses the parent as the containing block.
      className={clsx(
        "sdui-game-tile",
        isFeedbackSupported && SDUI_TILE_OVERFLOW_MENU_HOST_CLASS,
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
      onMouseOver={isHoverPlaybackEnabled ? onHoverStart : undefined}
      onMouseLeave={isHoverPlaybackEnabled ? onHoverEnd : undefined}
      onFocus={isHoverPlaybackEnabled ? onHoverStart : undefined}
      onBlur={isHoverPlaybackEnabled ? onHoverEnd : undefined}
      {...pointerHoverHandlers}
    >
      {mainContent}
      {overflowMenu}
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

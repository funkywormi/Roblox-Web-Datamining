import classNames from "classnames";
import { useContext, useEffect, useRef } from "react";
import { abbreviateNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailGameIconSize } from "@rbx/www-common/components/thumbnail";
import { useGamePlaceDetails } from "../../../hooks/useGamePlaceDetails";
import { useGameStats } from "../../../hooks/useGameStats";
import useChatTranslate from "../../../hooks/useChatTranslate";
import {
  sendClickGameLinkCardEvent,
  sendClickPlayFromGameLinkCardEvent,
  sendGameLinkCardImpressionEvent,
  sendLoadGameLinkCardEvent,
} from "../../../utils/gameCardEventStream";
import GameCardPlayButtonContext from "./GameCardPlayButtonContext";

type TGameCardProps = {
  placeId: string;
  /** Original link text, used as the href/fallback if place details are unavailable. */
  url: string;
  /** Owning conversation, sent with card eventstream events. */
  conversationId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  launchData?: string;
  isShareLink?: boolean;
};

/** A card counts as an impression once it is at least half visible (threshold 0.5). */
const IMPRESSION_VISIBILITY_THRESHOLD = 0.5;
/**
 * Debounce before firing an impression: avoids double-firing when the card re-renders
 * (close/re-open) and while scrolling past quickly.
 */
const IMPRESSION_DEBOUNCE_MS = 500;

/**
 * Renders a Roblox game link as a game card (thumbnail + title + description + play button). When
 * place details can't be fetched (invalid/moderated place), a direct game link shows an error card
 * and a share link keeps the plain link.
 * Play/purchase/launch is handled by the host's GameCardPlayButtonContext (no play button without
 * one). Fires load/impression/click eventstream events.
 */
const GameCard = ({
  placeId,
  url,
  conversationId,
  privateServerLinkCode,
  gameInstanceId,
  launchData,
  isShareLink,
}: TGameCardProps) => {
  const { data: place, isSuccess, isError } = useGamePlaceDetails(placeId);
  const universeId = place?.universeId;
  const { data: stats } = useGameStats(universeId);
  const ratingText = stats?.rating != null ? `${stats.rating}%` : undefined;
  const translate = useChatTranslate();
  const PlayButton = useContext(GameCardPlayButtonContext);

  const cardRef = useRef<HTMLDivElement>(null);
  const impressionSentRef = useRef(false);

  // Load event fires once per rendered card, regardless of place validity.
  useEffect(() => {
    sendLoadGameLinkCardEvent(placeId, conversationId);
  }, [placeId, conversationId]);

  // Impression fires once the resolved card is ≥50% visible.
  const rootPlaceId = place?.rootPlaceId;
  useEffect(() => {
    const element = cardRef.current;
    if (
      element == null ||
      rootPlaceId == null ||
      universeId == null ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    let impressionTimeout: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          impressionTimeout = setTimeout(() => {
            if (!impressionSentRef.current) {
              impressionSentRef.current = true;
              sendGameLinkCardImpressionEvent(rootPlaceId, universeId);
            }
          }, IMPRESSION_DEBOUNCE_MS);
        } else if (impressionTimeout != null) {
          clearTimeout(impressionTimeout);
        }
      },
      { threshold: IMPRESSION_VISIBILITY_THRESHOLD },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (impressionTimeout != null) {
        clearTimeout(impressionTimeout);
      }
    };
  }, [rootPlaceId, universeId]);

  if (!place || universeId == null) {
    // Share links and still-loading cards keep the plain link.
    if (!isShareLink && (isSuccess || isError)) {
      return (
        <div
          className="react-chat-game-card padding-small content-muted text-body-small"
          role="status"
        >
          {translate("Label.ContentLoadingFailed", undefined, "We couldn't load this content")}
        </div>
      );
    }
    return (
      <a href={url} className="text-body-small content-link react-chat-game-card-fallback-link">
        {url}
      </a>
    );
  }

  return (
    <div ref={cardRef} className="react-chat-game-card flex flex-col">
      <a
        href={isShareLink ? url : (place.url ?? url)}
        className="flex gap-small content-default"
        onClick={() => {
          sendClickGameLinkCardEvent(placeId, conversationId);
        }}
      >
        <span className="react-chat-game-card-thumb shrink-0 bg-shift-300">
          <Thumbnail2d
            altName={place.name ?? ""}
            containerClassName="block height-full width-full"
            format="webp"
            imgClassName="height-full width-full object-cover"
            size={ThumbnailGameIconSize.size50}
            targetId={universeId}
            type="GameIcon"
          />
        </span>
        <span className="min-width-0 flex grow-1 flex-col gap-xxsmall">
          <span
            className="text-label-small content-emphasis text-no-wrap text-truncate-end"
            title={place.name}
          >
            {place.name}
          </span>
          {place.description != null && place.description.length > 0 && (
            <span
              className={classNames("react-chat-game-card-desc text-caption-small content-muted")}
            >
              {place.description}
            </span>
          )}
          {stats && (
            <span className="text-caption-small content-muted flex items-center gap-small">
              {ratingText != null && (
                <span className="flex items-center gap-xxsmall" data-testid="game-card-rating">
                  <Icon name="icon-filled-thumb-up" size="XSmall" />
                  {ratingText}
                </span>
              )}
              {stats.playing != null && (
                <span className="flex items-center gap-xxsmall" data-testid="game-card-players">
                  <Icon name="icon-filled-person-play" size="XSmall" />
                  {abbreviateNumber(stats.playing)}
                </span>
              )}
            </span>
          )}
        </span>
      </a>
      {/* The play button owns the launch + its own game-play intent; capture the click here to
          also fire the chat-specific play eventstream event. */}
      {PlayButton != null && (
        <span
          className="react-chat-game-card-play"
          onClickCapture={() => {
            sendClickPlayFromGameLinkCardEvent(placeId, conversationId);
          }}
        >
          <PlayButton
            placeId={String(place.placeId)}
            rootPlaceId={place.rootPlaceId != null ? String(place.rootPlaceId) : undefined}
            universeId={String(universeId)}
            privateServerLinkCode={privateServerLinkCode}
            {...(gameInstanceId != null ? { gameInstanceId } : {})}
            {...(launchData != null ? { launchData } : {})}
          />
        </span>
      )}
    </div>
  );
};

export default GameCard;

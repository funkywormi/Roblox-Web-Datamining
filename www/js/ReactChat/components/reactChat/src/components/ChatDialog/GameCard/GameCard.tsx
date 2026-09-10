import classNames from "classnames";
import { useEffect, useRef } from "react";
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGameIconSize,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { DefaultPlayButton, usePlayabilityStatus } from "@rbx/game-play-button";
import { useGamePlaceDetails } from "../../../hooks/useGamePlaceDetails";
import {
  sendClickGameLinkCardEvent,
  sendClickPlayFromGameLinkCardEvent,
  sendGameLinkCardImpressionEvent,
  sendLoadGameLinkCardEvent,
} from "../../../utils/gameCardEventStream";

type TGameCardProps = {
  placeId: string;
  /** Original link text, used as the href/fallback if place details are unavailable. */
  url: string;
  /** Owning conversation, sent with card eventstream events. */
  conversationId: string;
  privateServerLinkCode?: string;
};

/** A card counts as an impression once it is at least half visible (threshold 0.5). */
const IMPRESSION_VISIBILITY_THRESHOLD = 0.5;
/**
 * Debounce before firing an impression: avoids double-firing when the card re-renders
 * (close/re-open) and while scrolling past quickly.
 */
const IMPRESSION_DEBOUNCE_MS = 500;

/**
 * Renders a Roblox game link as a game card (thumbnail + title + description + play button). Falls
 * back to the plain link when place details can't be fetched (invalid/moderated place).
 * Play/purchase/launch is handled by @rbx/game-play-button's DefaultPlayButton. Fires
 * load/impression/click eventstream events.
 */
const GameCard = ({ placeId, url, conversationId, privateServerLinkCode }: TGameCardProps) => {
  const { data: place } = useGamePlaceDetails(placeId);
  const universeId = place?.universeId;
  const { playabilityStatus, refetchPlayabilityData } = usePlayabilityStatus(
    universeId != null ? String(universeId) : "",
  );

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

  // Invalid/moderated place → keep the plain link.
  if (!place || universeId == null) {
    return (
      <a href={url} className="text-body-small content-link">
        {url}
      </a>
    );
  }

  return (
    <div ref={cardRef} className="react-chat-game-card flex flex-col">
      <a
        href={place.url ?? url}
        className="flex gap-small content-default"
        onClick={() => {
          sendClickGameLinkCardEvent(placeId, conversationId);
        }}
      >
        <span className="react-chat-game-card-thumb shrink-0 bg-shift-300">
          <Thumbnail2d
            altName={place.name ?? ""}
            containerClass="block height-full width-full"
            format={ThumbnailFormat.webp}
            imgClassName="height-full width-full object-cover"
            size={ThumbnailGameIconSize.size50}
            targetId={universeId}
            type={ThumbnailTypes.gameIcon}
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
        </span>
      </a>
      {/* DefaultPlayButton owns the launch + its own game-play intent; capture the click here to
          also fire the chat-specific play eventstream event. */}
      <span
        onClickCapture={() => {
          sendClickPlayFromGameLinkCardEvent(placeId, conversationId);
        }}
      >
        <DefaultPlayButton
          placeId={String(place.placeId)}
          rootPlaceId={place.rootPlaceId != null ? String(place.rootPlaceId) : undefined}
          universeId={String(universeId)}
          privateServerLinkCode={privateServerLinkCode}
          playabilityStatus={playabilityStatus}
          refetchPlayabilityStatus={refetchPlayabilityData}
          pageContext="UNKNOWN"
        />
      </span>
    </div>
  );
};

export default GameCard;

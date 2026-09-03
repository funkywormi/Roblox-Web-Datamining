import { type RefObject, useCallback, useEffect, useState } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { ContentType } from "@rbx/unified-logging";
import useTextImpressionIntersectionTracker from "../../common/hooks/useTextImpressionIntersectionTracker";
import useEventDetailsForUniverseId from "../../gameDetailsVirtualEvents/hooks/useEventDetailsForUniverseId";
import eventStreamConstants, {
  EventStreamMetadata,
  EventType,
  TDiscoverySessionInfo,
} from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

const DESCRIPTION_IMPRESSION_THRESHOLDS = [0.01, 0.5, 1];

const GAME_DESCRIPTION_IMPRESSION_COMPONENT_TYPE = "gameDescription";

type GameDescriptionImpressionTrackerOptions = {
  universeId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  descriptionText?: string;
};

/**
 * Manages game description impression tracking with event-list-aware gating.
 *
 * Delays the IntersectionObserver until the events section above the
 * description has settled (loaded or errored), preventing false impressions
 * due to the description being shown and immediately being pushed down when the
 * events return. If the user scrolls before events settle, tracking
 * is enabled immediately since scrolling indicates active engagement and any
 * resulting impression is legitimate.
 *
 * If the description text is empty, the hook does not track impressions.
 */
const useGameDescriptionImpressionTracker = (
  descriptionRef: RefObject<HTMLPreElement>,
  { universeId, referralSessionInfo, descriptionText }: GameDescriptionImpressionTrackerOptions,
): void => {
  const { isLoading: isEventListLoading } = useEventDetailsForUniverseId(universeId);
  const isEventListSettled = !isEventListLoading;
  const isDescriptionTextEmpty = !descriptionText || descriptionText.trim() === "";

  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  useEffect(() => {
    if (isEventListSettled || isDescriptionTextEmpty) {
      return undefined;
    }
    const onScroll = () => setHasUserScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isEventListSettled, isDescriptionTextEmpty]);

  const onEmit = useCallback(
    (threshold: number) => {
      const eventStreamParams = {
        [EventStreamMetadata.ItemId]: Number(universeId),
        // the metric expects the threshold to be a percentage, so we multiply by 100
        [EventStreamMetadata.ImpressionThreshold]: threshold * 100,
        [EventStreamMetadata.ContentType]: ContentType.Description,
        [EventStreamMetadata.PageContext]: PageContext.GameDetailPage,
        [EventStreamMetadata.ComponentType]: GAME_DESCRIPTION_IMPRESSION_COMPONENT_TYPE,
        // the game description does not have a button to expand, so we set this to undefined
        [EventStreamMetadata.IsButtonExpanded]: undefined,
        ...referralSessionInfo,
      } as const;
      const eventParams =
        eventStreamConstants[EventType.ExpandableTextImpression](eventStreamParams);

      sendEvent(...eventParams);
    },
    [universeId, referralSessionInfo],
  );

  useTextImpressionIntersectionTracker(descriptionRef, {
    onEmit,
    thresholds: DESCRIPTION_IMPRESSION_THRESHOLDS,
    enabled: !isDescriptionTextEmpty && (isEventListSettled || hasUserScrolled),
  });
};

export default useGameDescriptionImpressionTracker;

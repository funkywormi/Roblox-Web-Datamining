import { useCallback, useMemo } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import eventStreamConstants, {
  EventStreamMetadata,
  MediaGalleryActionEventType,
  TMediaGalleryAction,
} from "../../common/constants/eventStreamConstants";
import carouselConstants from "../constants/carouselConstants";
import { TCarouselItem, TAssetType } from "../types/carouselTypes";

const { carouselErrorCounters } = carouselConstants;

/**
 * Extracts asset IDs and video flags from a carousel item for analytics based on the item type.
 */
export const getMediaItemAnalyticsData = (
  item: TCarouselItem,
): {
  [EventStreamMetadata.ImageAssetId]?: string;
  [EventStreamMetadata.VideoAssetId]?: string;
  [EventStreamMetadata.IsVideo]: boolean;
  [EventStreamMetadata.IsYoutubeVideo]: boolean;
} => {
  switch (item.type) {
    case TAssetType.Image:
    case TAssetType.Place:
      return {
        [EventStreamMetadata.ImageAssetId]: item.assetId.toString(),
        [EventStreamMetadata.IsVideo]: false,
        [EventStreamMetadata.IsYoutubeVideo]: false,
      };
    case TAssetType.YouTubeVideo:
      return {
        [EventStreamMetadata.VideoAssetId]: item.videoHash,
        // isVideo field is specifically for GamePreviewVideo type, so false for YouTubeVideo
        [EventStreamMetadata.IsVideo]: false,
        [EventStreamMetadata.IsYoutubeVideo]: true,
      };
    case TAssetType.GamePreviewVideo:
      return {
        [EventStreamMetadata.VideoAssetId]: item.videoId.toString(),
        [EventStreamMetadata.ImageAssetId]: item.imageId.toString(),
        [EventStreamMetadata.IsVideo]: true,
        [EventStreamMetadata.IsYoutubeVideo]: false,
      };
    default:
      window.EventTracker?.fireEvent(carouselErrorCounters.MediaGalleryMediaChangedUnknownItemType);
      return {
        [EventStreamMetadata.IsVideo]: false,
        [EventStreamMetadata.IsYoutubeVideo]: false,
      };
  }
};

type TUseMediaCarouselAnalyticsResult = {
  sendMediaGalleryMediaChangedEvent: (
    newIndex: number,
    previousIndex: number,
    isAutoAdvance: boolean,
  ) => void;
};

/**
 * Analytics hook for the media gallery carousel.
 * Returns a callback to send the mediaGalleryMediaChanged event when the item is advanced.
 */
const useMediaCarouselAnalytics = (
  items: TCarouselItem[],
  placeId: string,
  universeId: string,
): TUseMediaCarouselAnalyticsResult => {
  const sendMediaGalleryMediaChangedEvent = useCallback(
    (newIndex: number, previousIndex: number, isAutoAdvance: boolean) => {
      const nextItem = items[newIndex];
      if (!nextItem) {
        window.EventTracker?.fireEvent(carouselErrorCounters.MediaGalleryMediaChangedMissingItem);
        return;
      }

      const baseEventParams = {
        [EventStreamMetadata.MediaGalleryEventType]:
          MediaGalleryActionEventType.MediaGalleryMediaChanged,
        [EventStreamMetadata.Context]: "WebExperienceDetailsPage",
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.PlaceId]: placeId,
        [EventStreamMetadata.PreviousIndex]: previousIndex,
        [EventStreamMetadata.SelectedIndex]: newIndex,
        [EventStreamMetadata.AutoAdvance]: isAutoAdvance,
      };

      // Extract asset IDs based on item type using the next (destination) item
      const assetParams = getMediaItemAnalyticsData(nextItem);

      const derivedEventParams: TMediaGalleryAction = { ...baseEventParams, ...assetParams };
      const eventStreamParams = eventStreamConstants.mediaGalleryMediaChanged(derivedEventParams);
      sendEvent(...eventStreamParams);
    },
    [items, placeId, universeId],
  );

  return useMemo(() => {
    return {
      sendMediaGalleryMediaChangedEvent,
    };
  }, [sendMediaGalleryMediaChangedEvent]);
};

export default useMediaCarouselAnalytics;

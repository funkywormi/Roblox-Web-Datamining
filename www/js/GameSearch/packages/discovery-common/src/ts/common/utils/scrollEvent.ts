import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  EventStreamMetadata,
  ScrollDirection,
  TFeedScroll,
  EventType,
} from "../constants/eventStreamConstants";

type ScrollEventProps = {
  distance: number;
  scrollAreaSize: number;
  direction: ScrollDirection;
  startingPosition: number;
  currentPage: string;
  pageSession: string;
  gameSetTypeId?: number | string;
  gameSetTargetId?: number;
  sortPosition?: number;
};

export const sendScrollEvent = ({
  distance,
  scrollAreaSize,
  direction,
  startingPosition,
  currentPage,
  pageSession,
  gameSetTypeId,
  gameSetTargetId,
  sortPosition,
}: ScrollEventProps): void => {
  const eventData: TFeedScroll = {
    [EventStreamMetadata.StartPos]: startingPosition,
    [EventStreamMetadata.Distance]: distance,
    [EventStreamMetadata.Direction]: direction,
    [EventStreamMetadata.PageSession]: pageSession,
    [EventStreamMetadata.GameSetTypeId]: gameSetTypeId,
    [EventStreamMetadata.GameSetTargetId]: gameSetTargetId,
    [EventStreamMetadata.SortPos]: sortPosition,
    [EventStreamMetadata.ScrollDepth]: distance / scrollAreaSize,
    [EventStreamMetadata.StartDepth]: startingPosition / scrollAreaSize,
    [EventStreamMetadata.ScreenSizeX]: window.innerWidth,
    [EventStreamMetadata.ScreenSizeY]: window.innerHeight,
    [EventStreamMetadata.ScrollAreaSize]: scrollAreaSize,
  };

  sendEventWithTarget(EventType.FeedScroll, currentPage, eventData, targetTypes.WWW);
};

export default {
  sendScrollEvent,
};

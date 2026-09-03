import { useEffect, useCallback, useRef } from "react";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";
import AnalyticsEvents from "../utils/analytics";
import { eventTileImpressionVisibilityThreshold } from "../constants/constants";

const useEventTileImpressionTracker = (
  tileRef: React.RefObject<HTMLDivElement | HTMLLIElement>,
  eventId: string,
  universeId: number,
): void => {
  const disconnectRef = useRef<VoidFunction | null>(null);

  const sendImpressionEvent = useCallback(() => {
    AnalyticsEvents.sendVirtualEventImpressionFromExperienceDetailsPageEvent(eventId, universeId);
  }, [eventId, universeId]);

  useEffect(() => {
    if (tileRef?.current) {
      const element = tileRef.current;

      const onObserve = (isVisible: boolean) => {
        if (isVisible) {
          sendImpressionEvent();

          if (disconnectRef.current) {
            disconnectRef.current();
          }
        }
      };

      disconnectRef.current = observeVisibility(
        {
          element,
          threshold: eventTileImpressionVisibilityThreshold,
        },
        onObserve,
      );
    }

    return () => {
      if (disconnectRef?.current) {
        disconnectRef.current();
      }
    };
  }, [sendImpressionEvent, tileRef]);
};

export default useEventTileImpressionTracker;

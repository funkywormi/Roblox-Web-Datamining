import { useEffect, useRef, type RefObject } from "react";
import { type EventContext } from "@rbx/unified-logging";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";
import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { TPlayabilityStatus } from "../types/playButtonTypes";

const IMPRESSION_VISIBILITY_THRESHOLD = 0.5;

type ContextualMessageImpressionParams = {
  playabilityStatus: TPlayabilityStatus | undefined;
  universeId: string;
  pageContext: EventContext;
  attributionId: string;
  contextualMessage: string | undefined;
};

const useContextualMessageImpression = (
  elementRef: RefObject<HTMLSpanElement | null>,
  params: ContextualMessageImpressionParams,
): void => {
  const { universeId, playabilityStatus, pageContext, attributionId, contextualMessage } = params;
  const hasFiredRef = useRef(false);

  useEffect(() => {
    hasFiredRef.current = false;
  }, [universeId, playabilityStatus, pageContext, attributionId, contextualMessage]);

  useEffect(() => {
    if (!elementRef.current || hasFiredRef.current || !contextualMessage) {
      return undefined;
    }

    let disconnect: VoidFunction | null = null;
    disconnect = observeVisibility(
      { element: elementRef.current, threshold: IMPRESSION_VISIBILITY_THRESHOLD },
      isVisible => {
        if (isVisible && !hasFiredRef.current) {
          hasFiredRef.current = true;
          eventStreamService.sendEventWithTarget(
            "playButtonContextualMessageImpression",
            pageContext,
            {
              universeId,
              playabilityStatus,
              contextualMessage,
              attributionId,
            },
          );
          disconnect?.();
          disconnect = null;
        }
      },
    );

    return () => {
      disconnect?.();
    };
  }, [elementRef, universeId, playabilityStatus, pageContext, attributionId, contextualMessage]);
};

export default useContextualMessageImpression;

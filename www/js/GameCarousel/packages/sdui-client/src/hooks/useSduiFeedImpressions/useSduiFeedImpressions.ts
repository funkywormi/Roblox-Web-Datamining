import { useCallback, useEffect, useRef, type RefObject } from "react";
import { type SduiComponentConfig } from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { buildSduiFeedImpressionPayload } from "./feedImpressionPayload";
import { watchFeedItemVisibility } from "./watchFeedItemVisibility";

const SDUI_FEED_IMPRESSIONS_EVENT_NAME = "sduiFeedImpressions";
const IMPRESSION_FLUSH_DELAY_MS = 200;
const FAILED_TO_LOG_FEED_IMPRESSIONS = "FailedToLogFeedImpressions";

type UseSduiFeedImpressionsOptions = {
  feedColumnRef: RefObject<HTMLDivElement | null>;
  feedItemConfigs: SduiComponentConfig[];
  dataUpdatedTimestamp?: number;
};

function hasTrackedFeedIndex(
  reportedIndexes: Set<number>,
  pendingIndexes: Set<number>,
  index: number,
): boolean {
  return reportedIndexes.has(index) || pendingIndexes.has(index);
}

/**
 * Forget a section when its config object changes.
 * Loading more keeps the same objects, so those sections stay logged.
 * A refresh creates new objects, so a section on screen can be logged again.
 */
function forgetIndexesWithReplacedConfigs(
  trackedIndexes: Set<number>,
  previousConfigs: readonly SduiComponentConfig[],
  nextConfigs: readonly SduiComponentConfig[],
): void {
  trackedIndexes.forEach(index => {
    if (nextConfigs[index] !== previousConfigs[index]) {
      trackedIndexes.delete(index);
    }
  });
}

export function useSduiFeedImpressions({
  feedColumnRef,
  feedItemConfigs,
  dataUpdatedTimestamp,
}: UseSduiFeedImpressionsOptions): void {
  const services = useSduiServices();
  const reportedIndexesRef = useRef<Set<number>>(new Set());
  const pendingIndexesRef = useRef<Set<number>>(new Set());
  const previousDataUpdatedTimestampRef = useRef(dataUpdatedTimestamp);
  const previousFeedItemConfigsRef = useRef<SduiComponentConfig[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const previousConfigs = previousFeedItemConfigsRef.current;
    previousFeedItemConfigsRef.current = feedItemConfigs;

    if (previousDataUpdatedTimestampRef.current === dataUpdatedTimestamp) {
      return;
    }

    previousDataUpdatedTimestampRef.current = dataUpdatedTimestamp;
    [reportedIndexesRef.current, pendingIndexesRef.current].forEach(trackedIndexes => {
      forgetIndexesWithReplacedConfigs(trackedIndexes, previousConfigs, feedItemConfigs);
    });
  }, [dataUpdatedTimestamp, feedItemConfigs]);

  const flushPendingImpressions = useCallback(() => {
    const indexesToSend = [...pendingIndexesRef.current]
      .filter(index => !reportedIndexesRef.current.has(index))
      .sort((left, right) => left - right);
    pendingIndexesRef.current.clear();

    if (indexesToSend.length === 0) {
      return;
    }

    const { fields, impressedIndexes, missingIndexes } = buildSduiFeedImpressionPayload(
      feedItemConfigs,
      indexesToSend,
      services.pageContext.appPage,
    );

    missingIndexes.forEach(index => {
      services.errorReporter.reportSduiError(
        FAILED_TO_LOG_FEED_IMPRESSIONS,
        `Feed item index ${index + 1} detected with no matching component config`,
        services.pageContext,
      );
    });

    if (fields == null) {
      return;
    }

    services.analyticsReporter.logEvent(
      {
        name: SDUI_FEED_IMPRESSIONS_EVENT_NAME,
        type: SDUI_FEED_IMPRESSIONS_EVENT_NAME,
        context: services.pageContext.appPage,
      },
      fields,
    );
    impressedIndexes.forEach(index => reportedIndexesRef.current.add(index));
  }, [feedItemConfigs, services.analyticsReporter, services.errorReporter, services.pageContext]);

  useEffect(() => {
    const feedColumn = feedColumnRef.current;
    const pendingIndexes = pendingIndexesRef.current;
    if (
      feedItemConfigs.length === 0 ||
      feedColumn == null ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const queueImpressionFlush = () => {
      if (flushTimeoutRef.current != null) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = setTimeout(flushPendingImpressions, IMPRESSION_FLUSH_DELAY_MS);
    };

    const stopWatching = watchFeedItemVisibility({
      feedColumn,
      isIndexTracked: index =>
        hasTrackedFeedIndex(reportedIndexesRef.current, pendingIndexes, index),
      onFeedItemVisible: index => {
        pendingIndexes.add(index);
        queueImpressionFlush();
      },
      onInvalidIndexMarker: () => {
        services.errorReporter.reportSduiError(
          FAILED_TO_LOG_FEED_IMPRESSIONS,
          "Feed item detected with no valid index marker",
          services.pageContext,
        );
      },
    });

    return () => {
      stopWatching();
      if (flushTimeoutRef.current != null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = undefined;
      }
      // Send sections already seen, using the configs that were on screen.
      // The next watcher skips pending indexes, so clearing them here would lose the event.
      if (pendingIndexes.size > 0) {
        flushPendingImpressions();
      }
    };
  }, [
    dataUpdatedTimestamp,
    feedColumnRef,
    feedItemConfigs.length,
    flushPendingImpressions,
    services.errorReporter,
    services.pageContext,
  ]);
}

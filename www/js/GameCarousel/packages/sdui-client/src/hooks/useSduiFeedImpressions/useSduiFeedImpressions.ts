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

type PendingConfigSnapshot = SduiComponentConfig | undefined;

function hasTrackedFeedIndex(
  reportedIndexes: Set<number>,
  pendingByIndex: Map<number, PendingConfigSnapshot>,
  index: number,
): boolean {
  return reportedIndexes.has(index) || pendingByIndex.has(index);
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

function forgetPendingWithReplacedConfigs(
  pendingByIndex: Map<number, PendingConfigSnapshot>,
  previousConfigs: readonly SduiComponentConfig[],
  nextConfigs: readonly SduiComponentConfig[],
): void {
  pendingByIndex.forEach((_config, index) => {
    if (nextConfigs[index] !== previousConfigs[index]) {
      pendingByIndex.delete(index);
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
  // Index → config captured at detection time so a later reindex cannot reattribute the event.
  const pendingByIndexRef = useRef<Map<number, PendingConfigSnapshot>>(new Map());
  const previousDataUpdatedTimestampRef = useRef(dataUpdatedTimestamp);
  const previousFeedItemConfigsRef = useRef<SduiComponentConfig[]>([]);
  // Read when detecting so the snapshot does not depend on the configs array identity.
  const latestFeedItemConfigsRef = useRef(feedItemConfigs);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const hasFeedItems = feedItemConfigs.length > 0;

  useEffect(() => {
    const previousConfigs = previousFeedItemConfigsRef.current;
    previousFeedItemConfigsRef.current = feedItemConfigs;
    // Runs after the watcher cleanup below, so a flush there still sees the configs that were on screen.
    latestFeedItemConfigsRef.current = feedItemConfigs;

    if (previousDataUpdatedTimestampRef.current === dataUpdatedTimestamp) {
      return;
    }

    previousDataUpdatedTimestampRef.current = dataUpdatedTimestamp;
    forgetIndexesWithReplacedConfigs(reportedIndexesRef.current, previousConfigs, feedItemConfigs);
    forgetPendingWithReplacedConfigs(pendingByIndexRef.current, previousConfigs, feedItemConfigs);
  }, [dataUpdatedTimestamp, feedItemConfigs]);

  const flushPendingImpressions = useCallback(() => {
    const pendingByIndex = pendingByIndexRef.current;
    const indexesToSend = [...pendingByIndex.keys()]
      .filter(index => !reportedIndexesRef.current.has(index))
      .sort((left, right) => left - right);

    if (indexesToSend.length === 0) {
      pendingByIndex.clear();
      return;
    }

    // Sparse array keyed by feed index so payload building still indexes by position.
    const snapshotConfigs: SduiComponentConfig[] = [];
    indexesToSend.forEach(index => {
      const config = pendingByIndex.get(index);
      if (config != null) {
        snapshotConfigs[index] = config;
      }
    });
    pendingByIndex.clear();

    const { fields, impressedIndexes, missingIndexes } = buildSduiFeedImpressionPayload(
      snapshotConfigs,
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
  }, [services.analyticsReporter, services.errorReporter, services.pageContext]);

  useEffect(() => {
    const feedColumn = feedColumnRef.current;
    const pendingByIndex = pendingByIndexRef.current;
    if (!hasFeedItems || feedColumn == null || typeof IntersectionObserver === "undefined") {
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
        hasTrackedFeedIndex(reportedIndexesRef.current, pendingByIndex, index),
      onFeedItemVisible: index => {
        if (!hasTrackedFeedIndex(reportedIndexesRef.current, pendingByIndex, index)) {
          pendingByIndex.set(index, latestFeedItemConfigsRef.current[index]);
        }
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
      // Send sections already seen, using the configs captured at detection.
      // The next watcher skips pending indexes, so clearing them here would lose the event.
      if (pendingByIndex.size > 0) {
        flushPendingImpressions();
      }
    };
  }, [
    dataUpdatedTimestamp,
    feedColumnRef,
    hasFeedItems,
    flushPendingImpressions,
    services.errorReporter,
    services.pageContext,
  ]);
}

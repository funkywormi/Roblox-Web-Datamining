"use client";

import React, { Children, useCallback, useEffect, useMemo, useRef } from "react";
import {
  resolveManagedChildList,
  SDUI_MANAGED_CHILDREN_PROP,
  type SduiManagedChildList,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import {
  Loading,
  LoadMoreSentinel,
  SduiVerticalFeed as SduiCoreVerticalFeed,
  type SduiVerticalFeedProps as SduiCoreVerticalFeedProps,
} from "@rbx/sdui-common";
import { useSduiLoadMorePagination, useSduiServices } from "@rbx/sdui-core/client";
import { useProgressiveItemCount } from "../hooks/useProgressiveItemCount";
import { useSduiFeedImpressions } from "../hooks/useSduiFeedImpressions";
import { BackToTopButton } from "./primitives/BackToTopButton";

const BACK_TO_TOP_EVENT_NAME = "backToTopClick";
const BACK_TO_TOP_TRANSLATION_KEY = "Feature.GamePage.Action.BackToTop";
const BACK_TO_TOP_FALLBACK_TEXT = "Back to top";

export interface SduiVerticalFeedProps extends SduiCoreVerticalFeedProps {
  onScrollToEnd?: SduiResolvedAction;
  thresholdFromEnd?: number;
  enableBackToTop?: boolean;
  initialNumToRender?: number;
  progressiveFillRate?: number;
  /** Milliseconds between fill batches. When unset or <= 0, the next batch is scheduled ASAP. */
  progressiveFillIntervalMs?: number;
}

function hasFeedItems(
  feedItems: SduiVerticalFeedProps["feedItems"],
  managedFeedItems: SduiManagedChildList | undefined,
  children: React.ReactNode,
): boolean {
  if (managedFeedItems != null) {
    return managedFeedItems.configs.length > 0;
  }
  return Children.count(feedItems ?? children) > 0;
}

/** Client adapter that adds template-driven pagination to the isomorphic feed layout. */
export function SduiVerticalFeed({
  onScrollToEnd,
  thresholdFromEnd,
  enableBackToTop = false,
  initialNumToRender,
  progressiveFillRate,
  progressiveFillIntervalMs,
  feedItems,
  ...feedProps
}: SduiVerticalFeedProps): React.JSX.Element {
  const feedColumnRef = useRef<HTMLDivElement | null>(null);
  const services = useSduiServices();
  const { configKey, poolRegistry } = services;
  const translatedBackToTop = services.translate?.(BACK_TO_TOP_TRANSLATION_KEY);
  const backToTopText = translatedBackToTop?.length
    ? translatedBackToTop
    : BACK_TO_TOP_FALLBACK_TEXT;
  const logBackToTopClick = useCallback(() => {
    services.analyticsReporter.logEvent(
      {
        name: BACK_TO_TOP_EVENT_NAME,
        type: BACK_TO_TOP_EVENT_NAME,
        context: services.pageContext.appPage,
      },
      { eventContext: services.pageContext.appPage },
    );
  }, [services.analyticsReporter, services.pageContext.appPage]);
  const { triggerLoadMore, hasNextPage, dataUpdatedTimestamp, isLoadingMore } =
    useSduiLoadMorePagination({ onLoadMore: onScrollToEnd });
  // Same inputs as SduiVerticalFeed in sdui-common. Impressions must use the list that the feed renders.
  // The feed resolves again because it can also render without this wrapper.
  const managedFeedItems = resolveManagedChildList(
    feedItems,
    feedProps[SDUI_MANAGED_CHILDREN_PROP],
  );
  const [visibleFeedItemCount, isFillingFeed] = useProgressiveItemCount(
    managedFeedItems?.configs.length ?? 0,
    initialNumToRender,
    progressiveFillRate,
    progressiveFillIntervalMs,
    managedFeedItems?.configs ?? [],
  );
  const visibleManagedFeedItems = useMemo<SduiManagedChildList | undefined>(() => {
    if (managedFeedItems == null || visibleFeedItemCount >= managedFeedItems.configs.length) {
      return managedFeedItems;
    }
    return {
      ...managedFeedItems,
      configs: managedFeedItems.configs.slice(0, visibleFeedItemCount),
    };
  }, [managedFeedItems, visibleFeedItemCount]);
  const isFeedPopulated = hasFeedItems(feedItems, managedFeedItems, feedProps.children);

  useSduiFeedImpressions({
    feedColumnRef,
    feedItemConfigs: visibleManagedFeedItems?.configs ?? [],
    dataUpdatedTimestamp,
  });

  useEffect(() => {
    if (!configKey) return undefined;

    const poolStore = poolRegistry.getOrCreate(configKey);
    const measurement = poolStore.mountContainerMeasurement();

    const feedColumn = feedColumnRef.current;
    if (feedColumn) {
      measurement.setWidth(feedColumn.getBoundingClientRect().width);
    }

    const resizeObserver =
      feedColumn && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(entries => {
            const feedColumnEntry = entries.find(entry => entry.target === feedColumn);
            if (feedColumnEntry) {
              measurement.setWidth(feedColumnEntry.contentRect.width);
            }
          })
        : undefined;
    if (resizeObserver && feedColumn) {
      resizeObserver.observe(feedColumn);
    }

    return () => {
      resizeObserver?.disconnect();
      measurement.release();
    };
  }, [configKey, poolRegistry]);

  return (
    <React.Fragment>
      <SduiCoreVerticalFeed
        {...feedProps}
        feedItems={visibleManagedFeedItems ?? feedItems}
        feedColumnRef={feedColumnRef}
      />
      {isLoadingMore ? <Loading ariaLabel="Loading more content" /> : null}
      {hasNextPage && !isFillingFeed ? (
        <LoadMoreSentinel
          onLoadMore={triggerLoadMore}
          dataUpdatedTimestamp={dataUpdatedTimestamp}
          thresholdFromEnd={thresholdFromEnd}
        />
      ) : null}
      <BackToTopButton
        enabled={enableBackToTop && isFeedPopulated && !isLoadingMore}
        feedColumnRef={feedColumnRef}
        text={backToTopText}
        onClick={logBackToTopClick}
      />
    </React.Fragment>
  );
}

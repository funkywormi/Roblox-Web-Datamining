"use client";

import React, { Children, useCallback, useRef } from "react";
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
import { useSduiFeedImpressions } from "../hooks/useSduiFeedImpressions";
import { BackToTopButton } from "./primitives/BackToTopButton";

const BACK_TO_TOP_EVENT_NAME = "backToTopClick";
const BACK_TO_TOP_TRANSLATION_KEY = "Feature.GamePage.Action.BackToTop";
const BACK_TO_TOP_FALLBACK_TEXT = "Back to top";

export interface SduiVerticalFeedProps extends SduiCoreVerticalFeedProps {
  onScrollToEnd?: SduiResolvedAction;
  thresholdFromEnd?: number;
  enableBackToTop?: boolean;
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
  feedItems,
  ...feedProps
}: SduiVerticalFeedProps): React.JSX.Element {
  const feedColumnRef = useRef<HTMLDivElement | null>(null);
  const services = useSduiServices();
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
  const isFeedPopulated = hasFeedItems(feedItems, managedFeedItems, feedProps.children);

  useSduiFeedImpressions({
    feedColumnRef,
    feedItemConfigs: managedFeedItems?.configs ?? [],
    dataUpdatedTimestamp,
  });

  return (
    <React.Fragment>
      <SduiCoreVerticalFeed {...feedProps} feedItems={feedItems} feedColumnRef={feedColumnRef} />
      {isLoadingMore ? <Loading ariaLabel="Loading more content" /> : null}
      {hasNextPage ? (
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

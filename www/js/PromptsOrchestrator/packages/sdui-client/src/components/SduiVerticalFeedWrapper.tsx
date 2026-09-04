"use client";

import React from "react";
import {
  Loading,
  LoadMoreSentinel,
  SduiVerticalFeed as SduiCoreVerticalFeed,
  type SduiResolvedAction,
  type SduiVerticalFeedProps as SduiCoreVerticalFeedProps,
} from "@rbx/sdui-core";
import { useSduiLoadMorePagination } from "@rbx/sdui-core/client";

export interface SduiVerticalFeedProps extends SduiCoreVerticalFeedProps {
  onScrollToEnd?: SduiResolvedAction;
  thresholdFromEnd?: number;
}

/** Client adapter that adds template-driven pagination to the isomorphic feed layout. */
export function SduiVerticalFeed({
  onScrollToEnd,
  thresholdFromEnd,
  ...feedProps
}: SduiVerticalFeedProps): React.JSX.Element {
  const { triggerLoadMore, hasNextPage, dataUpdatedTimestamp, isLoadingMore } =
    useSduiLoadMorePagination({ onLoadMore: onScrollToEnd });

  return (
    <React.Fragment>
      <SduiCoreVerticalFeed {...feedProps} />
      {isLoadingMore ? <Loading ariaLabel="Loading more content" /> : null}
      {hasNextPage ? (
        <LoadMoreSentinel
          onLoadMore={triggerLoadMore}
          dataUpdatedTimestamp={dataUpdatedTimestamp}
          thresholdFromEnd={thresholdFromEnd}
        />
      ) : null}
    </React.Fragment>
  );
}

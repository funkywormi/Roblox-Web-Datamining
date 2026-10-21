"use client";
import React from "react";
import {
  expandManagedList,
  isSduiManagedChildList,
  resolveManagedChildList,
  SDUI_MANAGED_CHILDREN_PROP,
  wrapFeedManagedChildList,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiTokenOrLiteral,
} from "@rbx/sdui-core";
import {
  buildFeedColumnStyles,
  getVerticalFeedStyles,
  SDUI_FEED_ITEM_INDEX_ATTRIBUTE,
} from "./verticalFeedStyleUtils";

export interface SduiVerticalFeedProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining VerticalFeed schema features (e.g. thresholdFromEnd, onScrollToEnd)
  feedItems?: React.ReactNode | SduiManagedChildList;
  stickyItems?: React.ReactNode | SduiManagedChildList;
  children?: React.ReactNode;
  horizontalPadding?: SduiTokenOrLiteral;
  gapBetweenFeedItems?: SduiTokenOrLiteral;
  gapAfterStickyItems?: SduiTokenOrLiteral;
  gapBetweenStickyItems?: SduiTokenOrLiteral;
  stickyPaddingTop?: SduiTokenOrLiteral;
  stickyPaddingBottom?: SduiTokenOrLiteral;
  maxWidth?: SduiTokenOrLiteral;
  feedColumnRef?: React.Ref<HTMLDivElement>;
}

/**
 * Expands the scrolling feed lane with one index sentinel per config. The
 * sentinel is `display: contents`, so the entry's own root stays the flex item
 * and feed gap/layout is unchanged; an entry that renders nothing adds no box.
 */
function expandFeedItemsWithIndexMarkers(list: SduiManagedChildList): React.ReactNode {
  return list.configs.map((childConfig, index) => {
    const key = childConfig.reactKey ?? childConfig.identifier ?? `${index}`;
    return (
      <div
        key={key}
        style={{ display: "contents" }}
        {...{ [SDUI_FEED_ITEM_INDEX_ATTRIBUTE]: index }}
      >
        {list.renderItem(childConfig, index, key)}
      </div>
    );
  });
}

/**
 * Isomorphic vertical feed layout. Optionally pins `stickyItems` above the
 * scrolling feed column.
 */
export function SduiVerticalFeed({
  feedItems,
  stickyItems,
  children,
  horizontalPadding,
  gapBetweenFeedItems,
  gapAfterStickyItems,
  gapBetweenStickyItems,
  stickyPaddingTop,
  stickyPaddingBottom,
  maxWidth,
  feedColumnRef,
  [SDUI_MANAGED_CHILDREN_PROP]: sduiManagedChildren,
}: SduiVerticalFeedProps) {
  // Same inputs as SduiVerticalFeedWrapper in sdui-client, which resolves this list for impressions.
  // Keep both calls. This feed also renders without that wrapper.
  const managedFeedList = resolveManagedChildList(feedItems, sduiManagedChildren);

  let stickyContent: React.ReactNode | null = null;
  let stickyCollectionCount = 0;
  if (stickyItems != null) {
    if (isSduiManagedChildList(stickyItems)) {
      stickyCollectionCount = stickyItems.configs.length;
      stickyContent =
        stickyItems.configs.length === 0
          ? null
          : expandManagedList(wrapFeedManagedChildList(stickyItems));
    } else {
      stickyContent = stickyItems;
    }
  }

  const content = managedFeedList
    ? expandFeedItemsWithIndexMarkers(
        wrapFeedManagedChildList(managedFeedList, stickyCollectionCount),
      )
    : (feedItems ?? sduiManagedChildren ?? children);
  const { containerStyles, contentStyles, stickyStyles, stickyItemsStyles } = getVerticalFeedStyles(
    {
      horizontalPadding,
      gapAfterStickyItems,
      gapBetweenStickyItems,
      stickyPaddingTop,
      stickyPaddingBottom,
      maxWidth,
    },
  );

  const hasSticky = stickyContent != null;
  const feedColumnProps = buildFeedColumnStyles(
    gapBetweenFeedItems,
    hasSticky ? undefined : maxWidth,
  );
  const feedColumn = (
    <div ref={feedColumnRef} {...feedColumnProps}>
      {content}
    </div>
  );

  return (
    <div {...containerStyles}>
      {hasSticky ? (
        <div {...contentStyles}>
          <div {...stickyStyles} data-testid="sdui-vertical-feed-sticky-region">
            <div {...stickyItemsStyles}>{stickyContent}</div>
          </div>
          {feedColumn}
        </div>
      ) : (
        feedColumn
      )}
    </div>
  );
}

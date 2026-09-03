"use client";
import React from "react";
import {
  SDUI_MANAGED_CHILDREN_PROP,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiTokenOrLiteral,
} from "../../types";
import { expandManagedList } from "../../utils/rendererHelpers";
import { isSduiManagedChildList } from "../../utils/typeGuards";
import { wrapFeedManagedChildList } from "../../utils/wrapFeedManagedChildList";
import { buildFeedColumnStyles, getVerticalFeedStyles } from "./verticalFeedStyleUtils";

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
  [SDUI_MANAGED_CHILDREN_PROP]: sduiManagedChildren,
}: SduiVerticalFeedProps) {
  let managedFeedList: SduiManagedChildList | undefined;
  if (isSduiManagedChildList(feedItems)) {
    managedFeedList = feedItems;
  } else if (isSduiManagedChildList(sduiManagedChildren)) {
    managedFeedList = sduiManagedChildren;
  }

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
    ? expandManagedList(wrapFeedManagedChildList(managedFeedList, stickyCollectionCount))
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
  const feedColumn = <div {...feedColumnProps}>{content}</div>;

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

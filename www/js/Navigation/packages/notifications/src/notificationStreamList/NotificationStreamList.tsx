import React, { ReactNode, useRef } from "react";
import { List } from "@rbx/foundation-ui";
import { useInfiniteScroll } from "./useInfiniteScroll";

export type NotificationStreamListProps<T> = {
  /** The rows to render. */
  items: T[];
  /** Renders a single row's content (wrapped in an <li> by this component). */
  renderItem: (item: T, index: number) => ReactNode;
  /** Stable React key for a row. */
  getKey: (item: T, index: number) => string | number;
  /** Whether more pages can be loaded (drives the infinite-scroll sentinel). */
  hasMore: boolean;
  /** Whether a page is currently loading. */
  isLoading: boolean;
  /** Called when the sentinel scrolls into view and more can be loaded. */
  onLoadMore: () => void;
  /** Shown below the list while `isLoading`. */
  loadingIndicator?: ReactNode;
  /** Shown instead of the list when there are no items and nothing is loading. */
  emptyState?: ReactNode;
  /** Caps the scroll container height; when set the container scrolls internally. */
  maxHeight?: number | string;
  className?: string;
  /** Accessible label for the underlying <ul>. */
  ariaLabel?: string;
};

/**
 * The notification stream's scrolling, paginated list. Replaces the legacy
 * `lazyLoadingDirective.js` (mCustomScrollbar) with foundation-ui `List` (the semantic
 * <ul>) plus {@link useInfiniteScroll}. It is deliberately item-agnostic — rows are
 * supplied by the caller via `renderItem` — so the Phase 4 shell can feed it
 * `Notification` cards for any builder-backed type without this component knowing about
 * card shapes. No feature flag: it is consumed by the shell, which owns the flag.
 */
export const NotificationStreamList = <T,>({
  items,
  renderItem,
  getKey,
  hasMore,
  isLoading,
  onLoadMore,
  loadingIndicator,
  emptyState,
  maxHeight,
  className,
  ariaLabel,
}: NotificationStreamListProps<T>): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore, rootRef: scrollRef });

  if (items.length === 0 && (isLoading || emptyState !== undefined)) {
    return (
      <div
        className={[className, "is-empty"].filter(Boolean).join(" ")}
        style={
          maxHeight !== undefined
            ? {
                minHeight: maxHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }
            : undefined
        }
      >
        {isLoading ? loadingIndicator : emptyState}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={className}
      style={
        maxHeight !== undefined
          ? { height: maxHeight, overflowY: "auto", boxSizing: "border-box" }
          : undefined
      }
    >
      <List as="ul" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <li key={getKey(item, index)}>{renderItem(item, index)}</li>
        ))}
      </List>
      {hasMore && <div ref={sentinelRef} aria-hidden="true" />}
      {isLoading && loadingIndicator}
    </div>
  );
};

export default NotificationStreamList;

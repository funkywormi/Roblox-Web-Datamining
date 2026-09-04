"use client";

import { useCallback, useMemo } from "react";

import { CacheStatus, type SduiResolvedAction } from "../../types";
import { useSduiConfigKey, useSduiServices } from "../context/SduiProvider";
import { useSduiCacheSubscription } from "./useSduiCacheEntry";

export interface SduiLoadMorePagination {
  triggerLoadMore: () => void;
  hasNextPage: boolean;
  dataUpdatedTimestamp?: number;
  isLoadingMore: boolean;
  loadMoreError?: Error;
}

export interface UseSduiLoadMorePaginationOptions {
  /** Omitting the template action opts the component out of pagination. */
  onLoadMore?: SduiResolvedAction;
}

export function useSduiLoadMorePagination(
  options: UseSduiLoadMorePaginationOptions = {},
): SduiLoadMorePagination {
  const { onLoadMore } = options;
  const { apiStore } = useSduiServices();
  const configKey = useSduiConfigKey();
  const cacheEntry = useSduiCacheSubscription(apiStore, configKey ?? "");
  const loadMoreStatus = cacheEntry?.loadMoreStatus;
  const hasNextPage = onLoadMore != null && cacheEntry?.nextPageUrl != null;
  const isLoadingMore = onLoadMore != null && loadMoreStatus?.status === CacheStatus.Loading;
  const loadMoreError =
    onLoadMore != null && loadMoreStatus?.status === CacheStatus.Error
      ? loadMoreStatus.error
      : undefined;

  const triggerLoadMore = useCallback(() => {
    if (onLoadMore == null || isLoadingMore || !hasNextPage) return;
    onLoadMore.onActivated();
  }, [hasNextPage, isLoadingMore, onLoadMore]);

  return useMemo<SduiLoadMorePagination>(
    () => ({
      triggerLoadMore,
      hasNextPage,
      dataUpdatedTimestamp: cacheEntry?.dataUpdatedTimestamp,
      isLoadingMore,
      loadMoreError,
    }),
    [triggerLoadMore, hasNextPage, cacheEntry?.dataUpdatedTimestamp, isLoadingMore, loadMoreError],
  );
}

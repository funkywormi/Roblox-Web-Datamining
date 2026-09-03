import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@rbx/core-scripts/react";
import tradesConstants from "../constants/tradesConstants";
import { getInventoryPage } from "../services/tradesApi";
import { TradableItem } from "../types";
import { warn } from "../utils/logger";

// 991px is screen-sm-max; matches the desktop/mobile page size split in
// inventoryController. This is the number of items VISIBLE per page.
const getPageSize = (): number => (window.innerWidth < 991 ? 12 : 10);

// Items requested per API call. The v2 tradableItems endpoint paginates whole
// item *types*, each of which can expand to several owned `instances`, so the
// flattened instance count per response is not a fixed number. We fetch a
// larger buffer and paginate the flattened instances client-side to display
// exactly `pageSize` per page (mirroring Angular's cursorPaginationService,
// which loads `loadPageSize` and shows `pageSize`).
const LOAD_SIZE = tradesConstants.getTradableItemsLimit;

export type InventoryPager = {
  items: TradableItem[];
  loading: boolean;
  loadFailed: boolean;
  filter: string;
  /** Raw search-input value; updates on every keystroke. */
  search: string;
  /** The (debounced) query the currently displayed items were fetched with. */
  appliedSearch: string;
  hasPrev: boolean;
  hasNext: boolean;
  /** 1-based number of the currently displayed page. */
  page: number;
  setFilter: (value: string) => void;
  setSearch: (value: string) => void;
  loadNext: () => void;
  loadPrev: () => void;
};

/**
 * Port of inventoryController: cursor pagination over a single user's tradable
 * items with a category filter and an item-name search. Fetched item instances
 * are buffered and sliced into fixed-size visible pages; more is fetched from
 * the API only when the buffer can't cover the next page.
 */
export const useInventoryPager = (userId: number): InventoryPager => {
  const [items, setItems] = useState<TradableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filter, setFilterState] = useState("");
  const [search, setSearch] = useState("");
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);

  // Each keystroke would otherwise restart pagination from a new cursor.
  const appliedSearch = useDebounce(search.trim(), tradesConstants.inventorySearchDebounceMs);

  const pageSizeRef = useRef(getPageSize());
  // Flattened instances fetched so far.
  const bufferRef = useRef<TradableItem[]>([]);
  // Zero-based index of the currently displayed visible page.
  const pageIndexRef = useRef(0);
  // Cursor for the next API page; null once the API is exhausted.
  const cursorRef = useRef<string | null>(null);
  // Guards against out-of-order responses when the filter/user changes.
  const requestIdRef = useRef(0);

  // Publish the current visible page (a slice of the buffer) plus nav flags.
  const publishPage = useCallback(() => {
    const pageSize = pageSizeRef.current;
    const start = pageIndexRef.current * pageSize;
    const buffer = bufferRef.current;
    setItems(buffer.slice(start, start + pageSize));
    setHasPrev(pageIndexRef.current > 0);
    setHasNext(buffer.length > start + pageSize || cursorRef.current !== null);
    setPage(pageIndexRef.current + 1);
  }, []);

  // Fetch one API page and append its instances to the buffer. Returns false if
  // the response is stale (a newer request superseded it).
  const fetchMore = useCallback(
    async (categoryFilter: string, searchQuery: string, requestId: number): Promise<boolean> => {
      const cursor = cursorRef.current || undefined;
      const response = await getInventoryPage(userId, {
        itemTargetType: categoryFilter || undefined,
        cursor,
        limit: LOAD_SIZE,
        search: searchQuery || undefined,
      });
      if (requestIdRef.current !== requestId) {
        return false;
      }
      bufferRef.current = [...bufferRef.current, ...response.items];
      cursorRef.current = response.nextPageCursor;
      return true;
    },
    [userId],
  );

  const reset = useCallback(
    (categoryFilter: string, searchQuery: string) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      bufferRef.current = [];
      pageIndexRef.current = 0;
      cursorRef.current = null;
      setItems([]);
      setHasPrev(false);
      setHasNext(false);
      setPage(1);
      setLoadFailed(false);
      setLoading(true);

      fetchMore(categoryFilter, searchQuery, requestId)
        .then(ok => {
          if (!ok) {
            return;
          }
          publishPage();
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (requestIdRef.current !== requestId) {
            return;
          }
          warn("useInventoryPager: failed to load inventory for user", userId, err);
          setLoading(false);
          setLoadFailed(true);
        });
    },
    [fetchMore, publishPage, userId],
  );

  // Initial load (and reload when the panel remounts for a new user).
  useEffect(() => {
    reset("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Refetch once typing settles. The ref guard keeps a filter change (which
  // resets on its own) from triggering a second, duplicate fetch here.
  const lastAppliedSearchRef = useRef(appliedSearch);
  useEffect(() => {
    if (lastAppliedSearchRef.current === appliedSearch) {
      return;
    }
    lastAppliedSearchRef.current = appliedSearch;
    reset(filter, appliedSearch);
  }, [appliedSearch, filter, reset]);

  const setFilter = useCallback(
    (value: string) => {
      setFilterState(value);
      reset(value, appliedSearch);
    },
    [appliedSearch, reset],
  );

  const loadNext = useCallback(() => {
    if (loading) {
      return;
    }
    const pageSize = pageSizeRef.current;
    const nextPageStart = (pageIndexRef.current + 1) * pageSize;
    const nextPageEnd = nextPageStart + pageSize;
    const buffer = bufferRef.current;

    // Next page is already fully buffered (or the API is exhausted): just advance.
    if (
      buffer.length >= nextPageEnd ||
      (cursorRef.current === null && buffer.length > nextPageStart)
    ) {
      pageIndexRef.current += 1;
      publishPage();
      return;
    }

    // No more items to show.
    if (cursorRef.current === null) {
      return;
    }

    const requestId = requestIdRef.current;
    setLoading(true);

    const fillNextPage = async (): Promise<void> => {
      while (bufferRef.current.length < nextPageEnd && cursorRef.current !== null) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await fetchMore(filter, appliedSearch, requestId);
        if (!ok) {
          return;
        }
      }
    };

    fillNextPage()
      .then(() => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        if (bufferRef.current.length > nextPageStart) {
          pageIndexRef.current += 1;
        }
        publishPage();
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== requestId) {
          return;
        }
        warn("useInventoryPager: failed to load inventory for user", userId, err);
        setLoading(false);
        setLoadFailed(true);
      });
  }, [appliedSearch, filter, loading, fetchMore, publishPage, userId]);

  const loadPrev = useCallback(() => {
    if (loading || pageIndexRef.current <= 0) {
      return;
    }
    pageIndexRef.current -= 1;
    publishPage();
  }, [loading, publishPage]);

  return {
    items,
    loading,
    loadFailed,
    filter,
    search,
    appliedSearch,
    hasPrev,
    hasNext,
    page,
    setFilter,
    setSearch,
    loadNext,
    loadPrev,
  };
};

export default useInventoryPager;

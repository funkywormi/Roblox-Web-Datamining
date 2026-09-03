import { useCallback, useRef, useState } from "react";
import tradesConstants from "../constants/tradesConstants";
import { getTrades } from "../services/tradesApi";
import { TradeStatusType, TradeSummary } from "../types";

// Cursor-based infinite-scroll pager for the trades list. Replaces the Angular
// cursorPaginationServiceV2 usage in tradesListController.

export type TradesPager = {
  trades: TradeSummary[];
  loading: boolean;
  noResults: boolean;
  /** Whether the API reported another page after the last load. */
  hasMore: boolean;
  /**
   * True when the most recent page load rejected. Consumers use this to stop
   * auto-loading (the non-scrollable auto-fill effect) so a failing request
   * doesn't spin into an unbounded retry loop. Cleared at the start of the next
   * load, so a user-driven scroll can still retry.
   */
  loadFailed: boolean;
  loadFirstPage: (status: TradeStatusType) => Promise<TradeSummary[]>;
  loadNextPage: () => Promise<TradeSummary[]>;
  removeTrade: (tradeId: number) => void;
  setNoResults: (value: boolean) => void;
};

const dedupeById = (existing: TradeSummary[], incoming: TradeSummary[]): TradeSummary[] => {
  const seen = new Set(existing.map(trade => trade.id));
  return [...existing, ...incoming.filter(trade => !seen.has(trade.id))];
};

export const useTradesPager = (): TradesPager => {
  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // Refs mirror state so scroll handlers read fresh values without re-binding.
  const cursorRef = useRef<string | null>("");
  const statusRef = useRef<TradeStatusType>(tradesConstants.tradeStatusType.inbound);
  const loadingRef = useRef(false);

  const loadFirstPage = useCallback(async (status: TradeStatusType): Promise<TradeSummary[]> => {
    statusRef.current = status;
    cursorRef.current = "";
    loadingRef.current = true;
    setTrades([]);
    setNoResults(false);
    setHasMore(false);
    setLoadFailed(false);
    setLoading(true);

    try {
      const page = await getTrades({
        cursor: "",
        tradeStatusType: status,
        count: tradesConstants.tradesLoadedPerPage,
      });
      cursorRef.current = page.nextPageCursor;
      setTrades(page.items);
      setNoResults(page.items.length === 0);
      setHasMore(page.nextPageCursor != null);
      return page.items;
    } catch (error) {
      setLoadFailed(true);
      throw error;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const loadNextPage = useCallback(async (): Promise<TradeSummary[]> => {
    if (loadingRef.current || cursorRef.current === null || cursorRef.current === undefined) {
      return [];
    }

    loadingRef.current = true;
    // Clear any prior failure so a user-driven retry (scroll) can proceed; the
    // in-flight `loading` guard prevents the auto-fill effect from re-entering.
    setLoadFailed(false);
    setLoading(true);

    try {
      const page = await getTrades({
        cursor: cursorRef.current || "",
        tradeStatusType: statusRef.current,
        count: tradesConstants.tradesLoadedPerPage,
      });
      cursorRef.current = page.nextPageCursor;
      setTrades(previous => dedupeById(previous, page.items));
      setHasMore(page.nextPageCursor != null);
      return page.items;
    } catch (error) {
      // Leave `hasMore` untouched but flag the failure so the auto-fill effect
      // stops retrying (otherwise a non-scrollable list would loop forever).
      setLoadFailed(true);
      throw error;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const removeTrade = useCallback((tradeId: number) => {
    setTrades(previous => {
      const next = previous.filter(trade => trade.id !== tradeId);
      if (next.length === 0) {
        setNoResults(true);
      }
      return next;
    });
  }, []);

  return {
    trades,
    loading,
    noResults,
    hasMore,
    loadFailed,
    loadFirstPage,
    loadNextPage,
    removeTrade,
    setNoResults,
  };
};

export default useTradesPager;

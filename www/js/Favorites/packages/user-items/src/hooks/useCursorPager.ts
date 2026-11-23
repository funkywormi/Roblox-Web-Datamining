import { useReducer, useRef } from "react";
import { CursorPager, type PagingParameters } from "@rbx/core-scripts/util/cursor-pagination";
import type { AssetItem, PageResponse } from "../constants/types";

export const PAGE_SIZE = 30;
export const LOAD_PAGE_SIZE = 100;

export const pagerErrorTypes = {
  pagingParametersChanged: "pagingParametersChanged",
  getItemsFailure: "getItemsFailure",
  invalidPageNumber: "invalidPageNumber",
} as const;

export const getPagerErrorType = (error: unknown): unknown =>
  typeof error === "object" && error !== null && "type" in error ? error.type : undefined;

export const isPagerNoOp = (error: unknown): boolean => {
  const type = getPagerErrorType(error);
  return (
    type === pagerErrorTypes.pagingParametersChanged || type === pagerErrorTypes.invalidPageNumber
  );
};

export type AssetsPager = {
  canLoadNextPage: boolean;
  canLoadPreviousPage: boolean;
  currentPageNumber: number;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
};

const useCursorPager = <P extends { cursor: string }>(
  getItems: (pagingParameters: P & PagingParameters) => Promise<PageResponse>,
  onPageLoaded: (items: AssetItem[]) => void,
  onPageLoadError: (error: unknown) => void,
): {
  setPagingParametersAndLoadFirstPage: (parameters: P) => Promise<AssetItem[]>;
  assetsPager: AssetsPager;
} => {
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const getItemsRef = useRef(getItems);
  getItemsRef.current = getItems;
  const callbacksRef = useRef({ onPageLoaded, onPageLoadError });
  callbacksRef.current = { onPageLoaded, onPageLoadError };

  const pagerRef = useRef<CursorPager<AssetItem, P & PagingParameters> | null>(null);
  pagerRef.current ??= new CursorPager<AssetItem, P & PagingParameters>(
    PAGE_SIZE,
    LOAD_PAGE_SIZE,
    parameters => getItemsRef.current(parameters),
  );
  const pager = pagerRef.current;
  const failedRef = useRef(false);
  const canLoadNextPage = pager.canLoadNextPage && !failedRef.current;

  const settle = (promise: Promise<AssetItem[]>) => {
    failedRef.current = false;
    rerender();
    promise.then(rerender, (error: unknown) => {
      if (!isPagerNoOp(error)) {
        failedRef.current = true;
      }
      rerender();
    });
  };

  const track = (promise: Promise<AssetItem[]>) => {
    settle(promise);
    promise.then(
      items => {
        callbacksRef.current.onPageLoaded(items);
      },
      (error: unknown) => {
        callbacksRef.current.onPageLoadError(error);
      },
    );
  };

  const setPagingParametersAndLoadFirstPage = (parameters: P) => {
    const promise = pager.setPagingParametersAndLoadFirstPage({
      ...parameters,
      count: LOAD_PAGE_SIZE,
      pageNumber: 1,
    });
    settle(promise);
    return promise;
  };

  return {
    setPagingParametersAndLoadFirstPage,
    assetsPager: {
      canLoadNextPage,
      canLoadPreviousPage: pager.canLoadPreviousPage,
      currentPageNumber: pager.currentPageNumber,
      loadNextPage: () => {
        if (!canLoadNextPage) {
          return;
        }
        track(pager.loadNextPage());
      },
      loadPreviousPage: () => {
        if (!pager.canLoadPreviousPage) {
          return;
        }
        track(pager.loadPreviousPage());
      },
    },
  };
};

export default useCursorPager;

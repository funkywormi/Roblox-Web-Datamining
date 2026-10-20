import { useEffect } from "react";
import { createBrowserHistory } from "history";
import { QueryParamStore } from "@rbx/sdui-core";
import { subscribeToUrlChange } from "@rbx/www-common/navigation";
import { registerSduiClientRouter } from "../../sdui/v2/navigation/sduiClientRouter";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  serializeChartsFiltersToSearch,
  type ChartsRequestFilters,
} from "./chartsPageConfiguration";

export const chartsHistory = createBrowserHistory();

// Set when a resolved-filter write updates the URL. The page already rendered
// that response, so the following location change must not refetch it.
let echoedFilterSearch: string | null = null;

const chartsHistoryPath = (): string => {
  const { pathname, search, hash } = chartsHistory.location;
  return `${pathname}${search}${hash}`;
};

/** Sets the Charts history location to the current browser URL when it is stale or has no key. */
export function syncChartsHistoryWithWindow(): void {
  if (!browserWindow) {
    return;
  }

  const { pathname, search, hash } = browserWindow.location;
  const live = `${pathname}${search}${hash}`;
  if (live !== chartsHistoryPath() || chartsHistory.location.key == null) {
    chartsHistory.replace(live);
  }
}

/**
 * A user filter change is its own history entry so Back restores the previous
 * filters. Applying the selection already in the URL adds no entry.
 */
export function applyChartsFilter(filterSelections: ChartsRequestFilters): void {
  syncChartsHistoryWithWindow();
  const { pathname, search, hash } = chartsHistory.location;
  const nextSearch = serializeChartsFiltersToSearch(filterSelections, search);
  if (nextSearch === search) {
    return;
  }

  chartsHistory.push(`${pathname}${nextSearch}${hash}`);
}

export function replaceChartsUrlWithResolvedFilters(filters: ChartsRequestFilters): void {
  syncChartsHistoryWithWindow();
  if (!browserWindow) {
    return;
  }
  const { pathname, search, hash } = browserWindow.location;
  const nextSearch = serializeChartsFiltersToSearch(filters, search);
  if (nextSearch === search) {
    return;
  }

  echoedFilterSearch = nextSearch;
  chartsHistory.replace(`${pathname}${nextSearch}${hash}`);
}

export function isChartsFilterUrlEcho(search: string): boolean {
  return echoedFilterSearch === search;
}

export function clearChartsFilterUrlEcho(search: string): void {
  if (echoedFilterSearch === search) {
    echoedFilterSearch = null;
  }
}

/**
 * Keeps QueryParamStore in sync with same-document URL writes, and lends the
 * Charts history to SDUI action handlers for as long as the Charts routes are
 * mounted to render what those handlers push.
 */
export function useBindChartsSduiRouter(): void {
  useEffect(() => {
    QueryParamStore.getInstance().syncFromUrl();

    const unregisterRouter = registerSduiClientRouter({
      push: routePath => {
        chartsHistory.push(routePath);
      },
    });
    const unsubscribeFromUrlChange = subscribeToUrlChange(() => {
      QueryParamStore.getInstance().syncFromUrl();
    });

    return () => {
      unregisterRouter();
      unsubscribeFromUrlChange();
    };
  }, []);
}

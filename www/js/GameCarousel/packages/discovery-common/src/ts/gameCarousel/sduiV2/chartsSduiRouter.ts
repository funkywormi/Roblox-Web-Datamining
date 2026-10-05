import { useEffect } from "react";
import { createBrowserHistory } from "history";
import { QueryParamStore } from "@rbx/sdui-core";
import { subscribeToUrlChange } from "@rbx/www-common/navigation";
import { registerSduiClientRouter } from "../../sdui/v2/navigation/sduiClientRouter";
import {
  serializeChartsFiltersToSearch,
  type ChartsRequestFilters,
} from "./chartsPageConfiguration";

export const chartsHistory = createBrowserHistory();

export function applyChartsFilter(filterSelections: ChartsRequestFilters): void {
  const { pathname, search, hash } = chartsHistory.location;
  const nextSearch = serializeChartsFiltersToSearch(filterSelections, search);

  chartsHistory.replace(`${pathname}${nextSearch}${hash}`);
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

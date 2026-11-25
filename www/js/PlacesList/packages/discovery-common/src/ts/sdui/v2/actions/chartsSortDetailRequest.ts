import { buildSortDetailRelativeUrl, buildSortDetailUrl } from "../../../common/utils/browserUtils";
import { getChartsFilterQueryParamsFromSearch } from "../../../gameCarousel/sduiV2/chartsPageConfiguration";
import type { SortDetailRequest } from "./sortDetailDestination";

/** Charts sort page: `/charts` or `/charts/v2`, plus the active Charts filters. */
export const chartsSortDetailRequest: SortDetailRequest = {
  buildUrl: buildSortDetailUrl,
  buildRoutePath: buildSortDetailRelativeUrl,
  readQueryParams: () => {
    if (typeof window === "undefined") {
      return {};
    }

    return getChartsFilterQueryParamsFromSearch(window.location.search);
  },
};

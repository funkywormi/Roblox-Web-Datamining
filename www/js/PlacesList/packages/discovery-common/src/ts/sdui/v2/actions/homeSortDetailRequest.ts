import { buildSortDetailRelativeUrl, buildSortDetailUrl } from "../../../common/utils/browserUtils";
import { PageContext } from "../../../common/types/pageContext";
import type { SortDetailRequest } from "./sortDetailDestination";

/**
 * Home sort page: always `/charts/v2/{sort name}`, whichever page the action
 * fires on, and no Charts filters, because the Home sort page does not read them.
 */
export const homeSortDetailRequest: SortDetailRequest = {
  buildUrl: (sortId, _page, referralParams, queryParams) =>
    buildSortDetailUrl(sortId, PageContext.HomePage, referralParams, queryParams),
  buildRoutePath: (sortId, _page, referralParams, queryParams) =>
    buildSortDetailRelativeUrl(sortId, PageContext.HomePage, referralParams, queryParams),
  readQueryParams: () => ({}),
};

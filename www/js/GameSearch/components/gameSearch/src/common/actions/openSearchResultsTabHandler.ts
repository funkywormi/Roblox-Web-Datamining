import { window as browserWindow } from "@rbx/core-lib/browser";
import { UrlSearchParams } from "@rbx/core-lib/url";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  type AnalyticsContext,
  type SduiActionContext,
} from "@rbx/sdui-core";

const OPEN_SEARCH_RESULTS_TAB_ACTION_TYPE = actionTypeName(ActionType.OPEN_SEARCH_RESULTS_TAB);

const SEARCH_RESULTS_TAB_PATHS: Record<string, string> = {
  Games: "/discover/",
  Marketplace: "/catalog/",
  Players: "/search/users",
};

function readCurrentKeyword(): string {
  if (browserWindow === undefined) {
    return "";
  }
  // Unsanitized: the value only goes through encodeURIComponent, and a search for "constructor" or
  // "prototype" must survive a tab switch since they are valid searches
  return UrlSearchParams.parse(browserWindow.location.search, false).get("keyword") ?? "";
}

export function openSearchResultsTabResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  _analyticsContext?: AnalyticsContext,
): string | undefined {
  const { searchType } = actionParams;
  const path = typeof searchType === "string" ? SEARCH_RESULTS_TAB_PATHS[searchType] : undefined;
  if (path === undefined) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      `Unsupported searchType=${String(searchType)} for OPEN_SEARCH_RESULTS_TAB resolveHref`,
      ctx.pageContext,
      { actionType: OPEN_SEARCH_RESULTS_TAB_ACTION_TYPE, propName: "searchType" },
    );
    return undefined;
  }

  return getAbsoluteUrl(`${path}?keyword=${encodeURIComponent(readCurrentKeyword())}`);
}

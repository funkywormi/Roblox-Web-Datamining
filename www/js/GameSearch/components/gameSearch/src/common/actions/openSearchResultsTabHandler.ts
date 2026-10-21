import { window as browserWindow } from "@rbx/core-lib/browser";
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
  for (const [name, value] of new URLSearchParams(browserWindow.location.search)) {
    if (name.toLowerCase() === "keyword") {
      return value;
    }
  }
  return "";
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

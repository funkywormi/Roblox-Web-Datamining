import { window as browserWindow } from "@rbx/core-lib/browser";
import { UrlSearchParams } from "@rbx/core-lib/url";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { SessionInfoType } from "@rbx/discovery-common/telemetry";
import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  type AnalyticsContext,
  type SduiActionContext,
} from "@rbx/sdui-core";

const OPEN_SEARCH_RESULTS_TAB_ACTION_TYPE = actionTypeName(ActionType.OPEN_SEARCH_RESULTS_TAB);

const GAMES_SEARCH_TYPE = "Games";

const SEARCH_RESULTS_TAB_PATHS: Record<string, string> = {
  [GAMES_SEARCH_TYPE]: "/discover/",
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
  const { sessionStore } = ctx;
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

  const keyword = encodeURIComponent(readCurrentKeyword());
  // Carry the Top Results search session so impressions and plays on that page
  // stay in the same search session even when opening in a new tab/window.
  const omniSearchSessionId =
    searchType === GAMES_SEARCH_TYPE
      ? sessionStore.get(SessionInfoType.OmniSearchSessionInfo)
      : undefined;
  const sessionQuery =
    omniSearchSessionId === undefined
      ? ""
      : `&${SessionInfoType.OmniSearchSessionInfo}=${encodeURIComponent(omniSearchSessionId)}`;

  return getAbsoluteUrl(`${path}?keyword=${keyword}${sessionQuery}`);
}

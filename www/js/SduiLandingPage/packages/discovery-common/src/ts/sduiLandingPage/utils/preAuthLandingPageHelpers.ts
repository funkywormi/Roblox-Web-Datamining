import { SduiTargetedRefreshInput } from "@rbx/sdui-core";
import bedev2Constants from "../../common/constants/bedev2Constants";
import { Url } from "@rbx/core-lib/url";

/** Refresh param written by the `REFRESH_FEED_ENTRY_FROM_API` action handler. */
const SELECTED_OPTION_IDS_PARAM = "selectedOptionIds";
/** Query param the backend reads the same values from. */
const SELECTED_OPTIONS_QUERY_PARAM = "selectedOptions";

function readSelectedOptions(target: SduiTargetedRefreshInput): readonly string[] {
  const value = target.requestParams?.[SELECTED_OPTION_IDS_PARAM];
  const values = typeof value === "string" ? [value] : value;
  if (!Array.isArray(values)) {
    return [];
  }
  return values.filter((option): option is string => typeof option === "string" && option !== "");
}

/**
 * `pre-auth-landing` accepts a single option filter, identified by the page
 * entry and feed entry being filtered plus at least one selected option.
 * Returning `undefined` for any other target shape leaves the surface on the
 * full-page refresh path instead of issuing a request the backend rejects.
 */
export function buildPreAuthLandingOptionFilterUrl(
  targets: readonly SduiTargetedRefreshInput[],
  sessionId?: string,
): Url | undefined {
  const [target] = targets;
  if (targets.length !== 1 || !target) {
    return undefined;
  }

  const [pageEntryIdentifier, feedEntryIdentifier] = target.identifierPath;
  if (!pageEntryIdentifier || !feedEntryIdentifier) {
    return undefined;
  }

  const selectedOptions = readSelectedOptions(target);
  if (selectedOptions.length === 0) {
    return undefined;
  }

  const { url } = bedev2Constants.url.getPreAuthLandingPage();
  return Url.parse(url)
    .getOrThrow()
    .withSearchParams({
      ...(sessionId ? { sessionId } : {}),
      pageEntryIdentifier,
      feedEntryIdentifier,
    })
    .withSearchParamsAppended(
      selectedOptions.map(option => [SELECTED_OPTIONS_QUERY_PARAM, option] as const),
    );
}

export default { buildPreAuthLandingOptionFilterUrl };

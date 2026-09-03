import { EventContext, SessionInfo, parseEventParams } from "@rbx/unified-logging";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { PageContext } from "../../common/types/pageContext";
import { TAnalyticsContext, TAnalyticsData, TSduiPageContext } from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "./logSduiError";

/**
 * Parse a string field from a string, number, or boolean input.
 * Returns the default value if the input is not a valid string or undefined.
 */
export const parseStringField = (
  input: string | number | boolean | undefined,
  defaultValue: string,
): string => {
  if (input !== undefined && (typeof input === "number" || typeof input === "boolean")) {
    return input.toString();
  }

  if (input !== undefined && typeof input === "string") {
    return input;
  }

  return defaultValue;
};

/**
 * Parse a number field from a string, number, or boolean input.
 * Returns the default value if the input is not a valid number or undefined.
 */
export const parseMaybeStringNumberField = (
  input: string | number | boolean | undefined,
  defaultValue: number,
): number => {
  if (typeof input === "number") {
    return input;
  }

  if (typeof input === "string") {
    const parsed = parseInt(input, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return defaultValue;
};

/**
 * Parse a boolean field from a string, number, or boolean input.
 * Returns the default value if the input is not a valid boolean or undefined.
 */
export const parseBooleanField = (
  input: string | number | boolean | undefined,
  defaultValue: boolean,
  pageContext: TSduiPageContext,
): boolean => {
  if (typeof input === "boolean") {
    return input;
  }

  if (typeof input === "string") {
    const loweredInput = input.toLowerCase();
    if (loweredInput === "true" || loweredInput === "t") {
      return true;
    }
    if (loweredInput === "false" || loweredInput === "f") {
      return false;
    }

    logSduiError(
      SduiErrorNames.ParseBooleanFieldInvalidString,
      `Invalid string value for boolean field: ${input}`,
      pageContext,
    );

    return defaultValue;
  }

  if (typeof input === "number") {
    if (input === 1) {
      return true;
    }
    if (input === 0) {
      return false;
    }

    logSduiError(
      SduiErrorNames.ParseBooleanFieldInvalidNumber,
      `Invalid number value for boolean field: ${input}`,
      pageContext,
    );

    return defaultValue;
  }

  logSduiError(
    SduiErrorNames.ParseBooleanFieldInvalidType,
    `Invalid type for boolean field: ${typeof input}, input: ${
      input ? JSON.stringify(input) : "undefined"
    }`,
    pageContext,
  );

  return defaultValue;
};

/**
 * Validate that the input value is a string, number, or boolean value.
 */
export const isStringNumberOrBooleanValue = (
  value: unknown,
): value is string | number | boolean => {
  return (
    value !== undefined &&
    value !== null &&
    (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
  );
};

/**
 * Filter out any invalid (unknown type) event parameters.
 * Resulting object only contains string/number/boolean params.
 */
export const filterInvalidEventParams = (
  params: Record<string, unknown>,
  pageContext: TSduiPageContext,
): TAnalyticsData => {
  const validParams: TAnalyticsData = {};

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (isStringNumberOrBooleanValue(value)) {
      validParams[key] = value;
    } else {
      logSduiError(
        SduiErrorNames.AnalyticsParsingDiscardedInvalidParam,
        `Discarding invalid event parameter key: ${key}, value: ${JSON.stringify(
          value,
        )}, type: ${typeof value}`,
        pageContext,
      );
    }
  });

  return validParams;
};

type TPageSessionAnalyticsData = {
  [SessionInfo.HomePageSessionInfo]?: string;
  [SessionInfo.DiscoverPageSessionInfo]?: string;
  [SessionInfo.SpotlightPageSessionInfo]?: string;
  [SessionInfo.PreAuthLandingPageSessionInfo]?: string;
};

export const getSessionInfoKey = (
  pageContext: TSduiPageContext,
):
  | SessionInfo.HomePageSessionInfo
  | SessionInfo.DiscoverPageSessionInfo
  | SessionInfo.SpotlightPageSessionInfo
  | SessionInfo.PreAuthLandingPageSessionInfo
  | null => {
  const currentPage = pageContext.pageName;
  switch (currentPage) {
    case PageContext.HomePage:
      return SessionInfo.HomePageSessionInfo;
    case PageContext.GamesPage:
      return SessionInfo.DiscoverPageSessionInfo;
    case PageContext.SongListPage:
      return SessionInfo.DiscoverPageSessionInfo;
    case PageContext.SpotlightPage:
      return SessionInfo.SpotlightPageSessionInfo;
    case PageContext.PreAuthLandingPage:
      return SessionInfo.PreAuthLandingPageSessionInfo;
    default:
      logSduiError(
        SduiErrorNames.SessionInfoKeyNotFound,
        `Session info key not found for page: ${
          currentPage ? JSON.stringify(currentPage) : "undefined"
        }`,
        pageContext,
      );
      return null;
  }
};

export const buildSessionAnalyticsData = (
  pageSessionInfo: string,
  pageContext: TSduiPageContext,
): TPageSessionAnalyticsData => {
  const currentPage = pageContext.pageName;
  const sessionInfoKey = getSessionInfoKey(pageContext);
  if (!sessionInfoKey) {
    logSduiError(
      SduiErrorNames.InvalidPageForSessionAnalytics,
      `Invalid page context for session analytics: ${
        currentPage ? JSON.stringify(currentPage) : "undefined"
      } with session info: ${pageSessionInfo}`,
      pageContext,
    );
    return {};
  }

  return {
    [sessionInfoKey]: pageSessionInfo,
  };
};

export const getEventContext = (pageContext: TSduiPageContext): EventContext | null => {
  const currentPage = pageContext.pageName;
  const ERROR_EVENT_NAME = "webDiscoverySduiError";

  switch (currentPage) {
    case PageContext.HomePage:
      return EventContext.Home;
    case PageContext.GamesPage:
      return EventContext.Games;
    case PageContext.SpotlightPage:
      return EventContext.Spotlight;
    case PageContext.SongListPage:
      return EventContext.SongList;
    case PageContext.GameDetailPage:
      return EventContext.GameDetail;
    case PageContext.PreAuthLandingPage:
      return EventContext.PreAuthLanding;
    default:
      // direct logging to event stream to avoid recursive calls on
      // getEventContext <-> logSduiError <-> getEventContext
      sendEvent(
        {
          name: ERROR_EVENT_NAME,
          type: ERROR_EVENT_NAME,
          context: pageContext.pageName,
        },
        parseEventParams({
          errorName: SduiErrorNames.InvalidEventContextForPage,
          errorMessage: `Page context does not have a valid event context: ${
            currentPage ? JSON.stringify(currentPage) : "undefined"
          }`,
        }),
      );
      return null;
  }
};

export const findAnalyticsFieldInAncestors = (
  fieldKey: string,
  analyticsContext: TAnalyticsContext,
  defaultValue: string | number | boolean,
): string | number | boolean => {
  if (
    analyticsContext.analyticsData &&
    analyticsContext.analyticsData[fieldKey] !== undefined &&
    analyticsContext.analyticsData[fieldKey] !== null
  ) {
    return analyticsContext.analyticsData[fieldKey];
  }

  if (
    analyticsContext.ancestorAnalyticsData &&
    analyticsContext.ancestorAnalyticsData[fieldKey] !== undefined &&
    analyticsContext.ancestorAnalyticsData[fieldKey] !== null
  ) {
    return analyticsContext.ancestorAnalyticsData[fieldKey];
  }

  return defaultValue;
};

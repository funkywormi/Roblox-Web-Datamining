import {
  SduiErrorName,
  findAnalyticsFieldInAncestors,
  type AnalyticsContext,
  type SduiActionContext,
  type SduiPageContext,
} from "@rbx/sdui-core";

import {
  EventStreamMetadata,
  SessionInfoType,
  type TCommonReferralParams,
  type TSortDetailReferral,
} from "../../../common/constants/eventStreamConstants";
import { TTreatmentType } from "../../../common/types/bedev2Types";
import { PageContext } from "../../../common/types/pageContext";
import { getGameSetTargetIdMetadata } from "../../../common/utils/gameSetTargetIdUtils";
import { parseMaybeStringNumberField, parseStringField } from "../../utils/analyticsParsingUtils";
import {
  filterInvalidEventParams,
  type AnalyticsFieldValue,
} from "../utils/filterInvalidEventParams";
import { getCommonReferralParams } from "../utils/getCommonReferralParams";
import { buildSessionAnalyticsData, getSessionInfoKey } from "../utils/pageReferralUtils";

/** The sort page an action opens. */
export type SortDetailTarget = {
  sortId: string;
  gameSetTargetId: AnalyticsFieldValue | undefined;
};

/** How one action type names the sort it opens. */
export type SortDetailAction = {
  /** Proto action name, used in error messages. */
  name: string;
  actionType: string;
  sortIdParamName: string;
  readTarget: (actionParams: Record<string, AnalyticsFieldValue>) => SortDetailTarget | undefined;
};

export type SortDetailUrlBuilder = (
  sortId: string,
  page: PageContext.HomePage | PageContext.GamesPage,
  referralParams: TSortDetailReferral,
  queryParams: Record<string, string>,
) => string;

/**
 * Where the sort page lives. Callers pass this in because Home and Charts do
 * not share a base URL, and only Charts has filter query params to forward.
 */
export type SortDetailRequest = {
  buildUrl: SortDetailUrlBuilder;
  buildRoutePath: SortDetailUrlBuilder;
  readQueryParams: () => Record<string, string>;
};

export type SortDetailResolver = (
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
) => string | undefined;

function getSortDetailUrlPage(
  pageContext: SduiPageContext,
): PageContext.HomePage | PageContext.GamesPage {
  if (
    pageContext.pageName === PageContext.HomePage ||
    pageContext.pageName === PageContext.GamesPage
  ) {
    return pageContext.pageName;
  }

  if (
    pageContext.appPage === PageContext.HomePage ||
    pageContext.appPage === PageContext.GamesPage
  ) {
    return pageContext.appPage;
  }

  return PageContext.GamesPage;
}

function readSortDetailSessionParams(
  commonReferralParams: TCommonReferralParams,
  pageContext: SduiPageContext,
): Partial<TCommonReferralParams> {
  const sessionInfoKey = getSessionInfoKey(pageContext);
  if (
    sessionInfoKey !== SessionInfoType.DiscoverPageSessionInfo &&
    sessionInfoKey !== SessionInfoType.HomePageSessionInfo
  ) {
    return {};
  }

  return buildSessionAnalyticsData(
    parseStringField(commonReferralParams[sessionInfoKey], ""),
    pageContext,
  );
}

function buildSortDetailReferralParams(
  gameSetTargetId: AnalyticsFieldValue | undefined,
  analyticsContext: AnalyticsContext | undefined,
  pageContext: SduiPageContext,
): TSortDetailReferral {
  const commonReferralParams = getCommonReferralParams(analyticsContext, pageContext);

  const parsedGameSetTypeId = parseMaybeStringNumberField(
    commonReferralParams[EventStreamMetadata.GameSetTypeId],
    -1,
  );
  const gameSetTypeId: number =
    parsedGameSetTypeId >= 0
      ? parsedGameSetTypeId
      : parseMaybeStringNumberField(
          findAnalyticsFieldInAncestors("gameSetTypeId", analyticsContext, -1),
          -1,
        );

  return {
    // See All `position` is the carousel row. `getCommonReferralParams` already
    // converts that 1-based collection position into the 0-based `sortPos`.
    [EventStreamMetadata.Position]: commonReferralParams[EventStreamMetadata.SortPos],
    [EventStreamMetadata.GameSetTypeId]: gameSetTypeId,
    [EventStreamMetadata.SortId]: gameSetTypeId,
    [EventStreamMetadata.TreatmentType]: TTreatmentType.Carousel,
    ...getGameSetTargetIdMetadata(gameSetTargetId),
    ...readSortDetailSessionParams(commonReferralParams, pageContext),
    [EventStreamMetadata.Page]: getSortDetailUrlPage(pageContext),
  } as TSortDetailReferral;
}

function resolveSortDetailDestination(
  action: SortDetailAction,
  request: SortDetailRequest,
  buildUrl: SortDetailUrlBuilder,
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
): string | undefined {
  const target = action.readTarget(filterInvalidEventParams(actionParams));
  if (target === undefined) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      `Missing or invalid ${action.sortIdParamName} for ${action.name} resolveHref`,
      ctx.pageContext,
      {
        actionType: action.actionType,
        propName: action.sortIdParamName,
      },
    );
    return undefined;
  }

  return buildUrl(
    target.sortId,
    getSortDetailUrlPage(ctx.pageContext),
    buildSortDetailReferralParams(target.gameSetTargetId, analyticsContext, ctx.pageContext),
    request.readQueryParams(),
  );
}

/** Absolute href and in-app route path for one action type and one sort page. */
export function makeSortDetailResolvers(
  action: SortDetailAction,
  request: SortDetailRequest,
): {
  resolveHref: SortDetailResolver;
  resolveRoutePath: SortDetailResolver;
} {
  return {
    resolveHref: (actionParams, ctx, analyticsContext) =>
      resolveSortDetailDestination(
        action,
        request,
        request.buildUrl,
        actionParams,
        ctx,
        analyticsContext,
      ),
    resolveRoutePath: (actionParams, ctx, analyticsContext) =>
      resolveSortDetailDestination(
        action,
        request,
        request.buildRoutePath,
        actionParams,
        ctx,
        analyticsContext,
      ),
  };
}

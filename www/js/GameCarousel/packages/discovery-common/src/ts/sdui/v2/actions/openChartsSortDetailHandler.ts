import {
  ActionType,
  SduiErrorName,
  actionTypeName,
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
import { buildSortDetailRelativeUrl, buildSortDetailUrl } from "../../../common/utils/browserUtils";
import { getGameSetTargetIdMetadata } from "../../../common/utils/gameSetTargetIdUtils";
import { getChartsFilterQueryParamsFromSearch } from "../../../gameCarousel/sduiV2/chartsPageConfiguration";
import { parseMaybeStringNumberField, parseStringField } from "../../utils/analyticsParsingUtils";
import { filterInvalidEventParams } from "../utils/filterInvalidEventParams";
import { findAnalyticsFieldInAncestors } from "../utils/findAnalyticsFieldInAncestors";
import { getCommonReferralParams } from "../utils/getCommonReferralParams";
import { buildSessionAnalyticsData, getSessionInfoKey } from "../utils/pageReferralUtils";
import { readSortIdFromAction } from "../utils/readSortIdFromAction";

const OPEN_CHARTS_SORT_DETAIL_ACTION_TYPE = actionTypeName(ActionType.OPEN_CHARTS_SORT_DETAIL);

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

function readChartsFilterQueryParams(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  return getChartsFilterQueryParamsFromSearch(window.location.search);
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

function buildChartsSortDetailReferralParams(
  actionParams: Record<string, unknown>,
  analyticsContext: AnalyticsContext | undefined,
  pageContext: SduiPageContext,
): TSortDetailReferral {
  const commonReferralParams = getCommonReferralParams(analyticsContext, pageContext);
  const filteredActionParams = filterInvalidEventParams(actionParams);

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
    ...getGameSetTargetIdMetadata(
      filteredActionParams.secondarySortId ?? filteredActionParams.secondary_sort_id,
    ),
    ...readSortDetailSessionParams(commonReferralParams, pageContext),
    [EventStreamMetadata.Page]: getSortDetailUrlPage(pageContext),
  } as TSortDetailReferral;
}

type SortDetailUrlBuilder = typeof buildSortDetailUrl;

function resolveChartsSortDetailDestination(
  buildUrl: SortDetailUrlBuilder,
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
): string | undefined {
  const sortId = readSortIdFromAction(actionParams);
  if (sortId === undefined) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      "Missing or invalid sortId for OPEN_CHARTS_SORT_DETAIL resolveHref",
      ctx.pageContext,
      {
        actionType: OPEN_CHARTS_SORT_DETAIL_ACTION_TYPE,
        propName: "sortId",
      },
    );
    return undefined;
  }

  return buildUrl(
    sortId,
    getSortDetailUrlPage(ctx.pageContext),
    buildChartsSortDetailReferralParams(actionParams, analyticsContext, ctx.pageContext),
    readChartsFilterQueryParams(),
  );
}

export function openChartsSortDetailResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
): string | undefined {
  return resolveChartsSortDetailDestination(
    buildSortDetailUrl,
    actionParams,
    ctx,
    analyticsContext,
  );
}

export function openChartsSortDetailResolveRoutePath(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
): string | undefined {
  return resolveChartsSortDetailDestination(
    buildSortDetailRelativeUrl,
    actionParams,
    ctx,
    analyticsContext,
  );
}

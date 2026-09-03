import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { attachRelativeUrlLocale } from "@rbx/core-scripts/endpoints";
import { game } from "@rbx/core-scripts/entity-url";
import {
  getUrlWithQueries,
  getAbsoluteUrl,
  getRelativeUrlWithQueries,
} from "@rbx/core-scripts/util/url";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import { url } from "../constants/browserConstants";
import { TSortDetailReferral, TGameDetailReferral } from "../constants/eventStreamConstants";
import { PageContext } from "../types/pageContext";
import { getAbuseReportRevampUrl } from "../constants/abuseReportConstants";

export const buildGameDetailUrl = (
  placeId: number,
  placeName: string,
  eventProperties: TGameDetailReferral = {},
  canonicalUrlPath?: string,
): string => {
  const basePath =
    canonicalUrlPath || `${game.getRelativePath(placeId)}/${formatSeoName(placeName)}`;
  return getUrlWithQueries(basePath, eventProperties);
};

export const buildAddGamePassUrl = (placeId: string): string => {
  const parsedParams = {
    selectedPlaceId: placeId,
    Page: "game-passes",
  };
  const addGamePassUrl = getUrlWithQueries("/develop", parsedParams);
  return addGamePassUrl;
};

export const buildGamePassDetailUrl = (passId: string, passName: string): string => {
  return getAbsoluteUrl(`/game-pass/${passId}/${formatSeoName(passName)}`);
};

export const buildReportAbuseRevampUrl = ({
  placeId,
  universeId,
}: {
  placeId: string;
  universeId: string;
}): string => {
  const reportAbuseUrl = getAbuseReportRevampUrl({
    targetId: placeId,
    submitterId: authenticatedUser()?.id?.toString() ?? "",
    abuseVector: "place",
    universeId,
  });
  return reportAbuseUrl;
};

const getSortDetailBaseUrl = (
  sortName: string,
  pageContext: PageContext.HomePage | PageContext.GamesPage,
): string => {
  const encodedSortName = encodeURIComponent(sortName);

  switch (pageContext) {
    case PageContext.HomePage:
      return url.sortDetailV2(encodedSortName);
    case PageContext.GamesPage: {
      return url.sortDetail(encodedSortName);
    }
    default:
      return url.sortDetailV2(encodedSortName);
  }
};

export const buildSortDetailUrl = (
  sortName: string,
  pageContext: PageContext.HomePage | PageContext.GamesPage,
  eventProperties: TSortDetailReferral = {},
  additionalUrlParams: Record<string, string> = {},
): string => {
  const baseUrl = getSortDetailBaseUrl(sortName, pageContext);

  return getUrlWithQueries(baseUrl, { ...eventProperties, ...additionalUrlParams });
};

export const buildSortDetailRelativeUrl = (
  sortName: string,
  pageContext: PageContext.HomePage | PageContext.GamesPage,
  eventProperties: TSortDetailReferral = {},
  additionalUrlParams: Record<string, string> = {},
): string => {
  return attachRelativeUrlLocale(
    getRelativeUrlWithQueries(`/${getSortDetailBaseUrl(sortName, pageContext)}`, {
      ...eventProperties,
      ...additionalUrlParams,
    }),
  );
};

export const buildEventDetailsUrl = (eventId: string): string => {
  return getAbsoluteUrl(`/events/${eventId}`);
};

export const getElementWidth = <T extends HTMLElement>(element: T): number => {
  const { marginLeft, marginRight } = window.getComputedStyle(element);
  const { width: domRectWidth } = element.getBoundingClientRect();
  return domRectWidth + (parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0);
};

export const isElementInWindow = <T extends HTMLElement>(element: T): boolean => {
  const { top: domRectTop, height: domRectHeight } = element.getBoundingClientRect();
  return domRectTop + domRectHeight / 2 > 0 && window.innerHeight > domRectTop + domRectHeight / 2;
};

export const getHttpReferrer = (): string => document.referrer;

export default {
  buildAddGamePassUrl,
  buildReportAbuseRevampUrl,
  buildSortDetailUrl,
  buildSortDetailRelativeUrl,
  buildGameDetailUrl,
  isElementInWindow,
  buildEventDetailsUrl,
  getElementWidth,
  getHttpReferrer,
};

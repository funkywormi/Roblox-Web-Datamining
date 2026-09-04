import type { SduiPageContext } from "@rbx/sdui-core";

import {
  EventStreamMetadata,
  SessionInfoType,
  type TCommonReferralParams,
} from "../../../common/constants/eventStreamConstants";
import { PageContext } from "../../../common/types/pageContext";
import type { TSduiPageContext } from "../../system/SduiTypes";

export function getSessionInfoKey(pageContext: SduiPageContext): SessionInfoType | null {
  const pageKey = pageContext.pageName;

  switch (pageKey) {
    case PageContext.HomePage:
      return SessionInfoType.HomePageSessionInfo;
    case PageContext.GamesPage:
    case PageContext.SongListPage:
      return SessionInfoType.DiscoverPageSessionInfo;
    case PageContext.SpotlightPage:
      return SessionInfoType.SpotlightPageSessionInfo;
    case PageContext.PreAuthLandingPage:
      return SessionInfoType.PreAuthLandingPageSessionInfo;
    default:
      return null;
  }
}

export function resolvePageForReferral(
  pageContext: SduiPageContext,
): TCommonReferralParams[typeof EventStreamMetadata.Page] {
  return pageContext.pageName as TCommonReferralParams[typeof EventStreamMetadata.Page];
}

export function buildSessionAnalyticsData(
  pageSessionInfo: string,
  pageContext: SduiPageContext,
): Partial<TCommonReferralParams> {
  const sessionInfoKey = getSessionInfoKey(pageContext);
  if (!sessionInfoKey || pageSessionInfo === "") {
    return {};
  }

  return {
    [sessionInfoKey]: pageSessionInfo,
  };
}

export function toV1PageContext(pageContext: SduiPageContext): TSduiPageContext {
  return {
    pageName: pageContext.pageName as TSduiPageContext["pageName"],
  };
}

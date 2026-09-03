import { SessionInfoType, TDiscoverySessionInfo } from "../constants/eventStreamConstants";
import { PageContext } from "../types/pageContext";
import { getQueryParamIfString } from "./parsingUtils";

const isPageContext = (page: string): page is PageContext => {
  return Object.values(PageContext).includes(page as PageContext);
};

const extractReferralInfo = (): {
  referralSessionInfo: TDiscoverySessionInfo;
  referralPage: PageContext | undefined;
} => {
  const sessionInfo: TDiscoverySessionInfo = {};

  // Look for any session params in the query string, and add valid session strings to the output object
  Object.values(SessionInfoType).forEach(sessionKey => {
    const sessionParam = getQueryParamIfString(sessionKey);

    if (sessionParam) {
      sessionInfo[sessionKey] = sessionParam;
    }
  });

  const pageParam = getQueryParamIfString("page");
  if (pageParam && isPageContext(pageParam)) {
    return {
      referralSessionInfo: sessionInfo,
      referralPage: pageParam,
    };
  }

  return {
    referralSessionInfo: sessionInfo,
    referralPage: undefined,
  };
};

export default {
  extractReferralInfo,
};

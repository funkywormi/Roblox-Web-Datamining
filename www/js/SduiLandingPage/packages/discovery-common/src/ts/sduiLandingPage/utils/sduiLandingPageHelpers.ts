import { EventStreamMetadata } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

export const getSubPageAnalyticsData = (
  appPage: PageContext | undefined,
): Record<string, string> => {
  const subPageName = window?.location?.pathname?.split("/").pop() ?? "";
  return appPage === PageContext.SpotlightPage
    ? {
        [EventStreamMetadata.SubPageName]: subPageName,
      }
    : {};
};

export default {
  getSubPageAnalyticsData,
};

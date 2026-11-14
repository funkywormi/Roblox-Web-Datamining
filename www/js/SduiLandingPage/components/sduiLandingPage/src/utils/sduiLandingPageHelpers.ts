import { EventStreamMetadata, PageContext } from "@rbx/discovery-common/telemetry";
import { window as browserWindow } from "@rbx/core-lib/browser";

export const getSubPageAnalyticsData = (
  appPage: PageContext | undefined,
): Record<string, string> => {
  const subPageName = browserWindow?.location.pathname.split("/").pop() ?? "";
  return appPage === PageContext.SpotlightPage
    ? {
        [EventStreamMetadata.SubPageName]: subPageName,
      }
    : {};
};

export default {
  getSubPageAnalyticsData,
};

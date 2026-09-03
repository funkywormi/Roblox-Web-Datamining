import { EnvironmentUrls } from "Roblox";

const apiGwUrl = EnvironmentUrls.apiGatewayUrl || "https://apis.roblox.com";
const { notificationApi, websiteUrl } = EnvironmentUrls;

export default {
  notificationActionUrl: (streamId: string, actionId: string): string =>
    `${notificationApi}/v2/stream-notifications/action/${streamId}/${actionId}`,

  illegalContentReportingUrl: `${websiteUrl}/illegal-content-reporting`,

  reportNotificationUrl: {
    url: `${apiGwUrl}/notifications/v1/report-notification`,
    withCredentials: true,
    retryable: true,
  },
};

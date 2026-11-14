import environmentUrls from "@rbx/environment-urls";

const apiGwUrl = environmentUrls.apiGatewayUrl || "https://apis.roblox.com";
const { notificationApi, websiteUrl } = environmentUrls;

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

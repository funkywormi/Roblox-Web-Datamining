import environmentUrls from "@rbx/environment-urls";

const apiGwUrl = environmentUrls.apiGatewayUrl || "https://apis.roblox.com";

export default {
  safetyEvent: {
    url: `${apiGwUrl}/abuse-reporting/v1/safety-event`,
    retryable: true,
    withCredentials: true,
  },
};

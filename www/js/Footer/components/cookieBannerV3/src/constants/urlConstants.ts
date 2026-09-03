import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";

const privacyPolicyUrl = getAbsoluteUrl("/info/privacy");
const supportUrl = getAbsoluteUrl("/support");
const googleAnalyticsWebsite = "https://marketingplatform.google.com/about/analytics/";
const googleAnalyticsReadMore = "https://support.google.com/analytics/answer/11397207";

export default {
  privacyPolicyUrl,
  googleAnalyticsWebsite,
  supportUrl,
  googleAnalyticsReadMore,
};

import { callBehaviour } from "@rbx/core-scripts/guac";
import { setTrackingRestriction } from "@rbx/cookie-banner-v3";

const getCookiePolicy = async () => {
  const response = await callBehaviour("cookie-policy");
  if (response !== undefined) {
    setTrackingRestriction(response.RestrictNonEssentialTrackingConsent);
    return response;
  }
  const defaultCookiePolicy = {
    ShouldDisplayCookieBannerV3: false,
    NonEssentialCookieList: [],
    EssentialCookieList: [],
  };
  return defaultCookiePolicy;
};

export default { getCookiePolicy };

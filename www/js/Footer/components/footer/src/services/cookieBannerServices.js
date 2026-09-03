import { callBehaviour } from "@rbx/core-scripts/guac";

const getCookiePolicy = async () => {
  const response = await callBehaviour("cookie-policy");
  if (response !== undefined) {
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

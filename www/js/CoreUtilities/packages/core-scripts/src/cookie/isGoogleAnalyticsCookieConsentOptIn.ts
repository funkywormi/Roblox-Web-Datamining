import { get } from "@rbx/core-lib/cookie";
import "@rbx/www-common/global";

const consentCookieName = "RBXcb";
const googleAnalyticsCookieKey = "GoogleAnalytics";

/**
 * Returns true if the RBXcb cookie has Google Analytics consent set to true.
 * Parses RBXcb (key1=value1&key2=value2) and checks the GoogleAnalytics key.
 */
export const isGoogleAnalyticsCookieConsentOptIn = (): boolean => {
  const consentCookie = get(consentCookieName);
  if (consentCookie == null || consentCookie.value === "") {
    return false;
  }
  const pairs = consentCookie.value.split("&");
  const gaPair = pairs.find(pair => pair.split("=")[0] === googleAnalyticsCookieKey);
  const value = gaPair?.split("=")[1];
  return value === "true";
};

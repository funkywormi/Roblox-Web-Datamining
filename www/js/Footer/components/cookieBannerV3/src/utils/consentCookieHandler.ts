import * as cookie from "@rbx/core-lib/cookie";
import "@rbx/www-common/global";
import environmentUrls from "@rbx/environment-urls";
import cookieConstants from "../constants/cookieConstants";

const setUserConsent = (acceptCookieNames: string[], nonEssentialCookieList: string[]): void => {
  const currentConsentCookie = cookie.get(cookieConstants.consentCookieName);
  if (currentConsentCookie) {
    cookie.delete(cookieConstants.consentCookieName, { domain: environmentUrls.domain });
  }
  let consentCookieConfig = "";
  const cookiesToBeDeleted: string[] = [];
  nonEssentialCookieList.forEach((cookieName, index) => {
    if (acceptCookieNames.includes(cookieName)) {
      consentCookieConfig += `${cookieName}=true&`;
    } else {
      consentCookieConfig += `${cookieName}=false&`;
      cookiesToBeDeleted.push(cookieName);
    }
    if (index === nonEssentialCookieList.length - 1) {
      consentCookieConfig = consentCookieConfig.slice(0, -1);
    }
  });

  cookiesToBeDeleted.forEach(cookieName => {
    cookie.delete(cookieName as keyof cookie.CookieRegistry, { domain: environmentUrls.domain });
  });

  cookie.set(cookieConstants.consentCookieName, consentCookieConfig, {
    maxAge: cookieConstants.consentExpirationDays * 24 * 60 * 60,
    domain: environmentUrls.domain,
  });
};

const isAnalyticsCookieAccepted = (): boolean => {
  const consentCookie = cookie.get(cookieConstants.consentCookieName);
  if (!consentCookie) {
    return false;
  }
  const analyticsCookies = consentCookie.value.split("&");
  const acceptedAnalyticsCookie = analyticsCookies.find(cookie => {
    const value = cookie.split("=")[1];
    return value === "true";
  });
  return !!acceptedAnalyticsCookie;
};

export default { setUserConsent, isAnalyticsCookieAccepted };

import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { RETURNURL } from "../constants/browserConstants";

// Matches case-insensitively, because that is what Roblox.UrlParser's
// getParameterValueByName(name, false) did and callers rely on it: signupUtils reads `dataToken`
// and `birthday` out of redirect urls whose casing is not ours to control.
export const getUrlParam = (name: string): string | null => {
  const target = name.toLowerCase();
  for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
    if (key.toLowerCase() === target) {
      return value;
    }
  }
  return null;
};

export const getUrlParamValue = (name: string): string | null => {
  const result = getUrlParam(name);
  return result ? encodeURIComponent(result) : result;
};

const eventTrackerCookieName = "RBXEventTrackerV2";

// Ported from Roblox.Cookies.getBrowserTrackerId (website's wwwroot/js/RobloxCookies.js), which does
// not exist in the Next.js runtime. `get` from @rbx/core-lib/cookie cannot read this cookie: it
// takes split("=")[1], and this value is itself `CreateDate=...&browserid=...`, so it yields
// "CreateDate". The decode and the `false` return reproduce jQuery.cookie and the original's miss.
export const getBrowserTrackerId = (): string | false => {
  const prefix = `${eventTrackerCookieName}=`;
  const row = document.cookie.split("; ").find(entry => entry.startsWith(prefix));
  if (row == null) {
    return false;
  }
  const match = decodeURIComponent(row.slice(prefix.length)).match(/browserid=([^&]*)/i);
  return match?.[1] ?? false;
};

export const navigateToPage = (pageUrl: string): void => {
  window.location.href = pageUrl;
};

export const navigateToLogin = (): void => {
  window.location.href = "/login";

  const returnUrl = urlService.getQueryParam(RETURNURL) ?? "";
  if (returnUrl) {
    window.location.href = `/login?${urlService.composeQueryString({ returnUrl })}`;
  } else {
    window.location.href = "/login";
  }
};

// create signup url with return url param
export const buildSignupRedirUrl = (): string => {
  const returnUrl = urlService.getQueryParam(RETURNURL);
  if (returnUrl) {
    const parsedParams = {
      ReturnUrl: returnUrl,
    };
    const signupRedirUrl = urlService.getUrlWithQueries("/account/signupredir", parsedParams);
    return signupRedirUrl;
  }
  return urlService.getAbsoluteUrl("/CreateAccount");
};

export const defaultRedirect = (): void => {
  window.location.href = urlService.getAbsoluteUrl(`/home`);
};

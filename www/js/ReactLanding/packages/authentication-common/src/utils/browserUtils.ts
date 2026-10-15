import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { RETURNURL } from "../constants/browserConstants";

export { getBrowserTrackerId } from "@rbx/www-common/browser-tracker";

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

import { UrlSearchParams } from "@rbx/core-lib/url";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { currentBrowser, Browser } from "@rbx/core-scripts/util/current-browser";
import { cachedMeetsRequiredSpec } from "@rbx/device-probe/client";
import { getCurrentUser } from "@rbx/www-common/user";
import { getAccountSwitchingSignUpUrl } from "../constants/urlConstants";
import type { NavLocation } from "./navLocation";

// Must match the website's LandingController, which serves the mobile-web sign-up form only on
// game page returnUrls, to Android Chrome, and only for requests carrying this entry value.
const gamePagePathPattern = /^(\/[a-z]{2}(-[a-z]{2})?)?\/games\/[0-9]+(\/|$)/i;
const mobileWebSignupEntryParameter = "signupEntry";
const headerSignupEntryValue = "header";

const isAndroidChromePhone = (): boolean => {
  const deviceMeta = getDeviceMeta();
  return (
    deviceMeta?.isAndroidDevice === true &&
    deviceMeta.isPhone &&
    !deviceMeta.isInApp &&
    currentBrowser() === Browser.Chrome
  );
};

// Same device check as the game page's Play button: only a stored probe pass counts, so the form
// only goes to phones that can get Play in browser once signed in.
export const isMobileWebSignupCandidate = (location: NavLocation): boolean =>
  getCurrentUser() === undefined &&
  gamePagePathPattern.test(location.pathname) &&
  isAndroidChromePhone() &&
  cachedMeetsRequiredSpec() === true;

// Not through /account/signupredir: its rewrite keeps only returnUrl.
export const getMobileWebSignupUrl = (location: NavLocation): string =>
  `${getAccountSwitchingSignUpUrl()}?${UrlSearchParams.new({
    returnUrl: location.href,
    [mobileWebSignupEntryParameter]: headerSignupEntryValue,
  })
    .toSorted()
    .toString()}`;

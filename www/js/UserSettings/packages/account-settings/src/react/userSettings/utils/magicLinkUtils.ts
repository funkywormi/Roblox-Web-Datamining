import { AccountSwitcherService } from "Roblox";
import { httpService } from "core-utilities";
import { authenticatedUser } from "header-scripts";
import { childrenInfoUrl } from "@rbx/user-settings";
import MagicLinkEntryAction from "../../../enums/MagicLinkEntryAction";
import MagicLinkLoginState from "../../../enums/MagicLinkLoginState";
import MagicLinkTarget from "../../../enums/MagicLinkTarget";
import type { TGetChildrenInfoResponse } from "../../../types/childrenInfoTypes";
import magicLinkTranslationConstants from "../constants/contentConstants/magicLinkTranslationConstants";
import {
  loginPath,
  logoutAllLoggedInUsersUrl,
  logoutEndpoint,
  validateMagicLinkUrl,
} from "../constants/urlConstants";

export const magicLinkTokenQueryParam = "magicLinkToken";
export const magicLinkTargetQueryParam = "target";
const linkedChildIdPattern = /\/LinkedChildDetails-(\d+)(?:\/|$)/;

const magicLinkTargets = new Set<string>(Object.values(MagicLinkTarget));

export const getMagicLinkToken = (location: Location = window.location): string | null =>
  new URLSearchParams(location.search).get(magicLinkTokenQueryParam);

/** Allowlisted `target` from the email URL. Missing or unknown values are ignored. */
export const getMagicLinkTarget = (
  location: Location = window.location,
): MagicLinkTarget | undefined => {
  const target = new URLSearchParams(location.search).get(magicLinkTargetQueryParam);
  if (!target || !magicLinkTargets.has(target)) {
    return undefined;
  }
  return target as MagicLinkTarget;
};

export type TMagicLinkSwitchAccountModalVariant = "valid" | "expired";

const { switchAccountModal } = magicLinkTranslationConstants;

/** Copy for the switch-account modal: expired links share one body; valid ones vary by `target`. */
export const getBodyTranslationKey = (
  variant: TMagicLinkSwitchAccountModalVariant,
  location: Location = window.location,
): string => {
  if (variant === "expired") {
    return switchAccountModal.expiredBody;
  }

  switch (getMagicLinkTarget(location)) {
    case MagicLinkTarget.EmailPreferences:
      return switchAccountModal.emailPreferencesBody;
    case MagicLinkTarget.ViewActivity:
      return switchAccountModal.viewActivityBody;
    default:
      return switchAccountModal.continueBody;
  }
};

export const getLinkedChildId = (location: Location = window.location): number | undefined => {
  const match = linkedChildIdPattern.exec(location.hash);
  if (!match) {
    return undefined;
  }

  const childUserId = Number(match[1]);
  return Number.isSafeInteger(childUserId) ? childUserId : undefined;
};

/**
 * Current settings URL with the token dropped. The `#!/...` route is kept so a parent stays on
 * the tab the email pointed at, e.g. `/parental-controls/LinkedChildDetails-123/ActivityUpdates`.
 */
export const getSettingsUrlWithoutMagicLinkToken = (location: Location): string => {
  const searchParams = new URLSearchParams(location.search);
  searchParams.delete(magicLinkTokenQueryParam);
  const search = searchParams.toString();
  return `${location.pathname}${search ? `?${search}` : ""}${location.hash}`;
};

/**
 * Path + query only (no hashbang). Login rebuilds the post-login target as
 * `returnUrl + window.location.hash`, so the `#!/...` route must travel as a
 * real fragment on the `/login` URL rather than being encoded inside returnUrl.
 */
const getReturnUrlPathWithoutMagicLinkToken = (location: Location): string => {
  const searchParams = new URLSearchParams(location.search);
  searchParams.delete(magicLinkTokenQueryParam);
  const search = searchParams.toString();
  return `${location.pathname}${search ? `?${search}` : ""}`;
};

export const getMagicLinkLoginUrl = (location: Location): string | undefined => {
  const magicLinkToken = getMagicLinkToken(location);
  if (!magicLinkToken) {
    return undefined;
  }

  const loginParams = new URLSearchParams({
    [magicLinkTokenQueryParam]: magicLinkToken,
    returnUrl: getReturnUrlPathWithoutMagicLinkToken(location),
  });
  return `${loginPath}?${loginParams.toString()}${location.hash ?? ""}`;
};

/**
 * Login URL that leaves the token behind. /login auto-submits any `magicLinkToken` it is given,
 * so a token already known to be expired must not travel with the redirect — the parent signs in
 * normally and still lands on the page the email pointed at.
 */
export const getLoginUrlWithoutMagicLink = (location: Location): string => {
  const loginParams = new URLSearchParams({
    returnUrl: getReturnUrlPathWithoutMagicLinkToken(location),
  });
  return `${loginPath}?${loginParams.toString()}${location.hash ?? ""}`;
};

type MaybeRobloxWindow = Window & {
  Roblox?: {
    CurrentUser?: {
      isAuthenticated?: boolean;
      userId?: string;
    };
  };
};

/**
 * Matches the gate parental-requests uses. `authenticatedUser` comes from the `user-data` meta
 * tag, so `Roblox.CurrentUser` is consulted as well to cover renders where that tag is missing but
 * an account-switcher session is active. "0" is CurrentUser's logged-out sentinel.
 */
export const isAuthenticatedUser = (): boolean => {
  if (authenticatedUser.isAuthenticated) {
    return true;
  }

  const currentUser = (window as MaybeRobloxWindow).Roblox?.CurrentUser;
  if (currentUser?.isAuthenticated) {
    return true;
  }

  const { userId } = currentUser ?? {};
  return userId != null && userId !== "0";
};

/** Asks auth-token-service whether the token belongs to the current user, without consuming it. */
export const validateMagicLink = async (token: string): Promise<MagicLinkLoginState> => {
  const { data } = await httpService.post<{ status: MagicLinkLoginState }>(
    { url: validateMagicLinkUrl, withCredentials: true },
    { token },
  );
  return data.status;
};

/**
 * Checks the authenticated user's linked children. This is used only after a token has expired,
 * when auth-token-service can no longer tell us which account originally owned it.
 */
export const isCurrentUserLinkedToChild = async (childUserId: number): Promise<boolean> => {
  const { data } = await httpService.get<TGetChildrenInfoResponse>({
    url: childrenInfoUrl,
    withCredentials: true,
  });
  return data.childrenInfoList.some(child => child.userId === childUserId);
};

/** Signs out every account (child + account-switcher sessions) so /login can auto-submit the link. */
export const logoutAllAccountsForMagicLink = async (): Promise<void> => {
  const accountSwitcherBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob?.() ?? "";
  if (accountSwitcherBlob.trim()) {
    await httpService.post(
      { url: logoutAllLoggedInUsersUrl, withCredentials: true },
      { encrypted_users_data_blob: accountSwitcherBlob },
    );
    AccountSwitcherService?.storeAccountSwitcherBlob?.("");
    return;
  }
  await httpService.post({ url: logoutEndpoint, withCredentials: true });
};

export const stripMagicLinkToken = (location: Location = window.location): void => {
  window.history.replaceState(null, "", getSettingsUrlWithoutMagicLinkToken(location));
};

/**
 * Decides what the settings entry point does for a magic link. Validation runs before the page
 * renders so a wrong account never sees another user's parental controls, and so a signed-in
 * parent is never signed out needlessly.
 */
export const resolveMagicLinkEntryAction = async (
  location: Location = window.location,
): Promise<MagicLinkEntryAction> => {
  const magicLinkToken = getMagicLinkToken(location);

  if (!magicLinkToken) {
    return MagicLinkEntryAction.RenderApp;
  }

  if (!isAuthenticatedUser()) {
    const loginUrl = getMagicLinkLoginUrl(location);
    if (loginUrl) {
      window.location.href = loginUrl;
      return MagicLinkEntryAction.RedirectedToLogin;
    }
    return MagicLinkEntryAction.RenderApp;
  }

  let status: MagicLinkLoginState;
  try {
    status = await validateMagicLink(magicLinkToken);
  } catch {
    // Validation is unavailable. The signed-in account still owns the settings page it asked
    // for, so render rather than signing anyone out on a failed request.
    stripMagicLinkToken(location);
    return MagicLinkEntryAction.RenderApp;
  }

  switch (status) {
    case MagicLinkLoginState.UserLoggedIn:
      stripMagicLinkToken(location);
      return MagicLinkEntryAction.RenderApp;
    case MagicLinkLoginState.WrongUserLoggedIn:
      return MagicLinkEntryAction.ShowSwitchAccountModal;
    case MagicLinkLoginState.TokenInvalid: {
      const childUserId = getLinkedChildId(location);
      if (childUserId !== undefined) {
        try {
          if (await isCurrentUserLinkedToChild(childUserId)) {
            stripMagicLinkToken(location);
            return MagicLinkEntryAction.RenderApp;
          }
        } catch {
          // Without a reliable link result, do not assume the current account is the parent.
        }
      }
      // The route carries no child id, or the signed-in account is not linked to that child.
      // `TokenInvalid` cannot tell us which account owned the link, so prompt for the right one
      // rather than assuming this account is the parent. Cancelling strips the token and renders.
      return MagicLinkEntryAction.ShowExpiredSwitchAccountModal;
    }
    default:
      stripMagicLinkToken(location);
      return MagicLinkEntryAction.RenderApp;
  }
};

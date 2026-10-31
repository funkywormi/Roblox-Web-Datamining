import { setItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";
import * as http from "@rbx/core-scripts/http";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { handleLogoutUpsell } from "@rbx/authentication";
import { showPasskeyUpsellModal } from "@rbx/authentication/logoutUpsell/services/showPasskeyUpsellModal";
import {
  isLegacyPromptsServiceEnabled,
  legacyBrowserSupportsPasskey,
  openLegacyEmailUpsellModal,
  runLegacyEmailUpsell,
} from "@rbx/authentication/logoutUpsell/services/logoutUpsellLegacy";
import { userCacheKey } from "../constants/cacheConstants";
import layoutConstants from "../constants/layoutConstants";
import { getLoginUrl, getHomeUrl, getRefreshSessionUrl } from "../constants/urlConstants";
import {
  sendLogoutButtonClickEvent,
  sendSwitchAccountButtonClickEvent,
} from "../services/eventService";
import { logout } from "../services/navigationService";
import { cacheUserId } from "./userCacheUtil";
import {
  getIsVNGLandingRedirectEnabled,
  getLoginLinkUrl,
  getSignupUrl,
  isLoginLinkAvailable,
  navigateToLoginWithRedirect,
} from "./authLinkUtil";

const { logoutEvent } = layoutConstants;
const logoutAndRedirect = () =>
  logout().then(() => {
    document.dispatchEvent(new CustomEvent(logoutEvent.name));

    // clear cached user id
    setItem(userCacheKey, null);

    // NOTE: we should not delete keyPairs upon logout.
    // TODO: delete CrpytoKey in indexeddb when all users are signed out.
    window.location.reload();
  });

const logoutUser = async () => {
  sendLogoutButtonClickEvent();
  await handleLogoutUpsell({
    onLogout: () => {
      // TODO: onLogout should accept Promise functions
      logoutAndRedirect();
    },
    showPasskeyUpsell: showPasskeyUpsellModal,
    showEmailUpsell: ({ onLogout }) => openLegacyEmailUpsellModal(onLogout),
    isPromptsServiceEnabled: isLegacyPromptsServiceEnabled,
    browserSupportsPasskey: legacyBrowserSupportsPasskey,
    runLegacyEmailUpsell,
  });
};

const refreshCurrentSession = async () => {
  await http.post(
    {
      url: getRefreshSessionUrl(),
      withCredentials: true,
    },
    {},
  );
};

// Account Switching
const openAccountSwitcher = () => {
  sendSwitchAccountButtonClickEvent(window.location.href);

  // clear cached user id
  setItem(userCacheKey, null);

  const containerId = "navigation-account-switcher-container";

  const switchAccountAndGoToHomePage = () => {
    setItem(layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag, true);
    window.location.href = getHomeUrl();
  };

  const addAccountAndReturnOnSuccess = () => {
    window.location.href = getLoginUrl();
  };

  const AccountSwitcherParameters = {
    containerId,
    onAccountSwitched: switchAccountAndGoToHomePage,
    handleAddAccount: addAccountAndReturnOnSuccess,
  };
  // fire and forget renderAccountSwitcher
  const tryOpenAccountSwitcherModal = async () => {
    if (await AccountSwitcherService.isAccountSwitcherAvailable()) {
      // TODO: fix me
      AccountSwitcherService.renderAccountSwitcher(AccountSwitcherParameters);
    }
  };
  // TODO: fix me
  tryOpenAccountSwitcherModal();
};

export {
  getSignupUrl,
  getLoginLinkUrl,
  logoutUser,
  logoutAndRedirect,
  refreshCurrentSession,
  isLoginLinkAvailable,
  openAccountSwitcher,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  cacheUserId,
};

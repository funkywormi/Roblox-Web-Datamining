// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Should be removed / fixed once React Chat is out
import angular from "angular";
import { MouseEventHandler } from "react";
import localStorageService from "@rbx/core-scripts/local-storage";
import * as http from "@rbx/core-scripts/http";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { handleLogoutUpsell } from "@rbx/authentication";
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
} from "./authLinkUtil";

const { logoutEvent } = layoutConstants;
const logoutAndRedirect = () =>
  logout().then(() => {
    document.dispatchEvent(new CustomEvent(logoutEvent.name));
    if (!angular.isUndefined(angular.element("#chat-container").scope())) {
      const scope = angular.element("#chat-container").scope();
      scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
    }

    // clear cached user id
    localStorageService.setLocalStorage(userCacheKey, null);

    // NOTE: we should not delete keyPairs upon logout.
    // TODO: delete CrpytoKey in indexeddb when all users are signed out.
    window.location.reload();
  });

const navigateToLoginWithRedirect = () => {
  window.location.href = getLoginLinkUrl();
};

const logoutUser = async () => {
  sendLogoutButtonClickEvent();
  await handleLogoutUpsell({
    onLogout: () => {
      // TODO: onLogout should accept Promise functions
      logoutAndRedirect();
    },
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
  localStorageService.setLocalStorage(userCacheKey, null);

  // destroy chat cookie after account switching
  if (!angular.isUndefined(angular.element("#chat-container").scope())) {
    const scope = angular.element("#chat-container").scope();
    scope.$digest(scope.$broadcast("Roblox.Chat.destroyChatCookie"));
  }

  const containerId = "navigation-account-switcher-container";

  const switchAccountAndGoToHomePage = () => {
    localStorageService.setLocalStorage(
      layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
      true,
    );
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

const switchAccount: MouseEventHandler = e => {
  e.stopPropagation();
  e.preventDefault();
  openAccountSwitcher();
};

export {
  getSignupUrl,
  getLoginLinkUrl,
  logoutUser,
  logoutAndRedirect,
  refreshCurrentSession,
  isLoginLinkAvailable,
  switchAccount,
  openAccountSwitcher,
  getIsVNGLandingRedirectEnabled,
  navigateToLoginWithRedirect,
  cacheUserId,
};

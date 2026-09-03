import React, { MouseEventHandler } from "react";
import ClassNames from "classnames";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { Link } from "@rbx/core-ui";
import links from "../constants/linkConstants";
import { logoutUser, switchAccount } from "../util/authUtil";
import layoutConstants from "../constants/layoutConstants";

const { settingsUrl, quickLoginUrl } = links;
const { quickLogin, settings, logout, switchAccountKey } = layoutConstants.menuKeys;

interface Props {
  accountNotificationCount: number;
  isCrossDeviceLoginCodeValidationDisplayed: boolean;
}

export default function SettingsMenu({
  accountNotificationCount = 0,
  isCrossDeviceLoginCodeValidationDisplayed = false,
}: Props) {
  const { translate } = useTranslation();
  const notificationClasses = ClassNames("notification-blue notification nav-setting-highlight", {
    hidden: accountNotificationCount === 0,
  });
  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutUser();
    },
  });
  const handleLogoutClick: MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined);
  };
  return (
    <React.Fragment>
      {Object.entries(settingsUrl).map(([urlKey, { url, label }]) => (
        <li key={urlKey}>
          {urlKey === logout && (
            <Link
              className="rbx-menu-item logout-menu-item"
              key={urlKey}
              onClick={handleLogoutClick}
              url="#"
            >
              {translate(label)}
            </Link>
          )}
          {urlKey === switchAccountKey && isAccountSwitchingEnabledForBrowser && (
            <Link
              className="rbx-menu-item account-switch-menu-item"
              key={urlKey}
              onClick={switchAccount}
              url="#"
            >
              {translate(label)}
            </Link>
          )}
          {urlKey === quickLogin && isCrossDeviceLoginCodeValidationDisplayed && (
            <Link className="rbx-menu-item" key={urlKey} url={quickLoginUrl}>
              {translate(label)}
            </Link>
          )}
          {urlKey !== logout && urlKey !== quickLogin && urlKey !== switchAccountKey && (
            <Link cssClasses="rbx-menu-item" key={urlKey} url={url}>
              {translate(label)}
              {urlKey === settings && (
                <span className={notificationClasses}>{accountNotificationCount}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </React.Fragment>
  );
}

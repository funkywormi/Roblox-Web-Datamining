import { useState, useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useTranslation, TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover } from "@rbx/core-ui";
import SettingsIcon from "./SettingsIcon";
import SettingsMenu from "./SettingsMenu";
import { sendAccountSwitcherBlobPresentOnPageLoadEvent } from "../services/eventService";
import { translations } from "../../component.json";
// disabling the metadata call since this is fully released.
// this will also reduce the traffic. ticket to remove comments: WEBGROW-10026
// import navigationService from '../services/navigationService';

export default function SettingsPopover({
  accountNotificationCount = 0,
}: {
  accountNotificationCount?: number;
}) {
  const { translate } = useTranslation();
  const [isCrossDeviceLoginCodeValidationDisplayed, setCrossDeviceLoginCodeValidationDisplayed] =
    useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // TODO: This code should be removed when we stop upgrading the blob
    const syncAccountBlob = async () => {
      try {
        await AccountSwitcherService.syncAccountSwitcherBlobIfNeeded();
      } catch (error) {
        console.warn("account switching has issues", error);
      }
    };

    setCrossDeviceLoginCodeValidationDisplayed(true);
    sendAccountSwitcherBlobPresentOnPageLoadEvent(
      !!AccountSwitcherService.getStoredAccountSwitcherBlob(),
    );
    // eslint-disable-next-line no-void
    void syncAccountBlob();
  }, []);

  return (
    <li id="navbar-settings" ref={ref} className="navbar-icon-item">
      <Popover
        id="settings-popover"
        trigger="click"
        placement="bottom"
        containerPadding={20}
        button={
          <button
            type="button"
            className="btn-navigation-nav-settings-md"
            aria-label={
              accountNotificationCount > 0
                ? translate("Label.sSettingsNotifications", {
                    notificationCount: formatNumber(accountNotificationCount),
                  }) || `Settings: ${formatNumber(accountNotificationCount)}`
                : translate("Label.sSettings")
            }
            aria-haspopup="true"
          >
            <SettingsIcon accountNotificationCount={accountNotificationCount} />
          </button>
        }
        container={ref.current}
        role="menu"
      >
        <QueryClientProvider client={queryClient}>
          <TranslationProvider config={translations}>
            <div>
              <ul id="settings-popover-menu" className="dropdown-menu">
                <SettingsMenu
                  isCrossDeviceLoginCodeValidationDisplayed={
                    isCrossDeviceLoginCodeValidationDisplayed
                  }
                  accountNotificationCount={accountNotificationCount}
                />
              </ul>
            </div>
          </TranslationProvider>
        </QueryClientProvider>
      </Popover>
    </li>
  );
}

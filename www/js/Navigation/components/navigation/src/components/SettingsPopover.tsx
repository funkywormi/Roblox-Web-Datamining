import { useState, useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover as CoreUiPopover } from "@rbx/core-ui";
import { Popover as FoundationPopover, PopoverContent, PopoverTrigger } from "@rbx/foundation-ui";
import SettingsIcon from "./SettingsIcon";
import SettingsMenu from "./SettingsMenu";
import { navNamespaces } from "../constants/translationNamespaces";
import { sendAccountSwitcherBlobPresentOnPageLoadEvent } from "../services/eventService";
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";
import { popoverDismissGuard } from "../util/popoverDismissGuard";
// disabling the metadata call since this is fully released.
// this will also reduce the traffic. ticket to remove comments: WEBGROW-10026
// import navigationService from '../services/navigationService';

export default function SettingsPopover({
  accountNotificationCount = 0,
}: {
  accountNotificationCount?: number;
}) {
  const t = useTranslations("CommonUI.Features");
  const isFoundation = useIsTopNavFoundation();
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

  const triggerLabel =
    accountNotificationCount > 0
      ? t.has("Label.sSettingsNotifications")
        ? t("Label.sSettingsNotifications", {
            notificationCount: formatNumber(accountNotificationCount),
          })
        : `Settings: ${formatNumber(accountNotificationCount)}`
      : t("Label.sSettings");

  const menu = (
    <QueryClientProvider client={queryClient}>
      {isFoundation ? (
        <SettingsMenu
          isCrossDeviceLoginCodeValidationDisplayed={isCrossDeviceLoginCodeValidationDisplayed}
          accountNotificationCount={accountNotificationCount}
        />
      ) : (
        <TranslationProviderSCC namespaces={navNamespaces}>
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
        </TranslationProviderSCC>
      )}
    </QueryClientProvider>
  );

  const trigger = (
    <button
      type="button"
      className="btn-navigation-nav-settings-md"
      aria-label={triggerLabel}
      aria-haspopup="true"
    >
      <SettingsIcon accountNotificationCount={accountNotificationCount} />
    </button>
  );

  if (isFoundation) {
    return (
      <li id="navbar-settings" ref={ref} className="navbar-icon-item">
        <FoundationPopover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            ariaLabel={triggerLabel}
            {...popoverDismissGuard(ref)}
          >
            {menu}
          </PopoverContent>
        </FoundationPopover>
      </li>
    );
  }

  return (
    <li id="navbar-settings" ref={ref} className="navbar-icon-item">
      <CoreUiPopover
        id="settings-popover"
        trigger="click"
        placement="bottom"
        containerPadding={20}
        button={trigger}
        container={ref.current}
        role="menu"
      >
        {menu}
      </CoreUiPopover>
    </li>
  );
}

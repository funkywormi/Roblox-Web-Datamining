import { useState, useEffect, useRef } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover as FoundationPopover, PopoverContent, PopoverTrigger } from "@rbx/foundation-ui";
import SettingsIcon from "./SettingsIcon";
import SettingsMenu from "./SettingsMenu";
import { sendAccountSwitcherBlobPresentOnPageLoadEvent } from "../services/eventService";
import { getNavCapability } from "../util/navCapabilities";
import { popoverDismissGuard } from "../util/popoverDismissGuard";
import { trackOpenToVisible } from "../topNav/observability";
// disabling the metadata call since this is fully released.
// this will also reduce the traffic. ticket to remove comments: WEBGROW-10026
// import navigationService from '../services/navigationService';

export default function SettingsPopover({
  accountNotificationCount = 0,
}: {
  accountNotificationCount?: number;
}) {
  const t = useTranslations("CommonUI.Features");
  const [isCrossDeviceLoginCodeValidationDisplayed, setCrossDeviceLoginCodeValidationDisplayed] =
    useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // TODO: This code should be removed when we stop upgrading the blob
    const syncAccountBlob = async () => {
      try {
        await getNavCapability("syncAccountSwitcherBlobIfNeeded")?.();
      } catch (error) {
        console.warn("account switching has issues", error);
      }
    };

    setCrossDeviceLoginCodeValidationDisplayed(true);
    const getStoredAccountSwitcherBlob = getNavCapability("getStoredAccountSwitcherBlob");
    if (getStoredAccountSwitcherBlob) {
      sendAccountSwitcherBlobPresentOnPageLoadEvent(!!getStoredAccountSwitcherBlob());
    }
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
    <SettingsMenu
      isCrossDeviceLoginCodeValidationDisplayed={isCrossDeviceLoginCodeValidationDisplayed}
      accountNotificationCount={accountNotificationCount}
    />
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

  return (
    <li id="navbar-settings" ref={ref} className="navbar-icon-item">
      <FoundationPopover
        onOpenChange={open => {
          if (open) {
            trackOpenToVisible("Settings");
          }
        }}
      >
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

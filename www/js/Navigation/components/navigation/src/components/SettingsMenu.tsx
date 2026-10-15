import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "@rbx/www-common/i18n";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import { Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";

import links from "../constants/linkConstants";
import { logoutUser, openAccountSwitcher } from "../util/authUtil";
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
  const tFeatures = useTranslations("CommonUI.Features");
  const tAlerts = useTranslations("Common.AlertsAndOptions");
  const translateSetting = (
    namespace: "CommonUI.Features" | "Common.AlertsAndOptions",
    label: string,
  ) => {
    if (namespace === "CommonUI.Features") {
      return tFeatures.has(label) ? tFeatures(label) : "";
    }
    return tAlerts.has(label) ? tAlerts(label) : "";
  };
  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser();
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutUser();
    },
  });
  const handleLogoutSelect = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined);
  };

  const isHidden = (urlKey: string) =>
    (urlKey === switchAccountKey && !isAccountSwitchingEnabledForBrowser) ||
    (urlKey === quickLogin && !isCrossDeviceLoginCodeValidationDisplayed);

  return (
    <Menu size="Large" className="nav-foundation-menu">
      <MenuSection>
        {Object.entries(settingsUrl).map(([urlKey, { url, label, namespace }]) => {
          if (isHidden(urlKey)) {
            return null;
          }
          const title = translateSetting(namespace, label);
          const trailing =
            urlKey === settings && accountNotificationCount > 0
              ? String(accountNotificationCount)
              : undefined;

          if (urlKey === logout) {
            return (
              <MenuItem key={urlKey} value={urlKey} title={title} onSelect={handleLogoutSelect} />
            );
          }
          if (urlKey === switchAccountKey) {
            return (
              <MenuItem key={urlKey} value={urlKey} title={title} onSelect={openAccountSwitcher} />
            );
          }
          return (
            <MenuItem
              key={urlKey}
              value={urlKey}
              as="a"
              href={urlKey === quickLogin ? quickLoginUrl : url}
              title={title}
              trailing={trailing}
            />
          );
        })}
      </MenuSection>
    </Menu>
  );
}

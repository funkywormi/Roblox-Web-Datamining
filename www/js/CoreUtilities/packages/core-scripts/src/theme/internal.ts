// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.
import { arrayIncludes } from "@rbx/core-lib";
import { document } from "@rbx/core-lib/browser";
import environmentUrls from "@rbx/environment-urls";
import {
  getListeningToThemeChanges,
  setListeningToThemeChanges,
  setTheme,
} from "@rbx/core-scripts/theme";
import * as http from "@rbx/core-scripts/http";
import realtime from "@rbx/core-scripts/realtime";
import { getCurrentUser } from "@rbx/www-common/user";
import { appThemes } from "./constants";

let inFlight: { cancelled: boolean } | null = null;

export const initializeTheme = () => {
  if (document == null || document.body.classList.contains("forced-theme")) {
    return; // This page should remain on the initial theme
  }
  const user = getCurrentUser();
  if (user == null || user.membership !== "blackbird") {
    return;
  }

  setListeningToThemeChanges(true);
  const client = realtime.GetClient();
  client.Subscribe("UserSettingsChanged", details => {
    if (details == null || typeof details !== "object" || !getListeningToThemeChanges()) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { SettingsChanged } = details as Record<string, unknown>;
    if (Array.isArray(SettingsChanged) && SettingsChanged.includes("AccountTheme")) {
      if (inFlight != null) {
        inFlight.cancelled = true;
      }
      const cancellation = { cancelled: false };
      inFlight = cancellation;
      http
        .get<{ accountTheme: { currentValue: string } }>({
          url: `${environmentUrls.userSettingsApi}/v2/user-settings/settings-and-options-subset?requestedUserSettings=accountTheme`,
          withCredentials: true,
        })
        .then(response => {
          const theme = response.data.accountTheme.currentValue
            .replaceAll(/([a-z])([A-Z0-9])/g, "$1-$2")
            .toLowerCase();
          if (!cancellation.cancelled && arrayIncludes(appThemes, theme)) {
            setTheme(theme);
          }
        })
        .catch(() => undefined);
    }
  });
};

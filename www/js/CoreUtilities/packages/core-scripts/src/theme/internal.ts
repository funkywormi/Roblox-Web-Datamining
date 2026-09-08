// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.
import { arrayIncludes } from "@rbx/core-lib";
import environmentUrls from "@rbx/environment-urls";
import {
  getListeningToThemeChanges,
  setListeningToThemeChanges,
  setTheme,
} from "@rbx/core-scripts/theme";
import * as http from "@rbx/core-scripts/http";
import realtime from "@rbx/core-scripts/realtime";
import { authenticatedUser, isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import * as localStorage from "@rbx/core-lib/local-storage";
import { appThemes } from "./constants";

let inFlight: { cancelled: boolean } | null = null;

export const initializeTheme = () => {
  if (document.body.classList.contains("forced-theme")) {
    return; // This page should remain on the initial theme
  }
  const id = authenticatedUser()?.id?.toString();
  if (id == null) {
    return;
  }

  const isPlus = isBlackbirdUser();
  if (isPlus) {
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
              .replaceAll(/([a-z])([A-Z])/g, "$1-$2")
              .toLowerCase();
            if (!cancellation.cancelled && arrayIncludes(appThemes, theme)) {
              setTheme(theme);
            }
          })
          .catch(() => undefined);
      }
    });
  }

  // TODO: remove once classic theme is plus only
  if (!isPlus) {
    window.addEventListener("storage", ({ key }) => {
      if (key !== "classic-theme") {
        return;
      }
      const classicUsers = localStorage.getItem("classic-theme");
      if (classicUsers != null && classicUsers.version !== 0) {
        return;
      }
      if (classicUsers?.data.includes(id)) {
        setTheme("classic");
      } else {
        setTheme("default");
      }
    });
  }
};

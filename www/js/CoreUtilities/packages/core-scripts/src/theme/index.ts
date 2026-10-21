// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.

import { document, window } from "@rbx/core-lib/browser";
import * as localStorage from "@rbx/core-lib/local-storage";
import "@rbx/www-common/global";
import { getCurrentUser } from "@rbx/www-common/user";
import { setColorModeOverride } from "@rbx/core-scripts/color-mode";
import { AppTheme, appThemes, PlusTheme, FreeTheme } from "./constants";
import { eventData } from "../meta/event";

const appThemeClass = (theme: Exclude<AppTheme, "default">) => `theme-${theme}`;

// TODO: remove this logic once hollow theme is plus only
const hallowThemeEnabledForNonPlus = () => {
  const user = getCurrentUser();
  // Unauth does not have access to hollow theme.
  // Also, hollow theme is an account level theme for plus users and can be handled normally.
  if (user == null || user.membership === "blackbird") {
    return false;
  }

  // Search param passed into webview from Lua
  if (new URLSearchParams(window?.location.search).get("deviceThemeOverride") === "Halloween2026") {
    return true;
  }

  const event = eventData();
  if (event?.phase !== 1) {
    return false;
  }

  const themeData = localStorage.getItem("event-halloween-2026");
  if (themeData?.version !== 0) {
    return false; // No data present, or new version released and we need a page reload
  }
  return themeData.data.includes(user.id);
};

const initialTheme = () => {
  // For CS site which loads CoreUtilities before document body
  if (document?.body == null) {
    return "default";
  }

  const { classList } = document.body;

  if (!classList.contains("forced-theme") && hallowThemeEnabledForNonPlus()) {
    classList.add(appThemeClass("halloween-2026"));
    setColorModeOverride("dark");
    return "halloween-2026";
  }

  const appTheme = appThemes.find(
    (theme): theme is Exclude<AppTheme, "default"> =>
      theme !== "default" && classList.contains(appThemeClass(theme)),
  );

  return appTheme ?? "default";
};

let accountTheme: AppTheme = initialTheme();
let previewTheme: PlusTheme | null = null;
let listeningToThemeChanges = false;

const themeListeners = new Set<(theme: AppTheme) => void>();

const updateTheme = (theme: AppTheme) => {
  const oldTheme = previewTheme ?? accountTheme;
  if (oldTheme !== "default") {
    document?.body.classList.remove(appThemeClass(oldTheme));
    if (oldTheme === "halloween-2026") {
      setColorModeOverride(null);
    }
  }
  if (theme !== "default") {
    document?.body.classList.add(appThemeClass(theme));
    if (theme === "halloween-2026") {
      setColorModeOverride("dark");
    }
  }
};

/** Returns the currently stored account level theme in memory. */
export const getTheme = (): AppTheme => accountTheme;

/** Sets the currently stored account level theme in memory (does not persist). */
export const setTheme = (theme: AppTheme) => {
  if (theme === accountTheme) {
    return;
  }
  if (previewTheme == null) {
    updateTheme(theme);
  }
  accountTheme = theme;
  for (const listener of themeListeners) {
    listener(theme);
  }
};

/** Subscribes to account level theme changes. Returns a function that removes the listener. */
export const subscribeToThemeChange = (listener: (theme: AppTheme) => void): (() => void) => {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
};

export const getListeningToThemeChanges = () => listeningToThemeChanges;

export const setListeningToThemeChanges = (listen: boolean) => {
  listeningToThemeChanges = listen;
};

/** Returns the current app theme being previewed, if any. */
export const getPreviewTheme = (): PlusTheme | null => previewTheme;

/** Sets the app theme to preview on the page. */
export const setPreviewTheme = (theme: PlusTheme) => {
  updateTheme(theme);
  previewTheme = theme;
};

/** Clears the theme being previewed and restores the page to the account level theme. */
export const clearPreviewTheme = () => {
  if (previewTheme == null) {
    return;
  }
  updateTheme(accountTheme);
  previewTheme = null;
};

export type { AppTheme, PlusTheme, FreeTheme };

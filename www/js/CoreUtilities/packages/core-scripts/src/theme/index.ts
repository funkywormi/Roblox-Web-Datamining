// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.

import * as localStorage from "@rbx/core-lib/local-storage";
import "@rbx/www-common/global";
import { AppTheme, appThemes, PlusTheme, FreeTheme } from "./constants";
import { authenticatedUser, isBlackbirdUser } from "../meta/user";

const appThemeClass = (theme: Exclude<AppTheme, "default">) => `${theme}-theme`;

const kids = (() => {
  // For CS site which loads CoreUtilities before document body
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (document.body == null) {
    return false;
  }
  const { classList } = document.body;
  return classList.contains("age-kids-variant1-theme") || classList.contains("age-kids-theme");
})();

// TODO: remove this logic once classic theme is plus only
const classicThemeEnabledForNonPlusOrKids = () => {
  // Classic theme is an account level theme for non-kid, plus users and can be handled normally
  if (isBlackbirdUser() && !kids) {
    return false;
  }

  // Search param passed into webview from Lua
  if (new URLSearchParams(window.location.search).get("deviceThemeOverride") === "Classic") {
    return true;
  }

  const metaTag = document.querySelector<HTMLMetaElement>(`meta[name="classic-theme-data"]`);
  if (metaTag?.dataset.enabled !== "True") {
    return false;
  }

  const userId = authenticatedUser()?.id;
  if (userId == null) {
    return false;
  }
  const themeData = localStorage.getItem("classic-theme");
  if (themeData?.version !== 0) {
    return false; // No data present, or new version released and we need a page reload
  }
  return themeData.data.includes(userId.toString());
};

const initialTheme = () => {
  // For CS site which loads CoreUtilities before document body
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (document.body == null) {
    return "default";
  }

  const { classList } = document.body;

  if (classicThemeEnabledForNonPlusOrKids()) {
    classList.add(appThemeClass("classic"));
    return "classic";
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

const addAppThemeClass = (theme: AppTheme) => {
  if (theme !== "default") {
    document.body.classList.add(appThemeClass(theme));
  }
};

const clearTheme = () => {
  const theme = previewTheme ?? accountTheme;
  if (theme !== "default") {
    document.body.classList.remove(appThemeClass(theme));
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
    clearTheme();
    addAppThemeClass(theme);
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
  clearTheme();
  addAppThemeClass(theme);
  previewTheme = theme;
};

/** Clears the theme being previewed and restores the page to the account level theme. */
export const clearPreviewTheme = () => {
  if (previewTheme == null) {
    return;
  }
  clearTheme();
  addAppThemeClass(accountTheme);
  previewTheme = null;
};

export type { AppTheme, PlusTheme, FreeTheme };

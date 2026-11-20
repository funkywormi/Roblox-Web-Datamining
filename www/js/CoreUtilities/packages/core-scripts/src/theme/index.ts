// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.

import { document } from "@rbx/core-lib/browser";
import "@rbx/www-common/global";
import { setColorModeOverride } from "@rbx/core-scripts/color-mode";
import { AppTheme, appThemes, PlusTheme, FreeTheme } from "./constants";

const appThemeClass = (theme: Exclude<AppTheme, "default">) => `theme-${theme}`;

const initialTheme = () => {
  // For CS site which loads CoreUtilities before document body
  if (document?.body == null) {
    return "default";
  }

  const { classList } = document.body;

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

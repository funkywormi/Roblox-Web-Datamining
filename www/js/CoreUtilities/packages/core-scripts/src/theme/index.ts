// Do not import anything here without checking if you need to update the rspack config for the coreUtilities component.

import { arrayIncludes } from "@rbx/core-lib";
import { AppTheme, AgeTheme, appThemes, ageThemes, Theme } from "./constants";

const appThemeClass = (theme: Exclude<AppTheme, "default">) => `${theme}-theme`;
const ageThemeClass = (theme: AgeTheme) => `age-${theme}-theme`;
const themeClass = (theme: Exclude<Theme, "default">) =>
  arrayIncludes(ageThemes, theme) ? ageThemeClass(theme) : appThemeClass(theme);

const initialTheme = () => {
  // For CS site which loads CoreUtilities before document body
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (document.body == null) {
    return "default";
  }
  const { classList } = document.body;
  if (classList.contains("age-kids-variant1-theme")) {
    // TODO: remove after IXP is done
    return "kids";
  }
  return (
    ageThemes.find(theme => classList.contains(ageThemeClass(theme))) ??
    appThemes.find(theme => theme !== "default" && classList.contains(appThemeClass(theme))) ??
    "default"
  );
};

let accountTheme: Theme = initialTheme();
let previewTheme: AppTheme | null = null;

const themeListeners = new Set<(theme: AppTheme) => void>();

const addAppThemeClass = (theme: AppTheme) => {
  if (theme !== "default") {
    document.body.classList.add(appThemeClass(theme));
  }
};

const clearTheme = () => {
  const theme = previewTheme ?? accountTheme;
  if (theme !== "default") {
    document.body.classList.remove(themeClass(theme));
  }
};

/** Returns the currently stored account level theme in memory. */
export const getTheme = (): Theme => accountTheme;

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

/** Returns the current app theme being previewed, if any. */
export const getPreviewTheme = (): AppTheme | null => previewTheme;

/** Sets the app theme to preview on the page. */
export const setPreviewTheme = (theme: AppTheme) => {
  clearTheme();
  addAppThemeClass(theme);
  previewTheme = theme;
};

/** Clears the theme being previewed and restores the page to the account level theme. */
export const clearPreviewTheme = () => {
  clearTheme();
  if (accountTheme !== "default") {
    document.body.classList.add(themeClass(accountTheme));
  }
  previewTheme = null;
};

export type { Theme, AppTheme, AgeTheme };

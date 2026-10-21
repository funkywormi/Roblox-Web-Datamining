// Do not import anything here without checking if you need to update the rspack config for the theme component.

import { arrayIncludes } from "@rbx/core-types";
import * as cookie from "@rbx/core-lib/cookie";
import type { LocalStorageRegistry } from "@rbx/core-lib/local-storage";
import "@rbx/www-common/global";
import { UserId, userIdToNumber } from "@rbx/www-common/user";

// Note: "color modes" used to be called "themes". So for legacy reasons, some things still refer to "themes":
// - The legacy color mode classes are named as `{light,dark,system}-theme`.
// - The local storage key for color modes is `theme`, but this actually stores the color mode per user.
// - The webview color mode override cookie is `RBXThemeOverride`.

export const colorModes = ["light", "dark", "system"] as const;
export type ColorMode = (typeof colorModes)[number];

export const defaultColorMode = "light" as const satisfies ColorMode;

type LocalStorageData = LocalStorageRegistry["theme"];
type ColorModeData = (LocalStorageData & { version: 0 })["data"];
type ColorModeEntry = ColorModeData[number];

const maxUsers = 100;

export const flagDefaultApplied = 1 << 0;

let userId: number | null = null;
let userColorMode: ColorMode = defaultColorMode;
let colorModeOverride: ColorMode | null = null;

export const getColorMode = (): ColorMode => colorModeOverride ?? userColorMode;

const prefersDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const setLegacyLightColorModeClasses = () => {
  const { classList } = document.body;
  classList.add("light-theme");
  classList.remove("dark-theme");
};

const setLegacyDarkColorModeClasses = () => {
  const { classList } = document.body;
  classList.add("dark-theme");
  classList.remove("light-theme");
};

const updateLegacyColorModeClasses = (dark: boolean) => {
  if (dark) {
    setLegacyDarkColorModeClasses();
  } else {
    setLegacyLightColorModeClasses();
  }
};

const colorModeEventListener = (e: MediaQueryListEvent) => {
  updateLegacyColorModeClasses(e.matches);
};

const applyColorModeClasses = (colorMode: ColorMode) => {
  const { classList } = document.body;
  classList.remove("color-mode-system", "color-mode-light", "color-mode-dark");
  switch (colorMode) {
    case "system":
      classList.add("color-mode-system");
      updateLegacyColorModeClasses(prefersDarkMediaQuery.matches);
      prefersDarkMediaQuery.addEventListener("change", colorModeEventListener);
      break;
    case "light":
      classList.add("color-mode-light");
      prefersDarkMediaQuery.removeEventListener("change", colorModeEventListener);
      setLegacyLightColorModeClasses();
      break;
    case "dark":
      classList.add("color-mode-dark");
      prefersDarkMediaQuery.removeEventListener("change", colorModeEventListener);
      setLegacyDarkColorModeClasses();
      break;
  }
};

const getColorModeData = (): ColorModeData | null | undefined => {
  try {
    const json = localStorage.getItem("theme");
    if (json == null) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { version, data } = JSON.parse(json) as LocalStorageData;
    // If version is not 0, then another tab is probably on a more up-to-date version.
    // Let's use the default color mode for this tab and do not write to local storage.
    return version === 0 ? data : undefined;
  } catch (e) {
    console.error(`Failed to get color mode data: ${e instanceof Error ? e : String(e)}`);
    // Most likely failed to parse color mode data. New versions should still follow the same schema and
    // succeed parsing. If we failed here, the data is likely corrupted. Reset to the default value.
    return null;
  }
};

const findUserEntry = (colorModeData: ColorModeData): ColorModeEntry | undefined =>
  colorModeData.find(([id]) => id === userId);

const getUserFlags = (colorModeData: ColorModeData): number =>
  findUserEntry(colorModeData)?.[2] ?? 0;

const getUserColorMode = (colorModeData: ColorModeData): ColorMode | null | undefined => {
  const entry = findUserEntry(colorModeData);
  const colorModeIndex = entry?.[1];
  return colorModeIndex == null ? null : colorModes[colorModeIndex];
};

const updateColorModeOverride = (colorMode: ColorMode) => {
  colorModeOverride = colorMode;
  applyColorModeClasses(colorMode);
};

const updateUserColorMode = (colorMode: ColorMode) => {
  userColorMode = colorMode;
  if (colorModeOverride == null) {
    applyColorModeClasses(colorMode);
  }
};

// Note: last write to local storage wins which should suffice.
const setUserColorModeWithLocalStorage = (colorMode: ColorMode, extraFlags = 0) => {
  updateUserColorMode(colorMode);

  if (userId == null) {
    return;
  }
  const colorModeData = getColorModeData();
  if (colorModeData === undefined) {
    return;
  }
  const existingFlags = colorModeData == null ? 0 : getUserFlags(colorModeData);
  const newColorModeData = colorModeData?.filter(([id]) => id !== userId) ?? [];
  if (newColorModeData.length >= maxUsers) {
    newColorModeData.shift();
  }
  const flags = existingFlags | extraFlags;
  newColorModeData.push(
    flags === 0
      ? [userId, colorModes.indexOf(colorMode)]
      : [userId, colorModes.indexOf(colorMode), flags],
  );
  try {
    const localStorageData: LocalStorageData = { version: 0, data: newColorModeData };
    localStorage.setItem("theme", JSON.stringify(localStorageData));
  } catch (e) {
    console.error(
      `Could not set color mode. Local storage is likely full: ${e instanceof Error ? e : String(e)}`,
    );
  }
};

const storageEventListener = ({ key, newValue }: StorageEvent) => {
  // If `newValue == null`, then localstorage was cleared, presumably because the user cleared
  // their browser state. In that case, do nothing and wait for a tab reload or new tab load.
  // That new tab will set the new color mode and the other tabs will receive the updated color mode
  // from another storage event.
  if (key === "theme" && newValue != null) {
    const colorModeData = getColorModeData();
    // If `colorModeData === undefined`, then a new data version is being used and a page reload is needed.
    // If `colorModeData === null`, then our data got deleted or is corrupted. A page reload is needed to reset.
    // In the mean time, we will keep this tab on the old, out of sync color mode.
    if (colorModeData == null) {
      return;
    }
    const colorMode = getUserColorMode(colorModeData);
    // If `colorMode === undefined`, then we might have added a new color mode and a page reload is
    // needed for the new styles to be loaded on this tab. In the mean time, we will keep this
    // tab on the old, out of sync color mode.
    //
    // Additionally, if `colorMode === null` then that means the data for our user was somehow
    // deleted (e.g., we hit the `maxUsers` limit). Let's not do anything in this case either.
    if (colorMode == null) {
      return;
    }
    updateUserColorMode(colorMode);
  }
};

const initializeFromWebview = (colorMode: string) => {
  switch (colorMode) {
    case "system":
    case "light":
    case "dark":
      updateUserColorMode(colorMode);
      break;
    case "none":
    case "": {
      updateUserColorMode("system");
      break;
    }
    default:
      console.warn(`Unknown color mode: ${colorMode}`);
      updateUserColorMode("system");
      break;
  }
};

export type InitializeOptions = {
  defaultColorMode?: ColorMode;
};

const updateBgImage = (bg: HTMLDivElement, path: string) => {
  const shouldHaveBg = /^\/(?:[a-z]{2}\/)?(home|charts|my\/account)\/?$/.test(path);
  if (shouldHaveBg) {
    bg.classList.remove("hidden");
  } else {
    bg.classList.add("hidden");
  }
};

const initializeThemeBackground = () => {
  const bg = document.createElement("div");
  bg.setAttribute("id", "theme-background");
  let oldPath = window.location.pathname;
  updateBgImage(bg, oldPath);
  document.body.appendChild(bg);

  const observer = new MutationObserver(() => {
    const newPath = window.location.pathname;
    if (oldPath !== newPath) {
      oldPath = newPath;
      updateBgImage(bg, newPath);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

export const initialize = (currentUserId: UserId | null, options: InitializeOptions = {}): void => {
  initializeThemeBackground();

  const { classList } = document.body;
  // First, check for color mode classes added by the backend.
  if (classList.contains("color-mode-system") || classList.contains("system-theme")) {
    updateColorModeOverride("system");
    return;
  }
  if (classList.contains("color-mode-light") || classList.contains("light-theme")) {
    updateColorModeOverride("light");
    return;
  }
  if (classList.contains("color-mode-dark") || classList.contains("dark-theme")) {
    updateColorModeOverride("dark");
    return;
  }
  // Next, check for cookie from webview.
  const webviewColorMode = cookie.get("RBXThemeOverride");
  if (webviewColorMode != null) {
    initializeFromWebview(webviewColorMode.value);
    return;
  }
  if (currentUserId == null) {
    updateUserColorMode(defaultColorMode);
    return;
  }

  userId = userIdToNumber(currentUserId);

  const colorModeData = getColorModeData();
  const colorMode = colorModeData == null ? colorModeData : getUserColorMode(colorModeData);

  // Apply `defaultColorMode` once per (user, browser), tracked via `flagDefaultApplied`.
  // Default color mode is light by default, but we want to flip them to dark on first visit.
  // Subsequent visits fall through to the normal local storage path.
  if (options.defaultColorMode != null && colorModeData !== undefined) {
    const userFlags = colorModeData == null ? 0 : getUserFlags(colorModeData);
    if ((userFlags & flagDefaultApplied) === 0) {
      setUserColorModeWithLocalStorage(options.defaultColorMode, flagDefaultApplied);
      window.addEventListener("storage", storageEventListener);
      return;
    }
  }

  if (colorMode === null) {
    // No color mode is in local storage, so we'll initialize to the default color mode.
    setUserColorModeWithLocalStorage(defaultColorMode);
  } else if (colorMode === undefined) {
    // We encountered either:
    // - A new data version in local storage. A page reload is needed to get the new logic.
    // - An unexpected color mode in local storage. We might have added a new color mode and a page reload is
    //   needed to get the new styles and logic.
    // Let's use the default color mode without saving to local storage.
    updateUserColorMode(defaultColorMode);
  } else {
    updateUserColorMode(colorMode);
  }

  window.addEventListener("storage", storageEventListener);

  if (classList.contains("theme-halloween-2026")) {
    updateColorModeOverride("dark");
  }
};

export const setColorMode = (colorMode: ColorMode): void => {
  if (!arrayIncludes(colorModes, colorMode)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.warn(`Unknown color mode: ${colorMode}`);
    return;
  }
  if (colorMode === userColorMode) {
    return;
  }
  setUserColorModeWithLocalStorage(colorMode);
};

export const setColorModeOverride = (colorMode: ColorMode | null): void => {
  if (colorMode != null && !arrayIncludes(colorModes, colorMode)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.warn(`Unknown color mode: ${colorMode}`);
    return;
  }
  const previous = getColorMode();
  colorModeOverride = colorMode;
  const current = getColorMode();
  if (current !== previous) {
    applyColorModeClasses(current);
  }
};

export const resetData = (id: UserId): void => {
  userColorMode = defaultColorMode;
  colorModeOverride = null;
  userId = userIdToNumber(id);
};

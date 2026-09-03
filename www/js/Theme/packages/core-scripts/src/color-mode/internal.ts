// Do not import anything here without checking if you need to update the rspack config for the theme component.

import { arrayIncludes } from "@rbx/core-types";
import * as cookie from "@rbx/core-lib/cookie";
import "@rbx/www-common/global";

// Note: "modes" used to be called "themes". So for legacy reasons, some things still refer to "themes":
// - The mode classes are named as `{light,dark,system}-theme`.
// - The local storage key for modes is `theme`, but this actually stores the mode per user.
// - The webview mode override cookie is `RBXThemeOverride`.

export const modes = ["light", "dark", "system"] as const;
export type Mode = (typeof modes)[number];

export const defaultMode = "light" as const satisfies Mode;

// [user id, mode index, flags?] — flags is optional for entries written before it existed.
type ModeEntry = [number, number] | [number, number, number];
type ModeData = ModeEntry[];

type LocalStorageData = { version: 0; data: ModeData } | { version: 1; data: unknown };

const maxUsers = 100;

export const flagDefaultApplied = 1 << 0;

let userId = -1;
let currentMode: Mode = defaultMode;

const prefersDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const setLightMode = () => {
  const { classList } = document.body;
  classList.add("light-theme");
  classList.remove("dark-theme");
};

const setDarkMode = () => {
  const { classList } = document.body;
  classList.add("dark-theme");
  classList.remove("light-theme");
};

const updateMode = (dark: boolean) => {
  if (dark) {
    setDarkMode();
  } else {
    setLightMode();
  }
};

const modeEventListener = (e: MediaQueryListEvent) => {
  updateMode(e.matches);
};

const setModeWithoutLocalStorage = (mode: Mode): void => {
  currentMode = mode;
  const { classList } = document.body;
  switch (mode) {
    case "system":
      classList.add("system-theme");
      updateMode(prefersDarkMediaQuery.matches);
      prefersDarkMediaQuery.addEventListener("change", modeEventListener);
      break;
    case "light":
      prefersDarkMediaQuery.removeEventListener("change", modeEventListener);
      setLightMode();
      classList.remove("system-theme");
      break;
    case "dark":
      prefersDarkMediaQuery.removeEventListener("change", modeEventListener);
      setDarkMode();
      classList.remove("system-theme");
      break;
  }
};

const getModeData = (): ModeData | null | undefined => {
  try {
    const json = localStorage.getItem("theme");
    if (json == null) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const { version, data } = JSON.parse(json) as LocalStorageData;
    // If version is not 0, then another tab is probably on a more up-to-date version.
    // Let's use the default mode for this tab and do not write to local storage.
    return version === 0 ? data : undefined;
  } catch (e) {
    console.error(`Failed to get mode data: ${e instanceof Error ? e : String(e)}`);
    // Most likely failed to parse mode data. New versions should still follow the same schema and
    // succeed parsing. If we failed here, the data is likely corrupted. Reset to the default value.
    return null;
  }
};

const findUserEntry = (modeData: ModeData): ModeEntry | undefined =>
  modeData.find(([id]) => id === userId);

const getUserFlags = (modeData: ModeData): number => findUserEntry(modeData)?.[2] ?? 0;

const getUserMode = (modeData: ModeData): Mode | null | undefined => {
  const entry = findUserEntry(modeData);
  const modeIndex = entry?.[1];
  return modeIndex == null ? null : modes[modeIndex];
};

// Note: last write to local storage wins which should suffice.
const setModeWithLocalStorage = (mode: Mode, extraFlags = 0): void => {
  setModeWithoutLocalStorage(mode);

  const modeData = getModeData();
  if (modeData === undefined) {
    return;
  }
  const existingFlags = modeData == null ? 0 : getUserFlags(modeData);
  const newmodeData = modeData?.filter(([id]) => id !== userId) ?? [];
  if (newmodeData.length >= maxUsers) {
    newmodeData.shift();
  }
  const flags = existingFlags | extraFlags;
  newmodeData.push(
    flags === 0 ? [userId, modes.indexOf(mode)] : [userId, modes.indexOf(mode), flags],
  );
  try {
    const localStorageData: LocalStorageData = { version: 0, data: newmodeData };
    localStorage.setItem("theme", JSON.stringify(localStorageData));
  } catch (e) {
    console.error(
      `Could not set mode. Local storage is likely full: ${e instanceof Error ? e : String(e)}`,
    );
  }
};

const storageEventListener = ({ key, newValue }: StorageEvent) => {
  // If `newValue == null`, then localstorage was cleared, presumably because the user cleared
  // their browser state. In that case, do nothing and wait for a tab reload or new tab load.
  // That new tab will set the new mode and the other tabs will receive the updated mode
  // from another storage event.
  if (key === "theme" && newValue != null) {
    const modeData = getModeData();
    // If `modeData === undefined`, then a new data version is being used and a page reload is needed.
    // If `modeData === null`, then our data got deleted or is corrupted. A page reload is needed to reset.
    // In the mean time, we will keep this tab on the old, out of sync mode.
    if (modeData == null) {
      return;
    }
    const mode = getUserMode(modeData);
    // If `mode === undefined`, then we might have added a new mode and a page reload is
    // needed for the new styles to be loaded on this tab. In the mean time, we will keep this
    // tab on the old, out of sync mode.
    //
    // Additionally, if `mode === null` then that means the data for our user was somehow
    // deleted (e.g., we hit the `maxUsers` limit). Let's not do anything in this case either.
    if (mode == null) {
      return;
    }
    setModeWithoutLocalStorage(mode);
  }
};

// If the `RBXThemeOverride` cookie is provided, we disable reading and writing from local storage
// as well the ability to change mode. Currently used for webviews.
const initializeUsingOverride = (mode: string) => {
  switch (mode) {
    case "system":
    case "light":
    case "dark":
      setModeWithoutLocalStorage(mode);
      break;
    case "none":
    case "": {
      setModeWithoutLocalStorage("system");
      break;
    }
    default:
      console.warn(`Unknown mode: ${mode}`);
      setModeWithoutLocalStorage("system");
      break;
  }
};

export type InitializeOptions = {
  defaultMode?: Mode;
};

export const initialize = (currentUserId: number, options: InitializeOptions = {}): void => {
  const { classList } = document.body;
  if (classList.contains("system-theme")) {
    setModeWithoutLocalStorage("system");
    return;
  }
  if (classList.contains("light-theme")) {
    setModeWithoutLocalStorage("light");
    return;
  }
  if (classList.contains("dark-theme")) {
    setModeWithoutLocalStorage("dark");
    return;
  }

  const override = cookie.get("RBXThemeOverride");
  if (override != null) {
    initializeUsingOverride(override.value);
    return;
  }

  userId = currentUserId;

  const modeData = getModeData();
  const mode = modeData == null ? modeData : getUserMode(modeData);

  // Apply `defaultMode` once per (user, browser), tracked via `flagDefaultApplied`.
  // This intentionally takes precedence over any server-rendered body-class mode:
  // e.g. kids pages render light by default, but we want to flip them to dark on
  // first visit. Subsequent visits fall through to the normal local storage path.
  if (options.defaultMode != null && modeData !== undefined) {
    const userFlags = modeData == null ? 0 : getUserFlags(modeData);
    if ((userFlags & flagDefaultApplied) === 0) {
      setModeWithLocalStorage(options.defaultMode, flagDefaultApplied);
      window.addEventListener("storage", storageEventListener);
      return;
    }
  }

  if (mode === null) {
    // No mode is in local storage, so we'll initialize to the default mode.
    setModeWithLocalStorage(defaultMode);
  } else if (mode === undefined) {
    // We encountered either:
    // - A new data version in local storage. A page reload is needed to get the new logic.
    // - An unexpected mode in local storage. We might have added a new mode and a page reload is
    //   needed to get the new styles and logic.
    // Let's use the default mode without saving to local storage.
    setModeWithoutLocalStorage(defaultMode);
  } else {
    setModeWithoutLocalStorage(mode);
  }

  window.addEventListener("storage", storageEventListener);
};

export const getMode = (): Mode => currentMode;

export const setMode = (mode: Mode): void => {
  if (!arrayIncludes(modes, mode)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.warn(`Unknown mode: ${mode}`);
    return;
  }
  if (mode === currentMode) {
    return;
  }
  setModeWithLocalStorage(mode);
};

export const resetData = (): void => {
  currentMode = defaultMode;
  userId = -1;
};

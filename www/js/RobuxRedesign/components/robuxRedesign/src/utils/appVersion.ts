import { navigator } from "@rbx/core-lib/browser";

/**
 * Returns the Roblox app minor version (e.g. 745 for `RobloxApp/2.745.56`) from the user agent,
 * or null outside the Roblox app. Every app WebView UA carries the `RobloxApp/<version>` token,
 * e.g. `ROBLOX Android App 2.745.56 Phone Hybrid() GooglePlayStore RobloxApp/2.745.56 (GlobalDist; GooglePlayStore)`.
 */
export const getRobloxAppMinorVersion = (): number | null => {
  if (navigator === undefined) {
    return null;
  }

  const match = /RobloxApp\/\d+\.(\d+)/.exec(navigator.userAgent);
  if (match?.[1] == null) {
    return null;
  }

  const minor = Number.parseInt(match[1], 10);
  return Number.isNaN(minor) ? null : minor;
};

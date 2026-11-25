import { window } from "@rbx/core-lib/browser";

export type OpenAccountSettingsOptions = {
  /**
   * Identifies the calling surface, e.g. `Client_Home_RecommendedForYou`. Not used yet: it lets
   * a later in-context presentation tailor itself per surface without callers changing.
   */
  surfaceKey: string;
};

// Where the settings live today. Internal: callers don't depend on which page or route opens.
const settingsUrl = "/my/account#!/personalized-recommendations";

/**
 * Opens the account settings from any surface. Call it from a button, menu item or row handler;
 * callers render their own control and nothing else.
 *
 * What opens, and how it's presented, is this package's decision, so callers don't change when
 * either does.
 */
export const openAccountSettings = (_options: OpenAccountSettingsOptions): void => {
  window?.location.assign(settingsUrl);
};

/**
 * Config for the web edit-frame experience.
 *
 * User-facing copy lives in `useProfileFrameCopy` (routed through `translate(...)` with
 * English fallbacks), not here.
 */

/**
 * Roblox Plus page. Non-Plus users are sent here from the frame dialog's upsell
 * (banner + primary button) instead of saving a selection.
 */
export const ROBLOX_PLUS_URL = "/plus";

/**
 * "New" badge on the Profile frame row. Client-only, red-dot style: show the badge
 * until the user opens the frame dialog once, then persist "seen" in localStorage so
 * it never comes back on this device. (Swap for a real seen-state service at launch.)
 */
const NEW_BADGE_SEEN_KEY = "profileFrameNewBadgeSeen";

export const hasSeenProfileFrameNewBadge = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    return window.localStorage.getItem(NEW_BADGE_SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

export const markProfileFrameNewBadgeSeen = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(NEW_BADGE_SEEN_KEY, "1");
  } catch {
    // Storage unavailable (private mode / disabled) — badge simply keeps showing.
  }
};

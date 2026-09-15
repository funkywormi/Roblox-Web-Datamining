import localStorage from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";

/** Which referral nav entry a badge belongs to. A user sees only one of the two at a time. */
export type ReferralNavEntry = "share" | "join";

type ClickCounts = Record<string, number>;

const localStorageKey = "plus-referral-nav-badge";

/** Stop showing the New badge once the entry has been clicked this many times. */
const maxClicks = 1;

/**
 * Namespaced by user so a shared device doesn't hide the badge for a sibling, and by entry so a
 * recipient who opens "Join Plus" still gets a badge on "Share Plus" after subscribing.
 */
const entryKey = (entry: ReferralNavEntry): string =>
  `${authenticatedUser()?.id ?? "anonymous"}:${entry}`;

const readClickCounts = (): ClickCounts => {
  let stored: unknown;
  try {
    stored = localStorage.getLocalStorage(localStorageKey);
  } catch {
    // Unparseable value written by an older client, or storage unavailable.
    return {};
  }

  if (stored == null || typeof stored !== "object") {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const counts = (stored as Record<string, unknown>).data;
  if (counts == null || typeof counts !== "object") {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return counts as ClickCounts;
};

export const shouldShowReferralNewBadge = (entry: ReferralNavEntry): boolean => {
  const count = readClickCounts()[entryKey(entry)];
  return typeof count === "number" ? count < maxClicks : true;
};

export const recordReferralNavClick = (entry: ReferralNavEntry): void => {
  const counts = readClickCounts();
  const key = entryKey(entry);
  const count = counts[key];
  counts[key] = (typeof count === "number" ? count : 0) + 1;

  try {
    localStorage.setLocalStorage(localStorageKey, { data: counts });
  } catch {
    // Storage full or unavailable. This runs before the click handler opens the invite sheet, so
    // a throw here would make the entry look dead; badge bookkeeping is best-effort either way.
  }
};

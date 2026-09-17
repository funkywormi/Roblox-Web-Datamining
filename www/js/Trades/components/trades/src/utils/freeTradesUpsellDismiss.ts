import localStorageService from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import tradesConstants from "../constants/tradesConstants";

type FreeTradesUpsellDismissal = {
  dismissedAt: number;
};

const getStorageKey = (): string => {
  const userId = authenticatedUser()?.id ?? 0;
  return `${tradesConstants.freeTradesUpsellStorageKey}-${userId}`;
};

const readDismissal = (): FreeTradesUpsellDismissal | null => {
  const stored = localStorageService.getLocalStorage(getStorageKey()) as
    | FreeTradesUpsellDismissal
    | null
    | undefined;
  return stored && typeof stored === "object" ? stored : null;
};

/** Whether this user has closed the Plus upsell card. Survives reloads. */
export const isFreeTradesUpsellDismissed = (): boolean => Boolean(readDismissal()?.dismissedAt);

/** Persist the close so the card stays hidden on later visits. */
export const markFreeTradesUpsellDismissed = (): void => {
  localStorageService.setLocalStorage(getStorageKey(), {
    dismissedAt: Date.now(),
  } satisfies FreeTradesUpsellDismissal);
};

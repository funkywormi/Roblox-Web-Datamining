import * as localStorage from "@rbx/core-lib/local-storage";
import { document as browserDocument, window as browserWindow } from "@rbx/core-lib/browser";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { sendAuthClientErrorEvent } from "../services/eventService";
import {
  accountSwitcherBlobKey,
  accountSwitcherBlobSyncedKey,
} from "../constants/accountSwitcherConstants";
import "../constants/localStorageRegistry";

export const isAccountSwitchingEnabled = (): boolean => {
  // Next.js renders no account-switching meta tag. The setting is at a 100% rollout, so Next.js
  // always treats it as on. Per-user eligibility is resolved separately through IXP.
  if (process.env.NEXT_PUBLIC_IS_NEXTJS === "true") {
    return true;
  }
  const metaTag = browserDocument?.querySelector<HTMLElement>(
    'meta[name="account-switching-data"]',
  );
  const keyMap = metaTag?.dataset ?? {};
  return keyMap.isAccountSwitchingEnabled === "true";
};

export const getStoredAccountSwitcherBlob = (): string => {
  if (!isAccountSwitchingEnabled()) {
    return "";
  }
  try {
    const blob = localStorage.getItem(accountSwitcherBlobKey);
    if (
      blob == null &&
      localStorage.hasItem(accountSwitcherBlobKey) &&
      browserWindow?.localStorage.getItem(accountSwitcherBlobKey) !== "null"
    ) {
      throw new Error("Stored account switcher blob is not valid JSON");
    }
    // The legacy public contract types this as string even though a missing key returns null.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return blob as string;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageGetFailure,
    );
    return "";
  }
};

export const storeAccountSwitcherBlob = (blob: string): void => {
  if (!isAccountSwitchingEnabled()) {
    return;
  }
  try {
    localStorage.setItem(accountSwitcherBlobKey, blob).getOrThrow();
    localStorage.setItem(accountSwitcherBlobSyncedKey, true).getOrThrow();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageSetFailure,
    );
  }
};

export const deleteAccountSwitcherBlob = (): void => {
  try {
    // Allow deletion even if the feature is turned off for privacy reasons.
    localStorage.removeItem(accountSwitcherBlobKey);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageRemoveFailure,
    );
  }
};

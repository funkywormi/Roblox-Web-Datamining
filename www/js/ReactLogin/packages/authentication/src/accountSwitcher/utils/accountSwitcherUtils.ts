/**
 * A util lib for account switching settings and data.
 */
import { memoize } from "lodash";
import * as localStorage from "@rbx/core-lib/local-storage";
import ExperimentationService from "@rbx/experimentation";
import { TLoggedInUsers } from "@rbx/authentication-common/types/accountSwitcherTypes";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { sendAuthClientErrorEvent } from "../services/eventService";
import {
  accountSwitcherBlobSyncedKey,
  accountSwitcherLayerName,
} from "../constants/accountSwitcherConstants";
import {
  getStoredAccountSwitcherBlob,
  isAccountSwitchingEnabled,
  storeAccountSwitcherBlob,
} from "./accountSwitcherStorage";
import { loadLoggedInUsers, resolveAccountSwitcherAvailability } from "./accountSwitcherUsers";

export {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob,
  isAccountSwitchingEnabled,
  storeAccountSwitcherBlob,
} from "./accountSwitcherStorage";

export { hasAccountSwitcherInvalidSessionError } from "./accountSwitcherUsers";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const memoizedGetAccountSwitchingExperimentValue = memoize(async (): Promise<boolean> => {
  try {
    const experimentParameterValues =
      await ExperimentationService?.getAllValuesForLayer(accountSwitcherLayerName);
    // TODO when shipping Account Switching broadly, return true instead of the statement below
    return !!experimentParameterValues?.isAccountSwitcherEnabled;
  } catch (e) {
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-call
    console.info("Failed to get experiment parameter values for Account Switching", e);
    return false;
  }
}) as () => Promise<boolean>;

/**
 * Check if user is not U13 and account switching is enabled and a blob is available.
 *
 * @returns {{Promise<boolean>}}
 */
export const isAccountSwitcherAvailable = (): Promise<boolean> =>
  resolveAccountSwitcherAvailability(memoizedGetAccountSwitchingExperimentValue);

/**
 * Helper function to parse logged in users.
 * It gets the list of user meta data from getLoggedInUsersMetaData and uses the ids returned to get user info such as username and display names.
 *
 * @returns {TAccountSwitcherMeta} which contains info such as active user, logged out user, isAccountLimitReached, and other logged in users.
 */
export const parseLoggedInUsers = (
  removeInvalidActiveUser: boolean,
  shouldFetchUserInfo = true,
): Promise<TLoggedInUsers> =>
  loadLoggedInUsers(removeInvalidActiveUser, shouldFetchUserInfo, isAccountSwitcherAvailable);

export const syncAccountSwitcherBlobIfNeeded = async (): Promise<void> => {
  try {
    if (localStorage.getItem(accountSwitcherBlobSyncedKey)) {
      return;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    sendAuthClientErrorEvent(
      EVENT_CONSTANTS.context.accountSwitcherLocalStorageFailure,
      EVENT_CONSTANTS.clientErrorTypes.localStorageGetFailure,
    );
    return;
  }
  const blob = getStoredAccountSwitcherBlob();
  if (blob !== null && blob.trim() !== "") {
    await parseLoggedInUsers(false, false);
  }
};

export default {
  isAccountSwitchingEnabled,
  isAccountSwitcherAvailable,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded,
};

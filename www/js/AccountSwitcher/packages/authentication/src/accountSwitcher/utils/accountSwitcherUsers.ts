/**
 * Account switching logic shared by .NET and Next.js.
 *
 * Don't import `@rbx/experimentation` here. The Next.js account switcher imports this file, and
 * the experimentation client is browser-only, so callers pass in the experiment lookup instead.
 */
import { getCurrentUser } from "@rbx/www-common/user";
import { postUsersInfo } from "@rbx/authentication-common/services/usersService";
import { TUserData } from "@rbx/authentication-common/types/userTypes";
import {
  TGetLoggedInUsersMetadataResponse,
  TLoggedInUsers,
  TSwitchResponse,
} from "@rbx/authentication-common/types/accountSwitcherTypes";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import {
  sendAccountSwitchEvent,
  sendAccountSwitcherSwitchResultEvent,
  sendAuthClientErrorEvent,
} from "../services/eventService";
import { getLoggedInUsersMetadata, switchAccount } from "../services/accountSwitcherService";
import {
  accountSwitchServiceErrorCodes,
  accountSwitcherMaxAccounts,
} from "../constants/accountSwitcherConstants";
import {
  getStoredAccountSwitcherBlob,
  isAccountSwitchingEnabled,
  storeAccountSwitcherBlob,
} from "./accountSwitcherStorage";

export const hasAccountSwitcherInvalidSessionError = (switchResponse: TSwitchResponse): boolean => {
  const { errors } = switchResponse;
  if (!errors) {
    return false;
  }

  const hasInvalidSessionError = errors.some(
    error => error.code === accountSwitchServiceErrorCodes.InvalidSession,
  );
  return hasInvalidSessionError;
};

/**
 * Check if user is not U13 and account switching is enabled and a blob is available.
 *
 * @param getExperimentValue Looks up the account switching experiment. Only called when the
 * browser has no blob.
 * @returns {{Promise<boolean>}}
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const resolveAccountSwitcherAvailability = async (
  getExperimentValue: () => Promise<boolean>,
): Promise<boolean> => {
  if (!isAccountSwitchingEnabled()) {
    return false;
  }
  const currentUser = getCurrentUser();
  if (currentUser?.isUnder13) {
    return false;
  }
  const blob = getStoredAccountSwitcherBlob();
  if (blob !== null && blob.trim() !== "") {
    // if the settings are enabled, having a blob always means that the browser can use Account Switching
    return true;
  }

  if (currentUser == null) {
    // if the user is not authenticated and has no blob, account switching is not available. Skip experiment call
    return false;
  }
  return getExperimentValue();
};

const parseUserMetaData = async (
  removeInvalidActiveUser: boolean,
): Promise<[TGetLoggedInUsersMetadataResponse, boolean]> => {
  const blob = getStoredAccountSwitcherBlob();
  let userMetaData = {} as TGetLoggedInUsersMetadataResponse;
  let isAccountLimitReached = false;
  const currentUser = getCurrentUser();
  if (currentUser == null && !blob) {
    // early return if user is not authed and blob is empty, to skip network calls
    // there are no accounts in the switcher and no accounts could be added
    return [userMetaData, isAccountLimitReached];
  }
  // exclude authenticated U13 accounts
  if (!currentUser?.isUnder13) {
    try {
      userMetaData = await getLoggedInUsersMetadata({
        encrypted_users_data_blob: blob,
        remove_invalid_active_user: removeInvalidActiveUser,
      });

      if (userMetaData) {
        storeAccountSwitcherBlob(userMetaData.encrypted_users_data_blob);

        let numOfLoggedInAccounts = userMetaData.logged_in_users_metadata.length;
        if (
          userMetaData.active_user_id &&
          currentUser != null &&
          userMetaData.active_user_id !== currentUser.id
        ) {
          numOfLoggedInAccounts += 1;
        }
        isAccountLimitReached = numOfLoggedInAccounts >= accountSwitcherMaxAccounts;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Parse user meta data failed!", e);
      throw e; // re-throw so that caller can show error to users
    }
  }
  return [userMetaData, isAccountLimitReached];
};

/**
 * Helper function to parse logged in users.
 * It gets the list of user meta data from getLoggedInUsersMetaData and uses the ids returned to get user info such as username and display names.
 *
 * @param isAvailable Checks whether account switching is available before any network call.
 * @returns {TAccountSwitcherMeta} which contains info such as active user, logged out user, isAccountLimitReached, and other logged in users.
 */
export const loadLoggedInUsers = async (
  removeInvalidActiveUser: boolean,
  shouldFetchUserInfo: boolean,
  isAvailable: () => Promise<boolean>,
): Promise<TLoggedInUsers> => {
  let loggedOutUser;
  let activeUser;
  let usersAvailableForSwitching = [] as TUserData[];
  let loggedOutUserId = -1;

  if (!(await isAvailable())) {
    return {
      activeUser,
      usersAvailableForSwitching,
      isAccountLimitReached: false,
      loggedOutUser,
    };
  }

  const [userMetaData, isAccountLimitReached] = await parseUserMetaData(removeInvalidActiveUser);
  if (userMetaData) {
    try {
      const userIds: Array<string> = [];
      if (userMetaData.removed_user_metadata && userMetaData.removed_user_metadata.user_id !== "") {
        loggedOutUserId = Number(userMetaData.removed_user_metadata.user_id);
        userIds.push(userMetaData.removed_user_metadata.user_id);
      }
      if (userMetaData.logged_in_users_metadata) {
        userMetaData.logged_in_users_metadata.forEach(user => {
          userIds.push(user.user_id);
        });
      }

      let users = [] as TUserData[];
      if (shouldFetchUserInfo) {
        users = await postUsersInfo(userIds);
        if (users) {
          if (userMetaData.active_user_id !== "") {
            activeUser = users.find(user => user.id.toString() === userMetaData.active_user_id);
          }
          if (loggedOutUserId !== -1) {
            loggedOutUser = users.find(user => user.id === loggedOutUserId);
          }
          usersAvailableForSwitching = users.filter(
            user =>
              user.id !== loggedOutUserId && user.id.toString() !== userMetaData.active_user_id,
          );
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Getting user info failed!", e);
      sendAuthClientErrorEvent(
        EVENT_CONSTANTS.context.accountSwitcherBackendRequestFailure,
        EVENT_CONSTANTS.clientErrorTypes.userInfoFetchFailed,
      );
      throw e;
    }
  }
  return {
    activeUser,
    usersAvailableForSwitching,
    isAccountLimitReached,
    loggedOutUser,
  };
};

export type SwitchFailureReason = "invalidSession" | "switchError" | "requestFailed";

export type SwitchFailure = {
  readonly reason: SwitchFailureReason;
};

export type AccountSwitchOutcome =
  | { readonly kind: "switched" }
  | { readonly kind: "signInRequired"; readonly failure: SwitchFailure }
  | { readonly kind: "noBlob" };

type SwitchEventContext = Parameters<typeof sendAccountSwitchEvent>[0];
type SwitchEventParams = NonNullable<Parameters<typeof sendAccountSwitchEvent>[2]>;

export type SwitchToAccountOptions = {
  readonly context: SwitchEventContext;
  readonly eventParams: SwitchEventParams;
};

type SwitchClassification = "switched" | SwitchFailureReason;

const classifySwitchResponse = (
  response: TSwitchResponse,
): Exclude<SwitchClassification, "requestFailed"> => {
  if (hasAccountSwitcherInvalidSessionError(response)) {
    return "invalidSession";
  }
  if (response.errors != null && response.errors.length > 0) {
    return "switchError";
  }
  return "switched";
};

export const switchToAccount = async (
  target: Pick<TUserData, "id">,
  options: SwitchToAccountOptions,
): Promise<AccountSwitchOutcome> => {
  const blob = getStoredAccountSwitcherBlob();
  if (!blob) {
    return { kind: "noBlob" };
  }

  const startedAt = Date.now();
  sendAccountSwitchEvent(options.context, String(target.id), options.eventParams);

  let classified: SwitchClassification;
  try {
    const response = await switchAccount({
      switched_from_user_id: getCurrentUser()?.id,
      switched_to_user_id: String(target.id),
      encrypted_users_data_blob: blob,
    });
    storeAccountSwitcherBlob(response.encrypted_users_data_blob);
    classified = classifySwitchResponse(response);
  } catch {
    classified = "requestFailed";
  }

  const elapsed = Date.now() - startedAt;
  const sendResult = (state: Parameters<typeof sendAccountSwitcherSwitchResultEvent>[1]): void => {
    sendAccountSwitcherSwitchResultEvent(options.context, state, elapsed, options.eventParams);
  };

  if (classified === "switched") {
    sendResult(EVENT_CONSTANTS.state.accountSwitcher.switchSuccess);
    return { kind: "switched" };
  }

  sendResult(classified);
  return {
    kind: "signInRequired",
    failure: { reason: classified },
  };
};

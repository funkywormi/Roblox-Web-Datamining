import * as http from "@rbx/core-scripts/http";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import environmentUrls from "@rbx/environment-urls";
import { validationMessages } from "../constants/signupConstants";
import { getHttpStatus, parseErrorCode } from "../utils/requestUtils";

const ACCOUNT_UPGRADE_URL = `${environmentUrls.authApi}/v1/account/upgrade`;
const NOT_APPROVED_URL = `${environmentUrls.userModerationApi}/v2/not-approved`;

enum AccountUpgradeError {
  NotEligible = 3,
  InvalidBirthday = 6,
  FieldNotAllowedForUpgradeType = 9,
  BirthdayRequired = 10,
  InvalidUsername = 11,
  UsernameTaken = 12,
  AccountAlreadyUpgraded = 16,
}

export type UpgradeFailure = {
  field: "birthday" | "username" | "form";
  message: string;
};

const fieldFailures = new Map<number, UpgradeFailure>([
  [
    AccountUpgradeError.InvalidBirthday,
    { field: "birthday", message: validationMessages.birthdayInvalid },
  ],
  [
    AccountUpgradeError.BirthdayRequired,
    { field: "birthday", message: validationMessages.birthdayRequired },
  ],
  [
    AccountUpgradeError.InvalidUsername,
    { field: "username", message: validationMessages.usernameInvalid },
  ],
  [
    AccountUpgradeError.UsernameTaken,
    { field: "username", message: validationMessages.usernameAlreadyInUse },
  ],
  [
    AccountUpgradeError.FieldNotAllowedForUpgradeType,
    { field: "username", message: validationMessages.usernameNotAvailable },
  ],
]);

export const upgradeAccount = async (
  birthday: Date,
  username?: string,
  gender?: number,
): Promise<void> => {
  await http.post(
    { url: ACCOUNT_UPGRADE_URL, withCredentials: true },
    { upgradeType: "OAuth", birthday, username, gender },
  );
};

export const logout = async (): Promise<void> => {
  await http.post({ url: `${environmentUrls.authApi}/v2/logout`, withCredentials: true });
};

export const isRestrictionAlreadyLifted = (error: unknown): boolean => {
  const code = parseErrorCode(error);
  return (
    getHttpStatus(error) === http.HttpResponseCodes.forbidden &&
    (code === AccountUpgradeError.NotEligible ||
      code === AccountUpgradeError.AccountAlreadyUpgraded)
  );
};

export const getUpgradeFailure = (error: unknown): UpgradeFailure => {
  const code = parseErrorCode(error);
  const fieldFailure =
    getHttpStatus(error) === http.HttpResponseCodes.badRequest && code !== null
      ? fieldFailures.get(code)
      : undefined;
  return fieldFailure ?? { field: "form", message: validationMessages.unknownError };
};

/* The gateway lags the account upgrade by a few seconds, so use the Lua client's fixed
 * probing schedule from RefreshAccessStatusWhenUnblocked: an initial settle delay, then a
 * fixed interval with bounded retries (five probes in all) so backoff never delays detection
 * once the gateway unblocks. */
export const UPGRADE_POLL_INITIAL_DELAY_MS = 1000;
export const UPGRADE_POLL_INTERVAL_MS = 1000;
export const UPGRADE_POLL_MAX_RETRIES = 4;

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * After the upgrade API call completes, the gateway can keep reporting the restriction for a
 * few seconds. Follows the Lua client's RefreshAccessStatusWhenUnblocked probing schedule:
 * an initial delay, then probes at a fixed interval with bounded retries — five probes at
 * most. A cleared probe resolves true. Any probe error short-circuits the schedule (as Lua's
 * GatewayProbeFailed does), and the schedule ends resolving false when the retries run out
 * without a cleared probe; the caller owns the outcome and should navigate away rather than
 * retry.
 */
export const waitForUpgradeUnblocked = async (
  checkIsCleared: () => Promise<boolean>,
): Promise<boolean> => {
  await wait(UPGRADE_POLL_INITIAL_DELAY_MS);
  for (let retriesDone = 0; ; retriesDone += 1) {
    let isModerated = false;
    try {
      // The probes must run one after another, each on the fixed schedule.
      // eslint-disable-next-line no-await-in-loop
      if (await checkIsCleared()) {
        return true;
      }
      // A completed probe that reports the restriction is the moderation-block evidence the
      // schedule retries on.
      isModerated = true;
    } catch {
      // A failed probe short-circuits the schedule (as Lua's GatewayProbeFailed does) instead
      // of retrying; the loop below resolves false and the caller navigates away.
    }
    if (!isModerated || retriesDone >= UPGRADE_POLL_MAX_RETRIES) {
      return false;
    }
    // eslint-disable-next-line no-await-in-loop -- the polls must run one after another
    await wait(UPGRADE_POLL_INTERVAL_MS);
  }
};

/* The upgrade complete flow for the modal's default host (the not-approved page): poll the
 * page's own restriction status until the gateway reports it gone, then leave the page. */
const checkNotApprovedCleared = async (): Promise<boolean> => {
  const { data } = await httpService.get<{ restriction?: unknown }>({
    url: NOT_APPROVED_URL,
    withCredentials: true,
  });
  // Treat both an explicit null and an omitted field as cleared; only a present restriction
  // keeps the poll going.
  return data.restriction == null;
};

const navigateHome = (): void => {
  window.location.href = getAbsoluteUrl("/home");
};

/**
 * The modal's post-upgrade flow, matching the Lua client's outcome handling: run the probe
 * schedule, then navigate no matter how it ended — cleared, probe failed, or exhausted
 * while the gateway still reports the restriction. The navigation itself re-fetches the
 * state; if the restriction genuinely remains, the destination page re-blocks.
 *
 * Calls `onRedirecting` right before starting the navigation so the host can hold its UI
 * (loading state, disabled inputs) until the next document takes over — the promise resolves
 * as soon as the navigation starts, but the browser is still on the old page until then.
 * `navigate` defaults to /home; hosts with a pending destination (e.g. a login `returnUrl`)
 * pass their own. `beforeNavigate` runs after the probe schedule, and the navigation waits
 * for it. It must not reject, or the flow rejects and nothing navigates.
 */
export const handleUpgradeComplete = async (
  onRedirecting?: () => void,
  navigate: () => void = navigateHome,
  beforeNavigate?: () => Promise<void>,
): Promise<void> => {
  await waitForUpgradeUnblocked(checkNotApprovedCleared);
  await beforeNavigate?.();
  onRedirecting?.();
  navigate();
};

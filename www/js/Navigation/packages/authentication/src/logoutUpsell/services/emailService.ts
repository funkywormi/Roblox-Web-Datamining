import { parseErrorCode, post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

/**
 * Thin clients for the two account-settings email endpoints used by the
 * logout upsell:
 *
 *   - `submitEmailAddress` → `POST {accountSettingsApi}/v1/email` to set
 *     the user's email.
 *   - `resendVerificationEmail` → `POST {accountSettingsApi}/v1/email/verify`
 *     to (re-)send the verification link to the email currently on file.
 *
 * Errors from both endpoints are returned (not thrown) so callers can render
 * an inline error message without a try/catch. `errorCode` is the numeric
 * `EmailErrorCode` (see
 * workspace/packages/account-settings/src/enums/errorCodes.ts) when the
 * server returns the standard `{ errors: [{ code }] }` body, and `null` for
 * transport-layer failures.
 */

const SUBMIT_EMAIL_URL = `${environmentUrls.accountSettingsApi}/v1/email`;
const RESEND_VERIFICATION_EMAIL_URL = `${environmentUrls.accountSettingsApi}/v1/email/verify`;

export type EmailSubmissionResult = { ok: true } | { ok: false; errorCode: number | null };

export const submitEmailAddress = async (emailAddress: string): Promise<EmailSubmissionResult> => {
  try {
    await post({ url: SUBMIT_EMAIL_URL, withCredentials: true }, { emailAddress });
    return { ok: true };
  } catch (error) {
    return { ok: false, errorCode: parseErrorCode(error) };
  }
};

/**
 * Re-sends the verification link to the email currently on file for the
 * authenticated user. The endpoint takes no body — the server already knows
 * which address to mail because the user just set it via
 * `submitEmailAddress`. Mirrors the `sendVerificationEmail` mutation in
 * `@rbx/account-settings`'s `emailApi`.
 */
export const resendVerificationEmail = async (): Promise<EmailSubmissionResult> => {
  try {
    await post({ url: RESEND_VERIFICATION_EMAIL_URL, withCredentials: true }, {});
    return { ok: true };
  } catch (error) {
    return { ok: false, errorCode: parseErrorCode(error) };
  }
};

/**
 * Maps the Roblox.AccountSettings.Api's EmailErrors enum to translation keys
 * that ship in `Feature.AccountSettings`. Mirrored from
 * `@rbx/account-settings`'s `accountSettingsEmailErrorCodeToStringKeys`
 */
export const EMAIL_SUBMISSION_ERROR_TRANSLATION_KEYS: Record<number, string> = {
  0: "Message.Error.Email.Unknown",
  1: "Message.Error.Email.PinLocked",
  2: "Message.Error.Email.FeatureDisabled",
  3: "Message.Error.Email.TooManyAccounts",
  4: "Message.Error.Email.SameEmail",
  5: "Message.Error.Email.AlreadyVerified",
  6: "Message.Error.Email.TooManyUpdates",
  7: "Message.Error.Email.TooManyVerify",
  8: "Message.Error.Email.IncorrectPassword",
  9: "Message.Error.Email.InvalidEmail",
  10: "Message.Error.Email.NoEmailAssociated",
  11: "Message.Error.Email.RequiresCorpNetwork",
};

/** Translation key used when the error code is missing or unrecognised. */
export const UNKNOWN_EMAIL_SUBMISSION_ERROR_KEY = "Message.Error.Email.Unknown";

export const getEmailSubmissionErrorKey = (errorCode: number | null): string => {
  if (errorCode == null) {
    return UNKNOWN_EMAIL_SUBMISSION_ERROR_KEY;
  }
  return EMAIL_SUBMISSION_ERROR_TRANSLATION_KEYS[errorCode] ?? UNKNOWN_EMAIL_SUBMISSION_ERROR_KEY;
};

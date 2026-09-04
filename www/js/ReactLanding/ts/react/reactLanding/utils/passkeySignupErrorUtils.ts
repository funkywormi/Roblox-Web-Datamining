import { parseErrorCode } from '../../common/utils/requestUtils';
import { errorCodes } from '../constants/signupConstants';

/**
 * Reason label for the `SignupBindFailed` event, or `null` when the rejection
 * is not an outcome and nothing should be emitted.
 *
 * Every terminal passkey-signup rejection is reported so the bind events
 * reconcile against `SignupPreauthCredentialCreated`, which leaves this label
 * carrying the whole distinction between them:
 *
 * - `bindRejected` is the only one that proves an orphaned account — the
 *   server committed the signup and then failed to attach the credential.
 * - `errorCode:<n>` is a signup rejection with no account created.
 * - `httpStatus:<n>` and `unattributed` are indeterminate: the request may or
 *   may not have committed before it failed, so they bound the orphan rate
 *   from above rather than counting it. `unattributed` also covers an
 *   abandoned challenge, which this layer cannot tell from a dropped request.
 */
export const getPasskeyBindFailureReason = (error: unknown): string | null => {
  // parseErrorCode throws on a literal `null` (it treats `typeof null === 'object'`
  // then reads `.data`); real signup rejections are always Axios error objects,
  // but guard so this stays total.
  const code = error === null || error === undefined ? null : parseErrorCode(error);
  // A captcha rejection is a challenge, not an outcome: the surface resubmits
  // the same credential once it is solved, so reporting it here would count a
  // second bind attempt for one created credential.
  if (code === errorCodes.captcha) {
    return null;
  }
  if (code === errorCodes.passkeyRegistrationFailed) {
    return 'bindRejected';
  }
  if (code !== null) {
    return `errorCode:${code}`;
  }

  const status = (error as Record<string, unknown> | null)?.status;
  if (typeof status === 'number' && status > 0) {
    return `httpStatus:${status}`;
  }
  return 'unattributed';
};

export default { getPasskeyBindFailureReason };

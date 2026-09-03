import { RecoveryState } from "../../../common/request/types/accountRecovery";

enum ComponentState {
  // Default state:
  LOADING = "LOADING",

  IDENTIFIER_INPUT = "IDENTIFIER_INPUT",

  SEND_CODE = "SEND_CODE",

  ACCOUNT_VERIFIED_CONFIRMATION = "ACCOUNT_VERIFIED_CONFIRMATION",

  RESEND_OR_VERIFY_CODE = "RESEND_OR_VERIFY_CODE",

  VERIFY_RECOVERY_INTENT = "VERIFY_RECOVERY_INTENT",

  CONTINUE_FALLBACK = "CONTINUE_FALLBACK",

  DISAMBIGUATION_PAGE = "DISAMBIGUATION_PAGE",

  RESET_PASSWORD = "RESET_PASSWORD",

  RECOVERY_SUCCESS = "RECOVERY_SUCCESS",

  CANNOT_RECOVER_ACCOUNT = "CANNOT_RECOVER_ACCOUNT",
}

export const validComponentStatesForRecoverySessionState: Record<RecoveryState, ComponentState[]> =
  {
    [RecoveryState.Invalid]: [ComponentState.CANNOT_RECOVER_ACCOUNT],
    [RecoveryState.AccountIdentifierRequired]: [ComponentState.IDENTIFIER_INPUT],
    [RecoveryState.ContactMethodVerificationRequired]: [ComponentState.SEND_CODE],
    [RecoveryState.AwaitingContactMethodVerification]: [
      ComponentState.RESEND_OR_VERIFY_CODE,
      ComponentState.VERIFY_RECOVERY_INTENT,
    ],
    [RecoveryState.AwaitingReevaluation]: [ComponentState.CANNOT_RECOVER_ACCOUNT],
    [RecoveryState.AccountVerified]: [
      ComponentState.CONTINUE_FALLBACK,
      ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
      ComponentState.DISAMBIGUATION_PAGE,
      ComponentState.RESET_PASSWORD,
      ComponentState.RECOVERY_SUCCESS,
    ],
  };

export default ComponentState;

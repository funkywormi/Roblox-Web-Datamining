import React from "react";
import { pipe } from "fp-ts/function";
import * as boolean from "fp-ts/boolean";
import * as O from "fp-ts/Option";
import { CountryCode, parsePhoneNumberFromString, PhoneNumber } from "libphonenumber-js";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import {
  AccountIntegrityChallengeService,
  AccountSwitcherService,
  DeviceMeta,
  Hybrid,
} from "Roblox";
import { cryptoUtil, hybridResponseService } from "core-roblox-utilities";
import { urlService } from "core-utilities";
import {
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "@rbx/generic-challenge-types";
import { PhonePrefix } from "../../common/request/types/phone";
import {
  AccountRecoveryError,
  ContactMethodType,
  ContinueRecoveryReturnType,
  RecoveryState,
  RequestedRecoveryType,
} from "../../common/request/types/accountRecovery";
import { RequestService } from "../../common/request";
import {
  AccountRecoveryResources,
  mapAccountRecoveryErrorToResource,
  mapPasswordResetErrorToResource,
} from "./constants/resources";
import { AccountRecoveryAction, AccountRecoveryActionType } from "./store/action";
import { AccountRecoveryState } from "./store/state";
import ComponentState from "./store/componentState";
import { CHALLENGE_CONTAINER_ID } from "./app.config";
import ModalState from "./store/modalState";
import { EventService } from "./services/eventservice";

export const formatUsername = (usernameToFormat: string): string => `@${usernameToFormat}`;

// Very basic email regex is suitable for our purposes.
export const emailRegex = /\S+@\S+\.\S+/;
// Very basic phone number regex is suitable for our purposes.
const phoneNumberCharactersRegex = /^[+\d\s\-()]+$/;

const looksLikePhoneNumber = (input: string) => {
  const trimmedInput = input.trim();
  return phoneNumberCharactersRegex.test(trimmedInput);
};

export const getValidParsedPhoneNumber = (
  phone: string,
  phonePrefixList: PhonePrefix[],
  phonePrefixIndex: number | null,
): O.Option<PhoneNumber> => {
  if (!looksLikePhoneNumber(phone)) {
    return O.none;
  }

  const withPrefix = (): O.Option<PhoneNumber> => {
    if (phonePrefixList.length > 0) {
      const code = phonePrefixList[phonePrefixIndex ?? 0]?.code as CountryCode;
      return pipe(
        O.fromNullable(parsePhoneNumberFromString(phone, code)),
        O.filter(pn => pn.isValid()),
      );
    }
    return O.none;
  };

  const withoutPrefix = (): O.Option<PhoneNumber> =>
    pipe(
      O.fromNullable(parsePhoneNumberFromString(phone)),
      O.filter(pn => pn.isValid()),
    );

  const tryBoth = (): O.Option<PhoneNumber> => pipe(withPrefix(), O.alt(withoutPrefix));

  return pipe(
    phonePrefixList.length > 0,
    boolean.match(
      () => withoutPrefix(),
      () => tryBoth(),
    ),
  );
};

export type ProcessedIdentifier =
  | {
      parsedIdentifier: string;
      identifierType: "username";
    }
  | {
      parsedIdentifier: string;
      identifierType: "email";
      contactMethodType: ContactMethodType.Email;
    }
  | {
      parsedIdentifier: string;
      identifierType: "phone";
      contactMethodType: ContactMethodType.Phone;
      phoneNumber: PhoneNumber;
    };

export const processIdentifier = (
  identifier: string,
  phonePrefixList: PhonePrefix[],
  phonePrefixIndex: number | null,
): ProcessedIdentifier => {
  const parsedPhoneOpt = pipe(
    getValidParsedPhoneNumber(identifier, phonePrefixList, phonePrefixIndex),
    O.map(
      pn =>
        ({
          parsedIdentifier: pn.number,
          identifierType: "phone",
          contactMethodType: ContactMethodType.Phone,
          phoneNumber: pn,
        }) as ProcessedIdentifier,
    ),
  );

  const emailOpt = pipe(
    O.fromPredicate((s: string) => emailRegex.test(s))(identifier),
    O.map(
      () =>
        ({
          parsedIdentifier: identifier,
          identifierType: "email",
          contactMethodType: ContactMethodType.Email,
        }) as ProcessedIdentifier,
    ),
  );

  const defaultUsernameOpt = {
    parsedIdentifier: identifier,
    identifierType: "username",
  } as ProcessedIdentifier;

  return pipe(
    emailOpt,
    O.alt(() => parsedPhoneOpt),
    O.getOrElse(() => defaultUsernameOpt),
  );
};

export const handleRequestRecovery = async (
  identifier: string,
  phonePrefixList: PhonePrefix[],
  phonePrefixIndex: number | null,
  requestedRecoveryTypes: RequestedRecoveryType[],
  recoverPassword: boolean,
  recover2sv: boolean,
  recoverySessionId: string,
  requestService: RequestService,
  resources: AccountRecoveryResources,
  dispatch: (action: AccountRecoveryAction) => void,
  onRequestRecoveryError: (error: string) => void,
): Promise<{
  recoveryState: RecoveryState;
  recoverySessionId: string;
  processedIdentifier: ProcessedIdentifier;
} | null> => {
  const processedIdentifier = processIdentifier(identifier, phonePrefixList, phonePrefixIndex);
  const requestRecoveryResult = await requestService.accountRecoveryApi.requestRecovery(
    processedIdentifier.parsedIdentifier,
    processedIdentifier.identifierType,
    requestedRecoveryTypes,
    recoverySessionId,
  );
  if (requestRecoveryResult.isError) {
    onRequestRecoveryError(
      mapAccountRecoveryErrorToResource(resources, requestRecoveryResult.error),
    );
    return null;
  }
  dispatch({
    type: AccountRecoveryActionType.SET_RECOVERY_SESSION_ID,
    recoverySessionId: requestRecoveryResult.value.recoverySessionId,
  });
  const requestRecoveryMetadata = requestRecoveryResult.value.requestRecoveryMetadata;
  if (requestRecoveryMetadata?.userID) {
    dispatch({
      type: AccountRecoveryActionType.SET_USER_ID_TO_RECOVER,
      userIdToRecover: requestRecoveryMetadata.userID,
    });
  }
  if (
    requestRecoveryMetadata &&
    (requestRecoveryMetadata.shouldResetPassword !== undefined ||
      requestRecoveryMetadata.shouldRecover2sv !== undefined)
  ) {
    dispatch({
      type: AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV,
      recoverPassword: requestRecoveryMetadata.shouldResetPassword ?? recoverPassword,
      recover2sv: requestRecoveryMetadata.shouldRecover2sv ?? recover2sv,
    });
  }
  return {
    recoveryState: requestRecoveryResult.value.recoveryState,
    recoverySessionId: requestRecoveryResult.value.recoverySessionId,
    processedIdentifier,
  };
};

type TwoStepVerificationRequiredError = {
  data: {
    errors: {
      code: number;
      fieldData: string;
      message: string;
      userFacingMessage: string;
    }[];
  };
};

type FieldData = {
  challengeId: string;
};

export const getChallengeIdFromTwoStepVerificationError = (
  error: TwoStepVerificationRequiredError,
): string | null => {
  const fieldDataJSON = error?.data?.errors?.[0]?.fieldData;
  if (typeof fieldDataJSON !== "string") return null;

  try {
    const fieldData = JSON.parse(fieldDataJSON) as FieldData;
    return fieldData?.challengeId || null;
  } catch (parseError) {
    return null;
  }
};

// Note: does not support multiple challenges.
export const handleTwoStepVerificationRequiredError = (
  userId: number,
  errorRaw: TwoStepVerificationRequiredError,
  recoverySessionId: string,
  onError: (string?) => void,
  retryRequest: (
    twoStepVerificationChallengeId?: string,
    twoStepVerificationToken?: string,
  ) => Promise<void>,
  onChallengeInvalidatedCallback: OnChallengeInvalidatedCallback,
  onModalChallengeAbandonedCallback: OnModalChallengeAbandonedCallback,
) => {
  const twoStepVerificationChallengeId = getChallengeIdFromTwoStepVerificationError(errorRaw);
  if (!twoStepVerificationChallengeId || !userId) {
    onError();
    return;
  }

  const { TwoStepVerification } = AccountIntegrityChallengeService;

  const rendered = TwoStepVerification.renderChallenge({
    containerId: CHALLENGE_CONTAINER_ID,
    userId: userId.toString(),
    challengeId: twoStepVerificationChallengeId,
    actionType: TwoStepVerification.ActionType.PasswordReset,
    recoveryParameters: {
      clientSupports2svRecovery: true,
      recoverySessionId: recoverySessionId,
    },
    shouldShowRememberDeviceCheckbox: false,
    onChallengeCompleted: data => {
      // Challenge completed; re-attempt the request with the solution token.
      // eslint-disable-next-line no-void
      void retryRequest(twoStepVerificationChallengeId, data.verificationToken);
    },
    onChallengeInvalidated: data => {
      // Session expired so we can try again on behalf of the user.
      if (data.errorCode === TwoStepVerification.ErrorCode.SESSION_EXPIRED) {
        // eslint-disable-next-line no-void
        void retryRequest();
      } else {
        onChallengeInvalidatedCallback(data);
      }
    },
    renderInline: false,
    onModalChallengeAbandoned: () => {
      onModalChallengeAbandonedCallback(() => {
        /* empty */
      });
    },
  });
  if (!rendered) {
    // Not expected to happen.
    onError();
  }
};

export const handleContinueRecovery = async (params: {
  requestService: RequestService;
  resources: AccountRecoveryResources;
  recoverySessionId: string;
  userId: number;
  onSuccess: (data: ContinueRecoveryReturnType) => void | Promise<void>;
  onError: (error: string) => void;
  on2svAbandoned: () => void;
  recover2sv?: boolean;
  twoStepVerificationChallengeId?: string;
  twoStepVerificationToken?: string;
}): Promise<void> => {
  const {
    requestService,
    resources,
    recoverySessionId,
    userId,
    onSuccess,
    onError,
    on2svAbandoned,
    recover2sv,
    twoStepVerificationChallengeId,
    twoStepVerificationToken,
  } = params;
  const continueRecoveryResult = await requestService.accountRecoveryApi.continueRecovery(
    recoverySessionId,
    userId,
    recover2sv,
    twoStepVerificationToken,
    twoStepVerificationChallengeId,
  );
  if (continueRecoveryResult.isError) {
    if (
      continueRecoveryResult.error === AccountRecoveryError.TWO_STEP_VERIFICATION_REQUIRED &&
      continueRecoveryResult.errorRaw
    ) {
      handleTwoStepVerificationRequiredError(
        userId,
        continueRecoveryResult.errorRaw as TwoStepVerificationRequiredError,
        recoverySessionId,
        onError,
        async (twoStepVerificationChallengeId?: string, twoStepVerificationToken?: string) => {
          await handleContinueRecovery({
            ...params,
            twoStepVerificationChallengeId,
            twoStepVerificationToken,
          });
        },
        () => onError(resources.Message.UnknownError),
        () => on2svAbandoned(),
      );
      return;
    }
    onError(mapAccountRecoveryErrorToResource(resources, continueRecoveryResult.error));
    return;
  }
  await onSuccess(continueRecoveryResult.value);
};

export const handlePasswordResetSuccess = (
  accountSwitchingBlob: string,
  eventService: EventService,
  recoverySessionId: string,
  destinationPath?: string,
) => {
  if (
    DeviceMeta?.().isInApp &&
    (DeviceMeta().isPhone || DeviceMeta().isTablet) &&
    Hybrid?.Overlay
  ) {
    Hybrid.Overlay.close(() => undefined);
    return;
  }

  // having an account switching blob means the user is never autologged in. Go to login page immediately after
  const isLoggedIn = !accountSwitchingBlob && !DeviceMeta?.().isInApp;
  const redirectUrl = urlService.getAbsoluteUrl(
    isLoggedIn ? (destinationPath ?? "/home") : "/login",
  );
  eventService.sendPasswordResetEvent(recoverySessionId, redirectUrl);
  window.location.href = redirectUrl;
};

type HandleUpdatePasswordParams = Omit<
  Partial<AccountRecoveryState>,
  "requestService" | "resources" | "eventService"
> &
  Pick<AccountRecoveryState, "requestService" | "resources" | "eventService"> & {
    dispatch: (action: AccountRecoveryAction) => void;
    password?: string;
    confirmPassword?: string;
    onError: (error: string) => void;
    onPasswordResetSuccess: (
      accountSwitchingBlob: string,
      eventService: EventService,
      recoverySessionId: string,
      destinationPath?: string,
    ) => void;
    newEmail?: string;
    twoStepVerificationChallengeId?: string;
    twoStepVerificationToken?: string;
  };

export const handleUpdatePassword = async ({
  requestService,
  resources,
  dispatch,
  eventService,
  recoverySessionId = "",
  userIdToRecover,
  password = "",
  confirmPassword = "",
  onError,
  onPasswordResetSuccess,
  newEmail,
  twoStepVerificationChallengeId,
  twoStepVerificationToken,
}: HandleUpdatePasswordParams) => {
  const accountSwitchingBlob =
    AccountSwitcherService?.getStoredAccountSwitcherBlob(recoverySessionId) ?? "";
  const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
  const resetPasswordResult = await requestService.authApi.resetPassword(
    "RecoverySessionID",
    recoverySessionId,
    userIdToRecover ?? 0,
    password,
    confirmPassword,
    twoStepVerificationChallengeId,
    twoStepVerificationToken,
    accountSwitchingBlob,
    secureAuthenticationIntent,
    undefined,
    undefined,
    newEmail,
  );
  if (resetPasswordResult.isError) {
    onError(mapPasswordResetErrorToResource(resources, resetPasswordResult.error));
    return;
  }
  if (resetPasswordResult.value.shouldPromptCredentialInvalidation) {
    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.INVALIDATE_CREDENTIALS,
      additionalModalProps: {
        shouldPromptPasskeyAddition: resetPasswordResult.value.shouldPromptPasskeyAddition ?? false,
        shouldPrompt2svRemoval: resetPasswordResult.value.shouldPrompt2svRemoval ?? false,
        shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
        updatedEmail: resetPasswordResult.value.recoveryEmail,
        onPasswordResetSuccess: destinationPath => {
          onPasswordResetSuccess(
            accountSwitchingBlob,
            eventService,
            recoverySessionId,
            destinationPath,
          );
        },
      },
    });
  } else if (resetPasswordResult.value.shouldPromptPasskeyAddition) {
    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.ADD_NEW_PASSKEY,
      additionalModalProps: {
        shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
        updatedEmail: resetPasswordResult.value.recoveryEmail,
        onPasswordResetSuccess: destinationPath => {
          onPasswordResetSuccess(
            accountSwitchingBlob,
            eventService,
            recoverySessionId,
            destinationPath,
          );
        },
      },
    });
  } else if (resetPasswordResult.value.shouldPrompt2svRemoval) {
    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD,
      additionalModalProps: {
        shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
        updatedEmail: resetPasswordResult.value.recoveryEmail,
        onPasswordResetSuccess: destinationPath => {
          onPasswordResetSuccess(
            accountSwitchingBlob,
            eventService,
            recoverySessionId,
            destinationPath,
          );
        },
      },
    });
  } else if (resetPasswordResult.value.shouldUpdateEmail) {
    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.UPDATE_EMAIL,
      additionalModalProps: {
        updatedEmail: resetPasswordResult.value.recoveryEmail,
        onPasswordResetSuccess: destinationPath => {
          onPasswordResetSuccess(
            accountSwitchingBlob,
            eventService,
            recoverySessionId,
            destinationPath,
          );
        },
      },
    });
  } else {
    await requestService.accountRecoveryApi.setEmail(recoverySessionId);
    onPasswordResetSuccess(accountSwitchingBlob, eventService, recoverySessionId);
  }
};

type HandleVerifiedRecoveryParams = {
  requestService: RequestService;
  resources: AccountRecoveryResources;
  eventService: EventService;
  dispatch: (action: AccountRecoveryAction) => void;
  recoverySessionId: string;
  userIdToRecover: number | null | undefined;
  contactMethodNumber: number;
  recover2sv: boolean;
  recoverPassword: boolean;
};

/**
 * Advances a recovery flow after any verification method (OTP, backup code, or
 * Recovery Account approval) has successfully verified the recovery session.
 */
export const handleVerifiedRecovery = async ({
  requestService,
  resources,
  eventService,
  dispatch,
  recoverySessionId,
  userIdToRecover,
  contactMethodNumber,
  recover2sv,
  recoverPassword,
}: HandleVerifiedRecoveryParams): Promise<void> => {
  const navigateToContinueFallback = (didAbandon2sv: boolean) => {
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.CONTINUE_FALLBACK,
      additionalComponentProps: {
        didAbandon2sv,
        contactMethodNumber,
      },
    });
  };

  const handleContinueRecoveryResult = async (
    continueRecoveryResult: ContinueRecoveryReturnType,
  ) => {
    switch (continueRecoveryResult.recoveryState) {
      case RecoveryState.AccountVerified:
        // If user is in verified state for 2SV recovery after only
        // verifying one contact method, they must be on creation ip.
        if (contactMethodNumber === 0 && recover2sv) {
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AccountVerified,
            componentState: ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
            additionalComponentProps: null,
          });
          return;
        }
        // If only recovering 2SV, skip navigation to choose account/reset password screen.
        if (recover2sv && !recoverPassword) {
          await handleUpdatePassword({
            requestService,
            resources,
            dispatch,
            eventService,
            recoverySessionId,
            userIdToRecover: userIdToRecover ?? 0,
            password: "",
            confirmPassword: "",
            onError: () => navigateToContinueFallback(false),
            onPasswordResetSuccess: handlePasswordResetSuccess,
          });
          return;
        }
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AccountVerified,
          componentState: ComponentState.DISAMBIGUATION_PAGE,
          additionalComponentProps: null,
        });
        return;
      case RecoveryState.AwaitingReevaluation:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AwaitingReevaluation,
          componentState: ComponentState.CANNOT_RECOVER_ACCOUNT,
          additionalComponentProps: null,
        });
        return;
      case RecoveryState.ContactMethodVerificationRequired:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.ContactMethodVerificationRequired,
          componentState: ComponentState.SEND_CODE,
          additionalComponentProps: {
            phonePrefixIndexAutoFill: null,
            contactMethodAutoFill: "",
            contactMethodNumber: 1,
            previousRecoveryMethod: continueRecoveryResult.previousRecoveryMethod ?? "",
            previousRecoveryMethodTypes: continueRecoveryResult.previousRecoveryMethodTypes ?? [],
            nextRecoveryMethodTypes: continueRecoveryResult.nextRecoveryMethodTypes ?? [],
          },
        });
        return;
      case RecoveryState.AccountIdentifierRequired:
      case RecoveryState.AwaitingContactMethodVerification:
      case RecoveryState.Invalid:
      default:
        navigateToContinueFallback(false);
    }
  };

  if (!userIdToRecover) {
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.DISAMBIGUATION_PAGE,
      additionalComponentProps: null,
    });
    return;
  }

  await handleContinueRecovery({
    requestService,
    resources,
    recoverySessionId,
    userId: userIdToRecover,
    onSuccess: handleContinueRecoveryResult,
    onError: () => navigateToContinueFallback(false),
    on2svAbandoned: () => navigateToContinueFallback(true),
  });
};

type ProfileSectionProps = {
  userId: number;
  combinedName: string;
  username: string;
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userId,
  combinedName,
  username,
}: ProfileSectionProps) => {
  return (
    <div className="flex flex-col items-center padding-bottom-large">
      <div className="avatar avatar-headshot-md card-plain profile-avatar-image">
        <span className="avatar-card-link avatar-image-link">
          <Thumbnail2d
            containerClass="avatar-card-image profile-avatar-thumb"
            targetId={userId}
            format={ThumbnailFormat.webp}
            type={ThumbnailTypes.avatarHeadshot}
            size={ThumbnailAvatarHeadshotSize.size60}
          />
        </span>
      </div>
      <h3 className="padding-bottom-none padding-top-large">{combinedName ?? ""}</h3>
      <span className="text-body-medium">{formatUsername(username)}</span>
    </div>
  );
};

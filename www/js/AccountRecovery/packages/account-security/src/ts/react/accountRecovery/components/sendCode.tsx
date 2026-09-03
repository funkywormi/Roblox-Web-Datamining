import React, { useState } from "react";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { PhoneNumber } from "libphonenumber-js";
import { Modal } from "react-style-guide";
import { SystemBanner, Button } from "@rbx/foundation-ui";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import {
  ContactMethodType,
  contactMethodTypeToString,
  ContinueRecoveryReturnType,
  RecoveryMethodType,
  RecoveryState,
} from "../../../common/request/types/accountRecovery";
import { PhonePrefix } from "../../../common/request/types/phone";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import VariableInputControl from "../../common/variableInputControl";
import ComponentState from "../store/componentState";
import {
  emailRegex,
  getValidParsedPhoneNumber,
  handleContinueRecovery,
  handlePasswordResetSuccess,
  handleUpdatePassword,
  ProfileSection,
} from "../commonHelpers";
import { mapAccountRecoveryErrorToResource } from "../constants/resources";
import { AccountRecoveryActionType } from "../store/action";
import { validateTrue } from "../../common/inputControl";
import { BACKUP_CODE_LENGTH } from "../app.config";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";

type processedContactMethod =
  | {
      parsedContactMethod: string;
      contactMethodType: ContactMethodType.Email;
    }
  | {
      parsedContactMethod: string;
      contactMethodType: ContactMethodType.Phone;
      phoneNumber: PhoneNumber;
    }
  | {
      parsedContactMethod: string;
      contactMethodType: ContactMethodType.RecoveryAccount;
    };

// Username validation taken from Roblox user validation utils.
const isValidRecoveryAccountUsername = (username: string): boolean => {
  const underscoreCount = username.split("_").length - 1;
  return (
    username.length >= 3 &&
    username.length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(username) &&
    !username.startsWith("_") &&
    !username.endsWith("_") &&
    underscoreCount <= 1
  );
};

const processContactMethod = (
  contactMethod: string,
  phonePrefixList: PhonePrefix[],
  phonePrefixIndex: number | null,
  allowRecoveryAccountInput: boolean,
): processedContactMethod | null => {
  const parsedPhoneOpt = pipe(
    getValidParsedPhoneNumber(contactMethod, phonePrefixList, phonePrefixIndex),
    O.map(pn => ({
      parsedContactMethod: pn.number,
      contactMethodType: ContactMethodType.Phone,
      phoneNumber: pn,
    })),
  );

  const emailOpt = pipe(
    O.fromPredicate((s: string) => emailRegex.test(s))(contactMethod),
    O.map(
      () =>
        ({
          parsedContactMethod: contactMethod,
          contactMethodType: ContactMethodType.Email,
        }) as processedContactMethod,
    ),
  );

  // Simple client-side syntax validation is done to prevent knowingly-malformed backend calls.
  const recoveryAccountOpt = pipe(
    O.fromPredicate(
      () => allowRecoveryAccountInput && isValidRecoveryAccountUsername(contactMethod),
    )(contactMethod),
    O.map(
      () =>
        ({
          parsedContactMethod: contactMethod,
          contactMethodType: ContactMethodType.RecoveryAccount,
        }) as processedContactMethod,
    ),
  );

  return pipe(
    parsedPhoneOpt,
    O.alt(() => emailOpt),
    O.alt(() => recoveryAccountOpt),
    O.getOrElse(() => null as processedContactMethod | null),
  );
};

const SendCode: React.FC = () => {
  const {
    state: {
      resources,
      eventService,
      requestService,
      componentStateAndProps,
      phonePrefixList,
      userIdToRecover,
      username,
      combinedName,
      recoverySessionId,
      recover2sv,
      recoverPassword,
    },
    dispatch,
  } = useAccountRecoveryContext();

  /*
   * Component State
   */
  let contactMethodAutoFill = "";
  let phonePrefixIndexAutoFill: number | null = null;
  let contactMethodNumber = 0;
  let previousRecoveryMethod = "";
  let nextRecoveryMethodTypes: RecoveryMethodType[] = [];
  if (componentStateAndProps.componentState === ComponentState.SEND_CODE) {
    contactMethodAutoFill = componentStateAndProps.additionalComponentProps.contactMethodAutoFill;
    phonePrefixIndexAutoFill =
      componentStateAndProps.additionalComponentProps.phonePrefixIndexAutoFill;
    contactMethodNumber = componentStateAndProps.additionalComponentProps.contactMethodNumber ?? 0;
    previousRecoveryMethod =
      componentStateAndProps.additionalComponentProps.previousRecoveryMethod ?? "";
    nextRecoveryMethodTypes =
      componentStateAndProps.additionalComponentProps.nextRecoveryMethodTypes ?? [];
  }

  // Experiment layer for recovery-account-based recovery
  const deviceMeta = getDeviceMeta();
  const experimentLayer = "AccountSecurity.SelfRecovery.RecoveryUI";
  const experiments = useExperiments(experimentLayer);
  const isRecoveryAccountBasedRecoveryEnabled =
    (experiments.isRecoveryAccountBasedRecoveryEnabled as boolean) &&
    deviceMeta !== null &&
    !deviceMeta.isInApp;

  // For the second contact method, the inputs we offer are driven by the recovery
  // methods the backend says are still valid (nextRecoveryMethodTypes).
  const emailRecoveryMethodTypes = [
    RecoveryMethodType.CurrentEmail,
    RecoveryMethodType.BillingEmail,
    RecoveryMethodType.HistoricalEmail,
  ];
  let allowEmailInput = true;
  let allowPhoneInput = true;
  let allowBackupCode = false;
  let allowRecoveryAccountInput = isRecoveryAccountBasedRecoveryEnabled;
  // If nextRecoveryMethodTypes is empty for some reason, fall back to allowing
  // all three (or four) inputs rather than locking the user out.
  if (contactMethodNumber === 1 && nextRecoveryMethodTypes.length > 0) {
    allowEmailInput = nextRecoveryMethodTypes.some(type => emailRecoveryMethodTypes.includes(type));
    allowPhoneInput = nextRecoveryMethodTypes.includes(RecoveryMethodType.Phone);
    allowBackupCode = nextRecoveryMethodTypes.includes(RecoveryMethodType.BackupCode);
    allowRecoveryAccountInput =
      isRecoveryAccountBasedRecoveryEnabled &&
      nextRecoveryMethodTypes.includes(RecoveryMethodType.RecoveryAccount);
  } else if (contactMethodNumber === 1) {
    allowBackupCode = true;
    allowRecoveryAccountInput = false;
  }
  // Note: these only gate the email/phone text input. The user may still be able
  // to switch to backup code via the toggle button when allowBackupCode is true.
  const disallowPhone = !allowPhoneInput;
  const disallowEmail = !allowEmailInput;
  const disallowRecoveryAccount = !allowRecoveryAccountInput;
  // When backup code is the only available recovery method there is no email/phone
  // input to show, so default straight into the backup-code view.
  const onlyAllowBackupCode =
    allowBackupCode && disallowEmail && disallowPhone && disallowRecoveryAccount;
  // Phone numbers, formatting characters, and spaces. Uses `*` (not `+`) so the
  // field can be cleared/backspaced to empty.
  const phoneOnlyCharactersRegEx = /^[\d\-()\s]*$/;

  const [contactMethod, setContactMethod] = useState<string>(contactMethodAutoFill);
  const [phonePrefixIndex, setPhonePrefixIndex] = useState(phonePrefixIndexAutoFill);
  const [useBackupCode, setUseBackupCode] = useState(onlyAllowBackupCode);

  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  /*
   * Event Handlers
   */
  const clearRequestError = () => setRequestError(null);
  const sendCodeToContactMethod = async () => {
    setRequestInFlight(true);
    clearRequestError();
    const processContactMethodResult = processContactMethod(
      contactMethod,
      phonePrefixList,
      phonePrefixIndex,
      allowRecoveryAccountInput,
    );
    if (processContactMethodResult === null) {
      setRequestInFlight(false);
      if (allowRecoveryAccountInput) {
        setValidationError(resources.Message.Error.InvalidEmailOrPhoneOrRecoveryAccount);
      } else {
        setValidationError(resources.Message.Error.InvalidEmailOrPhone);
      }
      return;
    }
    eventService.sendContactMethodSentEvent(
      recoverySessionId,
      contactMethodTypeToString(processContactMethodResult.contactMethodType),
    );

    const sendCodeResult = await requestService.accountRecoveryApi.sendCode(
      processContactMethodResult.parsedContactMethod,
      processContactMethodResult.contactMethodType,
      recoverySessionId,
      contactMethodNumber,
    );
    if (sendCodeResult.isError) {
      setRequestInFlight(false);
      setRequestError(mapAccountRecoveryErrorToResource(resources, sendCodeResult.error));
      return;
    }

    // Path branches out for recovery-account-based recovery
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AwaitingContactMethodVerification,
      componentState:
        processContactMethodResult.contactMethodType === ContactMethodType.RecoveryAccount
          ? ComponentState.VERIFY_RECOVERY_INTENT
          : ComponentState.RESEND_OR_VERIFY_CODE,
      additionalComponentProps: {
        contactMethodType: processContactMethodResult.contactMethodType,
        contactMethodToDisplay:
          processContactMethodResult.contactMethodType === ContactMethodType.Phone
            ? processContactMethodResult.phoneNumber.formatInternational()
            : processContactMethodResult.parsedContactMethod,
        contactMethodNumber: contactMethodNumber,
      },
    });
  };

  // After the one-time backup code is consumed by verifyBackupCode, any failure
  // in the subsequent continueRecovery / 2SV flow must navigate away from the
  // backup-code form. Re-submitting here would re-verify the already-consumed
  // code and fail, stranding the user. CONTINUE_FALLBACK lets the user retry
  // only continueRecovery without re-verifying.
  const navigateToContinueFallback = () => {
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.CONTINUE_FALLBACK,
      additionalComponentProps: {
        didAbandon2sv: false,
        contactMethodNumber,
      },
    });
  };

  const handleContinueRecoveryAfterBackupVerify = async (
    continueRecoveryResult: ContinueRecoveryReturnType,
  ) => {
    if (continueRecoveryResult.recoveryState !== RecoveryState.AccountVerified) {
      navigateToContinueFallback();
      return;
    }
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
        onError: () => navigateToContinueFallback(),
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
  };

  const attemptVerifyBackupCode = async () => {
    setRequestInFlight(true);
    clearRequestError();

    const verifyBackupCodeResult = await requestService.accountRecoveryApi.verifyBackupCode(
      recoverySessionId,
      contactMethod,
    );
    if (verifyBackupCodeResult.isError) {
      setRequestInFlight(false);
      setRequestError(mapAccountRecoveryErrorToResource(resources, verifyBackupCodeResult.error));
      return;
    }

    await handleContinueRecovery({
      requestService,
      resources,
      recoverySessionId,
      userId: userIdToRecover ?? 0,
      onSuccess: handleContinueRecoveryAfterBackupVerify,
      onError: () => navigateToContinueFallback(),
      on2svAbandoned: () => navigateToContinueFallback(),
    });
  };

  /*
   * Component Markup
   */
  const buttonText = userIdToRecover ? resources.Action.Next : resources.Action.SendCode;
  const bodyText =
    userIdToRecover && isRecoveryAccountBasedRecoveryEnabled
      ? resources.Description.EnterContactMethodAssociatedWithYourAccountV2
      : userIdToRecover
        ? resources.Description.EnterContactMethodAssociatedWithYourAccount
        : resources.Description.SendCodeContactMethodConfirmation;

  const positiveButtonEnabled = () => {
    if (requestInFlight || validationError !== null) {
      return false;
    }
    if (useBackupCode) {
      return contactMethod.length === BACKUP_CODE_LENGTH;
    }
    return contactMethod.length > 0;
  };

  const positiveButton: CardFooterButtonConfig = {
    content: requestInFlight ? <span className="spin spinner-xs spinner-no-margin" /> : buttonText,
    label: buttonText,
    enabled: positiveButtonEnabled(),
    action: () => {
      if (useBackupCode) {
        attemptVerifyBackupCode();
        return;
      }
      sendCodeToContactMethod();
    },
  };

  const negativeButtonText = useBackupCode
    ? disallowPhone
      ? resources.Action.UseEmail
      : disallowEmail
        ? resources.Action.UsePhone
        : resources.Action.UseEmailPhone
    : resources.Action.UseBackupCode;
  const negativeButton: CardFooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      negativeButtonText
    ),
    label: negativeButtonText,
    enabled: !requestInFlight && allowBackupCode,
    action: () => {
      setUseBackupCode(!useBackupCode);
      setContactMethod("");
    },
  };

  return (
    <React.Fragment>
      <ModernCardHeader
        headerText={
          contactMethodNumber === 1
            ? resources.Heading.EnterSecondMethod
            : resources.Heading.RobloxAccountRecovery
        }
      />
      <ModernCardBody>
        {userIdToRecover && contactMethodNumber !== 1 && (
          <ProfileSection
            userId={userIdToRecover}
            combinedName={combinedName ?? ""}
            username={username ?? ""}
          />
        )}
        {contactMethodNumber === 1 && (
          <React.Fragment>
            <SystemBanner
              severity="Info"
              variant="Standard"
              title={resources.Label.PreviousContactMethodVerification(previousRecoveryMethod)}
            />
            <div className="padding-xsmall" />
            <p className="text-align-x-left">
              {useBackupCode
                ? resources.Description.EnterABackupCode
                : disallowPhone
                  ? resources.Description.EnterEmailAddress
                  : disallowEmail
                    ? resources.Description.EnterPhoneNumberSecondMethod
                    : resources.Description.EnterPhoneOrAnotherEmail}
            </p>
            <div className="padding-bottom-large" />
          </React.Fragment>
        )}
        {contactMethodNumber !== 1 && <p className="padding-bottom-large">{bodyText}</p>}
        <VariableInputControl
          id="inputIdentifier"
          label={
            useBackupCode
              ? resources.Label.BackupCode
              : allowRecoveryAccountInput
                ? resources.Label.EmailPhoneRecoveryAccount
                : disallowPhone
                  ? resources.Label.Email
                  : disallowEmail
                    ? resources.Label.Phone
                    : resources.Label.EmailPhone
          }
          inputType="text"
          inputMode={disallowEmail && !useBackupCode && disallowRecoveryAccount ? "tel" : undefined}
          validCharactersRegEx={
            disallowEmail && !useBackupCode && disallowRecoveryAccount
              ? phoneOnlyCharactersRegEx
              : undefined
          }
          autoComplete="off"
          placeholder=""
          disabled={requestInFlight}
          value={contactMethod}
          setValue={setContactMethod}
          canSubmit={positiveButtonEnabled()}
          error={validationError || requestError}
          setError={setValidationError}
          validate={validateTrue}
          handleSubmit={useBackupCode ? attemptVerifyBackupCode : sendCodeToContactMethod}
          hideFeedback
          phoneSelectorEnabled={!disallowPhone && !useBackupCode}
          knownPhoneInput={disallowEmail && !useBackupCode && disallowRecoveryAccount}
          phonePrefixIndex={phonePrefixIndex}
          setPhonePrefixIndex={setPhonePrefixIndex}
          phonePrefixList={phonePrefixList}
          onChange={clearRequestError}
        />
      </ModernCardBody>
      <Modal.Footer>
        <div
          data-testid="send-code-footer"
          style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}
        >
          <Button
            data-testid="send-code-submit-button"
            variant="Emphasis"
            size="Medium"
            aria-label={positiveButton.label}
            isLoading={requestInFlight}
            isDisabled={!positiveButton.enabled}
            onClick={positiveButton.action}
          >
            {positiveButton.content}
          </Button>
          {allowBackupCode && !onlyAllowBackupCode && (
            <Button
              data-testid="send-code-toggle-backup-button"
              variant="Standard"
              size="Medium"
              aria-label={negativeButton.label}
              isLoading={requestInFlight}
              isDisabled={!negativeButton.enabled}
              onClick={negativeButton.action}
            >
              {negativeButton.content}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
};

export default SendCode;

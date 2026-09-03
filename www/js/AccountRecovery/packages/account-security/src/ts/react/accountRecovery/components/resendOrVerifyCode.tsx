import React, { useEffect, useState } from "react";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import { handleVerifiedRecovery, ProfileSection } from "../commonHelpers";
import { validateTrue } from "../../common/inputControl";
import { REGEX_CODE, VERIFICATION_CODE_LENGTH } from "../app.config";
import ComponentState from "../store/componentState";
import { ContactMethodType } from "../../../common/request/types/accountRecovery";
import VariableInputControl from "../../common/variableInputControl";
import { mapAccountRecoveryErrorToResource } from "../constants/resources";
import { useCountdown } from "../../common/countdownTimer";

const ResendOrVerifyCode: React.FC = () => {
  const {
    state: {
      resources,
      requestService,
      eventService,
      componentStateAndProps,
      userIdToRecover,
      username,
      combinedName,
      recoverySessionId,
      recover2sv,
      recoverPassword,
    },
    dispatch,
  } = useAccountRecoveryContext();

  let contactMethodNumber = 0;
  if (componentStateAndProps.componentState === ComponentState.RESEND_OR_VERIFY_CODE) {
    contactMethodNumber = componentStateAndProps.additionalComponentProps.contactMethodNumber ?? 0;
  }

  /*
   * Component State
   */
  const [code, setCode] = useState<string>("");
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  /*
   * Effects
   */
  const { startCountdown, resetCountdown, seconds } = useCountdown(30);
  useEffect(() => {
    startCountdown();
    // Don't invoke this more than once.
  }, []);

  const clearCodeError = () => setCodeError(null);
  const clearResendError = () => setResendError(null);
  useEffect(() => {
    const verifyCodeAndContinue = async () => {
      if (code.length === VERIFICATION_CODE_LENGTH) {
        setRequestInFlight(true);
        clearCodeError();
        const verifyCodeResult = await requestService.accountRecoveryApi.verifyCode(
          recoverySessionId,
          code,
          contactMethodNumber,
        );
        if (verifyCodeResult.isError) {
          setRequestInFlight(false);
          setCodeError(mapAccountRecoveryErrorToResource(resources, verifyCodeResult.error));
          return;
        }
        await handleVerifiedRecovery({
          requestService,
          resources,
          eventService,
          dispatch,
          recoverySessionId,
          userIdToRecover,
          contactMethodNumber,
          recover2sv,
          recoverPassword,
        });
      }
    };
    // eslint-disable-next-line no-void
    void verifyCodeAndContinue();
  }, [code]);
  // This case should never happen.
  if (componentStateAndProps.componentState !== ComponentState.RESEND_OR_VERIFY_CODE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */
  const handleResendCode = async () => {
    clearResendError();
    const resendCodeResult = await requestService.accountRecoveryApi.resendCode(
      recoverySessionId,
      contactMethodNumber,
    );
    if (resendCodeResult.isError) {
      setResendError(mapAccountRecoveryErrorToResource(resources, resendCodeResult.error));
    }
    resetCountdown();
    startCountdown();
  };

  /*
   * Component Markup
   */
  let bodyText: string;
  switch (componentStateAndProps.additionalComponentProps.contactMethodType) {
    case ContactMethodType.Email:
      bodyText = userIdToRecover
        ? resources.Description.EmailCodeSentForUser
        : resources.Description.EmailCodeSent;
      break;
    case ContactMethodType.Phone:
      bodyText = userIdToRecover
        ? resources.Description.PhoneCodeSentForUser
        : resources.Description.PhoneCodeSent;
      break;
    default:
      bodyText = "";
  }

  const enabled = seconds === 0;
  const buttonText = enabled
    ? resources.Label.ResendCode
    : resources.Label.ResendCodeTimer(seconds);
  const resendCodeButton: CardFooterButtonConfig = {
    content: requestInFlight ? <span className="spin spinner-xs spinner-no-margin" /> : buttonText,
    label: resources.Label.ResendCode,
    enabled: !requestInFlight && enabled,
    action: handleResendCode,
  };

  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.RobloxAccountRecovery} />
      <ModernCardBody>
        {userIdToRecover ? (
          <ProfileSection
            userId={userIdToRecover}
            combinedName={combinedName ?? ""}
            username={username ?? ""}
          />
        ) : (
          <div className="flex flex-col items-center padding-bottom-large">
            <span className="text-heading-small">
              {componentStateAndProps.additionalComponentProps.contactMethodToDisplay}
            </span>
          </div>
        )}
        <p className="padding-bottom-large">{bodyText}</p>
        <VariableInputControl
          id="account-recovery-code-input"
          inputType="text"
          label={resources.Label.EnterCode}
          disabled={requestInFlight}
          value={code}
          setValue={setCode}
          error={codeError}
          setError={setCodeError}
          validate={validateTrue}
          canSubmit={false}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          handleSubmit={() => {}}
          onChange={clearCodeError}
          inputMode="numeric"
          autoComplete="off"
          placeholder={resources.Label.SixDigitCode}
          maxLength={VERIFICATION_CODE_LENGTH}
          validCharactersRegEx={REGEX_CODE}
          hideFeedback
          phoneSelectorEnabled={false}
          concealInput
          autoFocus
        />
      </ModernCardBody>
      <ModernCardFooter positiveButton={resendCodeButton} negativeButton={null}>
        {resendError && <p className="text-error xsmall">{resendError}</p>}
      </ModernCardFooter>
    </React.Fragment>
  );
};

export default ResendOrVerifyCode;

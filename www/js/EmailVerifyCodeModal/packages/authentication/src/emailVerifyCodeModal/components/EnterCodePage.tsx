import React, { Fragment, useEffect, useState, ChangeEvent } from "react";
import { Button, DialogBody, Link, TextInput } from "@rbx/foundation-ui";
import { useDebounce } from "@rbx/react-utilities";
import { useTranslations } from "@rbx/www-common/i18n";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import LegalCheckbox from "@rbx/authentication-common/components/LegalCheckbox";
import { emailVerifyCodeModalActionType } from "../store/emailVerifyCodeModalStoreContext";
import { enterCodeStrings, helpUrl } from "../constants/EmailVerifyCodeModalConstants";
import {
  sendOtpModalActionEvent,
  sendOtpButtonClickEvent,
  sendOtpAuthPageLoadEvent,
  sendCodeInputEvent,
  sendOtpCheckboxEvent,
} from "../services/eventService";
import useEmailVerifyCodeModalContext from "../hooks/useEmailVerifyCodeModalContext";
import VerificationDialogHeader from "../../shared/components/VerificationDialogHeader";

export type enterCodePageProps = {
  origin: string;
  titleText: string;
  descriptionText: string;
  legalCheckboxLabel?: string;
  code: string;
  codeLength: number;
  isCheckboxEnabled: boolean;
  isChecked: boolean;
  isLoading: boolean;
  isContinueButtonEnabled: boolean;
  errorMessage: string;
  onResendCode: () => void;
  onContinueButtonPressed: () => void;
  onClose: () => void;
  isChangeEmailEnabled: boolean;
};

const EnterCodePage = ({
  origin,
  titleText,
  descriptionText,
  legalCheckboxLabel,
  code,
  codeLength,
  isCheckboxEnabled,
  isContinueButtonEnabled,
  onContinueButtonPressed,
  onResendCode,
  onClose,
  isChangeEmailEnabled,
}: enterCodePageProps): React.JSX.Element => {
  const translate = useTranslations("Authentication.OneTimePasscode");
  const {
    state: { email, isChecked, isLoading, errorMessage },
    dispatch,
  } = useEmailVerifyCodeModalContext();
  const [isResendEnabled, setIsResendEnabled] = useState(true);
  const [timeUntilResend, setTimeUntilResend] = useState(0);
  const [isFirstCodeChange, setIsFirstCodeChange] = useState(true);

  const debouncedCode = useDebounce(code, 200);

  const context = EVENT_CONSTANTS.context.enterOTP;

  const startCountdownTimer = () => {
    setIsResendEnabled(false);
    if (timeUntilResend === 0) {
      const id = setInterval(() => {
        setTimeUntilResend(time => {
          if (time === 1) {
            clearInterval(id);
            setIsResendEnabled(true);
          }
          return time - 1;
        });
      }, 1000);
    }
    setTimeUntilResend(30);
  };

  const handleResendCode = () => {
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.resendCode, origin);
    onResendCode();
    startCountdownTimer();
  };

  const handleCodeChange = (newCode: string) => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_ERROR, errorMessage: "" });
    const cleanedCode = newCode.replace(/\D/g, "");
    // do not need to slice as input has maxLength of codeLength already
    dispatch({ type: emailVerifyCodeModalActionType.SET_OTP_CODE, code: cleanedCode });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_LEGAL_CHECK, isChecked: e.target.checked });
    sendOtpCheckboxEvent(
      context,
      EVENT_CONSTANTS.btn.parentalConsentCheckbox,
      e.target.checked,
      origin,
    );
  };

  useEffect(() => {
    if (isFirstCodeChange && code.length > 0) {
      setIsFirstCodeChange(false);
      sendCodeInputEvent(origin);
    }
  }, [debouncedCode]);

  const handleClose = (): void => {
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.cancel, origin);
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.dismissed, origin);
    onClose();
  };

  const ResendButtonComponent = () => {
    return (
      <Button
        className="email-verify-code-button width-full !text-label-large"
        variant="Standard"
        size="Small"
        onClick={handleResendCode}
        isDisabled={!isResendEnabled}
        isLoading={isLoading}
      >
        {isResendEnabled
          ? translate(enterCodeStrings.Resend)
          : `${translate(enterCodeStrings.CodeSent)} (${timeUntilResend})`}
      </Button>
    );
  };
  const ContinueButtonComponent = () => {
    if (legalCheckboxLabel) {
      return (
        <Button
          className="email-verify-code-button width-full !text-label-large"
          variant="Emphasis"
          size="Small"
          onClick={onContinueButtonPressed}
          isDisabled={!isContinueButtonEnabled}
        >
          {translate(enterCodeStrings.Continue)}
        </Button>
      );
    }
    return null;
  };

  const LearnMoreComponent = () => {
    if (!legalCheckboxLabel) {
      return (
        <div className="email-verify-code-help-link text-align-x-center">
          <Link size="Small" href={helpUrl} target="_blank" rel="noreferrer">
            {translate(enterCodeStrings.DidNotReceive)}
          </Link>
        </div>
      );
    }
    return null;
  };

  const LegalCheckboxComponent = () => {
    if (legalCheckboxLabel) {
      return (
        <div className="legal-checkbox-container">
          <LegalCheckbox
            id="parent-consent"
            legalText={legalCheckboxLabel}
            isChecked={isChecked}
            disabled={!isCheckboxEnabled}
            onCheckBoxChanged={handleCheckboxChange}
          />
        </div>
      );
    }
    return null;
  };

  const emailHelpTextWithEmailListed = (
    <div
      className="email-verify-code-help-text text-body-small medium:text-body-large"
      dangerouslySetInnerHTML={{
        __html: `<p className='email-verify-code-help-text'>${translate(
          enterCodeStrings.EnterCodeHelp,
          {
            email: `<b>${email}</b>`,
          },
        )}</p>`,
      }}
    />
  );

  const handleChangeEmail = () => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_ENTER_EMAIL_PAGE });
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.changeEmail, origin);
  };

  useEffect(() => {
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.shown, origin);
    sendOtpAuthPageLoadEvent(context, origin);
    startCountdownTimer();
  }, []);

  return (
    <Fragment>
      <VerificationDialogHeader
        className="email-verify-code-header"
        closeClassName="email-verify-code-close"
        titleText={titleText}
        onClose={handleClose}
      />
      <DialogBody className="email-verify-code-body padding-top-medium">
        {isChangeEmailEnabled ? (
          <Fragment>
            {emailHelpTextWithEmailListed}
            <div className="email-verify-code-email-display">
              <button
                className="email-verify-code-change-email-link text-link"
                type="button"
                onClick={handleChangeEmail}
              >
                {translate(enterCodeStrings.ChangeEmail)}
              </button>
            </div>
          </Fragment>
        ) : (
          <p className="email-verify-code-help-text text-body-small medium:text-body-large">
            {descriptionText}
          </p>
        )}
        <TextInput
          aria-label={translate(enterCodeStrings.CodePlaceholder)}
          placeholder={translate(enterCodeStrings.CodePlaceholder)}
          onChange={e => handleCodeChange(e.target.value)}
          type="text"
          inputMode="numeric"
          maxLength={codeLength}
          /* eslint-disable */
          autoFocus
          /* eslint-enable */
          size="Medium"
          value={code}
          isDisabled={isLoading}
          hasError={errorMessage !== ""}
        />
        <div className="email-verify-code-error-text text-body-small content-system-alert">
          {errorMessage}
        </div>
        <LegalCheckboxComponent />
        <ContinueButtonComponent />
        <ResendButtonComponent />
        <LearnMoreComponent />
      </DialogBody>
    </Fragment>
  );
};

export default EnterCodePage;

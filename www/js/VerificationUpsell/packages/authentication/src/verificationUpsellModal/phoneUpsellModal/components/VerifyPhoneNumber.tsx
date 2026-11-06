/* eslint-disable no-nested-ternary */
import type { Translator } from "@rbx/www-common/i18n";
// This is a boiler plate for now.
import React, { useEffect, useState } from "react";
import { Button, DialogBody, Link, TextInput } from "@rbx/foundation-ui";
import { phoneUpsellStrings } from "../../common/constants/translationConstants";
import {
  getErrorEventWithErrorCodeParam,
  sendVerificationUpsellEvent,
} from "../../common/utils/loggingUtils";
import getErrorCodeFromRequestError from "../../common/utils/requestUtils";
import { SET_ERROR_MESSAGE, SET_PAGE, SET_PHONE_VERIFICATION_STATUS } from "../actions/actionTypes";
import { ADD_PHONE_NUMBER_PAGE } from "../constants/pageConstants";
import { phoneNumberA11yInputLabels, phoneSubmissionConstants } from "../constants/phoneConstants";
import events from "../constants/phoneVerificationEventStreamConstants";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import { resendCode, verifyWithCode } from "../services/phoneService";
import { getErrorMessageFromVerificationErrorCode } from "../utils/errorUtils";
import getSectionValueForPage from "../utils/loggingUtils";
import getCleanInputCode from "../utils/verificationCodeUtils";
import InputFieldError from "./InputFieldError";
import getSettingsUIPolicy from "../../common/services/universalAppConfigurationService";
import VerificationDialogHeader from "../../../shared/components/VerificationDialogHeader";

type VerifyPhoneNumberProps = {
  translate: Translator<"Feature.VerificationUpsell">;
  onHide: () => void;
  onVerify: () => Promise<void> | void;
};

function VerifyPhoneNumber({ translate, onHide, onVerify }: VerifyPhoneNumberProps) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const { phone, phonePrefixOptionsList, phonePrefixPickerIndex, pageName, origin } =
    phoneUpsellState;
  const [verificationCodeState, setVerificationCodeState] = useState({
    code: "",
    isReadyToSubmitCode: false,
  });
  const section = getSectionValueForPage(pageName);
  const [timer, setTimer] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  const {
    HeadingVerifyYourPhone,
    ActionChangePhoneNumber,
    ActionContinue,
    ActionResendCode,
    ActionCodeResent,
    LabelEnterCode,
    LabelVerificationCode,
  } = phoneUpsellStrings;

  const { VerificationCodeInputId } = phoneNumberA11yInputLabels;

  const {
    Enter,
    CodeLength,
    CountdownFormatStart,
    CountdownFormatEnd,
    ResendCountdownDuration,
    phoneNumberToShowStr,
  } = phoneSubmissionConstants;

  const prefix = phonePrefixOptionsList?.[phonePrefixPickerIndex]?.prefix ?? "";
  const phoneNumberToShow = phoneNumberToShowStr(prefix, phone);

  async function submitCode() {
    // although we can submit via many methods (press enter, paste, click
    // continue), we will log them all as presses to "Continue"
    sendVerificationUpsellEvent(events.verifyPhoneContinuePressed, {
      origin,
      section,
    });

    if (verificationCodeState.code.length !== CodeLength) {
      // don't verify unless code is the right length
      return;
    }
    setIsSendingCode(true);
    dispatch({
      type: SET_ERROR_MESSAGE,
      errorMessage: "",
    });
    try {
      await verifyWithCode(verificationCodeState.code);
      dispatch({ type: SET_PHONE_VERIFICATION_STATUS, isPhoneVerified: true });
      await onVerify();
    } catch (err) {
      const errorCode = getErrorCodeFromRequestError(err);
      const errorStringResource = getErrorMessageFromVerificationErrorCode(errorCode);
      const errorEvent = getErrorEventWithErrorCodeParam(
        events.phoneNumberModalErrorShown,
        errorCode,
      );
      sendVerificationUpsellEvent(errorEvent, {
        origin,
        section,
      });
      dispatch({
        type: SET_ERROR_MESSAGE,
        errorMessage: errorStringResource,
      });
    } finally {
      setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: false });
      setIsSendingCode(false);
    }
  }

  useEffect(() => {
    if (verificationCodeState.isReadyToSubmitCode) {
      submitCode();
    }
  }, [verificationCodeState]);

  useEffect(() => {
    async function showOrHideResendButton() {
      const policy = (await getSettingsUIPolicy()) as {
        displayPhoneVerificationResendButton?: boolean;
      };
      if (policy.displayPhoneVerificationResendButton) {
        setShowResendButton(true);
      } else {
        setShowResendButton(false);
      }
    }
    showOrHideResendButton();
  }, []);

  function handleChangeNumberClick() {
    sendVerificationUpsellEvent(events.verifyPhoneChangePhoneNumberPressed, {
      origin,
      section,
    });
    dispatch({ type: SET_PAGE, pageName: ADD_PHONE_NUMBER_PAGE });
  }

  function handleCodeChange(input: string) {
    dispatch({
      type: SET_ERROR_MESSAGE,
      errorMessage: "",
    });
    setVerificationCodeState({ ...verificationCodeState, code: getCleanInputCode(input) });
  }

  function handleVerificationCodeFocused() {
    sendVerificationUpsellEvent(events.verifyPhoneCodeFieldPressed, {
      origin,
      section,
    });
  }

  function startCountdownTimer() {
    if (timer === 0) {
      const id = setInterval(() => {
        setTimer(time => {
          if (time === 1) {
            clearInterval(id);
          }
          return time - 1;
        });
      }, 1000);
    }
    setTimer(ResendCountdownDuration);
  }

  function handleResendCode() {
    sendVerificationUpsellEvent(events.verifyPhoneResendPressed, {
      origin,
      section,
    });
    if (timer === 0) {
      resendCode();
      startCountdownTimer();
    }
  }

  function handleKeyDown(value: string) {
    if (value === Enter) {
      // interpret pressing Enter as a click to continue
      setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: true });
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    // window.clipboardData is the legacy IE path this component still supports.
    const legacyClipboard = (window as unknown as { clipboardData?: DataTransfer }).clipboardData;
    const pastedValue = (event.clipboardData || legacyClipboard)?.getData("text") ?? "";
    const cleanedPasteCode = getCleanInputCode(pastedValue);
    setVerificationCodeState({ code: cleanedPasteCode, isReadyToSubmitCode: true });
  }

  function handleContinueClick() {
    setVerificationCodeState({ ...verificationCodeState, isReadyToSubmitCode: true });
  }

  return (
    <React.Fragment>
      <VerificationDialogHeader
        className="phone-upsell-header"
        closeClassName="phone-upsell-close"
        titleClassName="text-heading-small"
        titleText={translate(HeadingVerifyYourPhone)}
        onClose={onHide}
      />
      <DialogBody className="phone-upsell-body padding-top-xlarge">
        <div className="phone-upsell-image" />
        <div className="phone-upsell-text text-body-large text-align-x-center">
          {translate(LabelEnterCode, { phoneNumber: phoneNumberToShow })}
        </div>
        <div className="phone-upsell-change-number text-align-x-center">
          <Link as="button" size="Small" className="content-link" onClick={handleChangeNumberClick}>
            {translate(ActionChangePhoneNumber)}
          </Link>
        </div>
        <label
          htmlFor={VerificationCodeInputId}
          className="phone-upsell-label text-body-small content-default"
        >
          {translate(LabelVerificationCode)}
        </label>
        <TextInput
          id={VerificationCodeInputId}
          inputContainerClassName="phone-upsell-code-input"
          size="Medium"
          type="text" // using text type + filtering for non-numeric chars because "e-+" are special chars in a numeric input
          inputMode="numeric" // use numeric inputMode instead of type=number because number will clip leading zeros in submission
          hasError={!!phoneUpsellState.errorMessage}
          onChange={event => handleCodeChange(event.target.value)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
          placeholder="000000"
          onKeyDown={event => handleKeyDown(event.key)}
          onFocus={handleVerificationCodeFocused}
          value={verificationCodeState.code}
        />
        <InputFieldError translate={translate} />
        <Button
          className="phone-upsell-button width-full !text-label-large"
          variant="Emphasis"
          size="Small"
          isDisabled={isSendingCode || verificationCodeState.code.length !== 6}
          onClick={handleContinueClick}
        >
          {translate(ActionContinue)}
        </Button>
        {showResendButton ? (
          timer === 0 ? (
            <Button
              className="phone-upsell-button width-full !text-label-large"
              variant="Standard"
              size="Small"
              isDisabled={isSendingCode}
              onClick={handleResendCode}
            >
              {translate(ActionResendCode)}
            </Button>
          ) : (
            <Button
              className="phone-upsell-button width-full !text-label-large"
              variant="Standard"
              size="Small"
              isDisabled
            >
              {translate(ActionCodeResent)}
              {CountdownFormatStart + timer + CountdownFormatEnd}
            </Button>
          )
        ) : null}
      </DialogBody>
    </React.Fragment>
  );
}

export default VerifyPhoneNumber;

/**
 * TODO: move to a component library.
 *
 * A simple phone input modal without extra-fluff.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@rbx/foundation-ui";
import { Modal } from "react-style-guide";
import { useQuery } from "@tanstack/react-query";
import {
  GetPhonePrefixesListReturnType,
  PhoneError,
  UpdatePhoneParameters,
  VerifyCodeParameters,
} from "../../../../common/request/types/phone";
import { FragmentModalHeader, HeaderButtonType } from "../../../common/modalHeader";
// TODO: as a component library this will have to be pointed to a modular version of our foundation
// tailwind utilities.
import "../../../../../css/tailwind.css";
import VariableInputControl from "../../../common/variableInputControl";
import { validateTrue } from "../../../common/inputControl";
import { Result } from "../../../../common/result";
import { SECONDS_BETWEEN_RESENDS, useCountdown } from "../../../common/countdownTimer";
import { VERIFICATION_CODE_LENGTH } from "../../../accountRecovery/app.config";
import { REGEX_CODE } from "../../../challenge/twoStepVerification/constants/patterns";
import { debounce } from "../../utils/helperUtils";

export type PhoneSubmitPayload = {
  value: UpdatePhoneParameters;
  innerErrorTextSetter: React.Dispatch<React.SetStateAction<string | null>>;
  phoneModalStateSetter: React.Dispatch<React.SetStateAction<PhoneVerificationState>>;
};

export type PhoneVerificationPayload = {
  verifyCodeParams: VerifyCodeParameters;
  innerErrorTextSetter: React.Dispatch<React.SetStateAction<string | null>>;
  closeModal: () => void;
};

export type ResendCodePayload = {
  innerErrorTextSetter: React.Dispatch<React.SetStateAction<string | null>>;
};

export type PhoneUpdateModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPhoneSubmit: (payload: PhoneSubmitPayload) => void;
  onPhoneVerificationSubmit: (payload: PhoneVerificationPayload) => void;
  onResendCode: (payload: ResendCodePayload) => void;
  getPhonePrefixListImplementation: () => Promise<
    Result<GetPhonePrefixesListReturnType, PhoneError | null>
  >;

  // Initial state - the user has to input a phone number.
  titleText: string;
  bodyText: string;
  footerText: string;
  buttonText: string;
  placeholderText: string;

  // Verification phase - this is basically OTP and we should consolidate this maybe?
  verificationTitleText: string;
  verificationBodyText: (phone: string) => string;
  verificationPlaceholderText: string;
  verificationResendButtonTextContainer: [string, (seconds: number) => string];
  verificationLabelText: string;

  validationErrorText: string;
  // Callers should return a translated string based on a modelled status code.
  translatedRequestErrorText: (errorStatusCode: number) => string;
};

export const tryGetFullyQualifiedPhone = (
  currentPhonePrefixListIndex: number,
  currentPhoneValue: string,
  phonePrefixListResult?: Result<GetPhonePrefixesListReturnType, PhoneError | null>,
): string => {
  if (!phonePrefixListResult || phonePrefixListResult.isError) {
    return "";
  }

  const currentPhonePrefix = phonePrefixListResult.value[currentPhonePrefixListIndex]!;
  return `+${currentPhonePrefix.prefix} ${currentPhoneValue}`;
};

type PhoneVerificationState = "userInput" | "verification";

export const PhoneUpdateModal: React.FC<PhoneUpdateModalProps> = ({
  open,
  setOpen,
  onPhoneSubmit,
  onPhoneVerificationSubmit,
  onResendCode,
  getPhonePrefixListImplementation,
  titleText,
  bodyText,
  footerText,
  buttonText,
  placeholderText,
  verificationTitleText,
  verificationBodyText,
  verificationPlaceholderText,
  verificationResendButtonTextContainer: [
    verificationResendButtonText,
    verificationResendButtonTextWithTimer,
  ],
  verificationLabelText,
  validationErrorText,
  translatedRequestErrorText,
}: PhoneUpdateModalProps) => {
  /**
   * Pre-emptive data fetches. We handle errors at the end to avoid conditional hook usage.
   */
  const { isLoading, data: phonePrefixListResult } = useQuery({
    queryKey: ["phone-prefix"],
    queryFn: getPhonePrefixListImplementation,
  });

  const [inputErrorString, setInputErrorString] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [currentPhonePrefixListIndex, setCurrentPhonePrefixListIndex] = useState<number | null>(
    null,
  );
  const [currentPhoneValue, setCurrentPhoneValue] = useState<string>("");
  const [phoneVerificationState, setPhoneVerificationState] =
    useState<PhoneVerificationState>("userInput");
  const [currentVerificationCodeValue, setCurrentVerificationCodeValue] = useState<string>("");

  /**
   * Effects.
   */

  const { startCountdown, resetCountdown, seconds } = useCountdown(SECONDS_BETWEEN_RESENDS);

  const closeModal = useCallback(() => {
    setPhoneVerificationState("userInput");
    setOpen(false);
    setCurrentPhoneValue("");
    setCurrentVerificationCodeValue("");
  }, [setOpen]);

  const wrappedOnCodeSubmit = useCallback(
    (code: string) => {
      setRequestInFlight(true);
      onPhoneVerificationSubmit({
        verifyCodeParams: { code },
        closeModal,
        innerErrorTextSetter: setInputErrorString,
      });
      setRequestInFlight(false);
    },
    // Avoid new instances of this function as closeModal and the upstream function are not
    // guaranteed to be singletons.
    [],
  );

  const [onPhoneNumberSubmitHandler] = debounce(() => {
    if (!phonePrefixListResult || phonePrefixListResult?.isError) {
      setInputErrorString(translatedRequestErrorText(phonePrefixListResult?.errorStatusCode ?? 0));
      return;
    }
    const selectedPrefix = phonePrefixListResult.value[currentPhonePrefixListIndex ?? 0]!;
    const { prefix } = selectedPrefix;
    const countryCode = selectedPrefix.code;

    // This case should never happen, because it means phone prefix list returned without error
    // but these are still null or empty.
    if (!prefix || !countryCode) {
      setInputErrorString(translatedRequestErrorText(0));
      return;
    }

    onPhoneSubmit({
      value: {
        phone: currentPhoneValue,
        prefix,
        countryCode,
      },
      innerErrorTextSetter: setInputErrorString,
      phoneModalStateSetter: setPhoneVerificationState,
    });
    startCountdown();
  });

  const wrappedOnPhoneSubmit = () => {
    setRequestInFlight(true);
    onPhoneNumberSubmitHandler();
    setRequestInFlight(false);
  };

  useEffect(() => {
    if (currentVerificationCodeValue.length !== VERIFICATION_CODE_LENGTH || requestInFlight) {
      return;
    }

    wrappedOnCodeSubmit(currentVerificationCodeValue);
  }, [currentVerificationCodeValue, wrappedOnCodeSubmit, requestInFlight]);

  const wrappedResendCode = () => {
    setRequestInFlight(true);
    onResendCode({ innerErrorTextSetter: setInputErrorString });
    resetCountdown();
    startCountdown();
    setRequestInFlight(false);
  };

  const onCurrentPhoneChangeHandler = (value?: string) => {
    setCurrentPhoneValue(value ?? "");
  };

  if (phonePrefixListResult?.isError || isLoading) {
    return <React.Fragment />;
  }

  const headingText = () => {
    switch (phoneVerificationState) {
      case "userInput": {
        return titleText;
      }
      case "verification": {
        return verificationTitleText;
      }
      default: {
        return titleText;
      }
    }
  };

  const isPendingInput = phoneVerificationState === "userInput";
  const isPendingVerification = phoneVerificationState === "verification";
  const pendingBody = isPendingInput && (
    <React.Fragment>
      <Modal.Body>
        <div className="text-body-large margin-y-medium">{bodyText}</div>
        <VariableInputControl
          id="userInput"
          inputType="text"
          autoComplete="off"
          placeholder={placeholderText}
          disabled={requestInFlight}
          value={currentPhoneValue}
          setValue={setCurrentPhoneValue}
          canSubmit={!requestInFlight}
          error={inputErrorString}
          setError={setInputErrorString}
          validate={validateTrue}
          handleSubmit={wrappedOnPhoneSubmit}
          hideFeedback
          phoneSelectorEnabled
          phonePrefixIndex={currentPhonePrefixListIndex}
          setPhonePrefixIndex={setCurrentPhonePrefixListIndex}
          phonePrefixList={phonePrefixListResult?.value ?? []}
          onChange={onCurrentPhoneChangeHandler}
          knownPhoneInput
        />
        <div
          className="text-body-small block margin-y-medium"
          // Do NOT allow user input for footerText.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: footerText }}
        />
      </Modal.Body>
      <Modal.Footer className="flex">
        <Button
          variant="Standard"
          className="flex flex-col fill"
          onClick={onPhoneNumberSubmitHandler}
          isDisabled={inputErrorString === validationErrorText || requestInFlight}
          isLoading={requestInFlight}
          data-testid="phone-update-submit"
        >
          {buttonText}
        </Button>
      </Modal.Footer>
    </React.Fragment>
  );

  const isResendEnabled = seconds === 0;
  const maybePendingPhone = tryGetFullyQualifiedPhone(
    currentPhonePrefixListIndex ?? 0,
    currentPhoneValue,
    phonePrefixListResult,
  );
  const pendingVerificationBody = isPendingVerification && (
    <React.Fragment>
      <Modal.Body>
        <div className="text-body-large margin-y-medium">
          {verificationBodyText(maybePendingPhone)}
        </div>
        <VariableInputControl
          id="verification"
          inputType="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={verificationPlaceholderText}
          disabled={requestInFlight}
          value={currentVerificationCodeValue}
          setValue={setCurrentVerificationCodeValue}
          canSubmit={false}
          error={inputErrorString}
          setError={setInputErrorString}
          validate={validateTrue}
          // Submitted implicitly.
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          handleSubmit={() => {}}
          hideFeedback
          phoneSelectorEnabled={false}
          label={verificationLabelText}
          maxLength={VERIFICATION_CODE_LENGTH}
          validCharactersRegEx={REGEX_CODE}
          concealInput
          autoFocus
        />
      </Modal.Body>
      <Modal.Footer className="flex wrap flex-col gap-y-medium">
        <Button
          variant="Standard"
          onClick={wrappedResendCode}
          isDisabled={inputErrorString === validationErrorText || !isResendEnabled}
          isLoading={requestInFlight}
          data-testid="phone-resend-submit"
        >
          {(isResendEnabled && verificationResendButtonText) ||
            verificationResendButtonTextWithTimer(seconds)}
        </Button>
      </Modal.Footer>
    </React.Fragment>
  );

  return (
    <Modal
      show={open}
      onHide={closeModal}
      backdrop="static"
      className="modal-modern margin-y-small"
      data-testid="phone-modal-container"
    >
      <FragmentModalHeader
        headerText={headingText()}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      {pendingBody}
      {pendingVerificationBody}
    </Modal>
  );
};

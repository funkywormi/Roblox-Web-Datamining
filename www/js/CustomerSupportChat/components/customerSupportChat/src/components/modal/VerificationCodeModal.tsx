import React, { Fragment } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { Button, TextInput } from "@rbx/foundation-ui";

const VERIFICATION_CODE_LENGTH = 6;

export interface VerificationCodeModalProps {
  code: string;
  codeError: string;
  isValidatingCode: boolean;
  isResendEnabled: boolean;
  timeUntilResend: number;
  isResending: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResendCode: () => void;
  translate: WithTranslationsProps["translate"];
}

const ResendButtonComponent: React.FC<{
  isResending: boolean;
  isResendEnabled: boolean;
  timeUntilResend: number;
  onResendCode: () => void;
  translate: VerificationCodeModalProps["translate"];
}> = ({ isResending, isResendEnabled, timeUntilResend, onResendCode, translate }) => {
  return (
    <Button
      variant="Standard"
      size="Medium"
      onClick={onResendCode}
      isDisabled={!isResendEnabled || isResending}
      isLoading={isResending}
      aria-label={isResending ? "Resending code" : undefined}
    >
      {isResendEnabled
        ? translate("Action.ResendCode")
        : `${translate("Action.CodeSent")} (${timeUntilResend})`}
    </Button>
  );
};

const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  code,
  codeError,
  isValidatingCode,
  isResendEnabled,
  timeUntilResend,
  isResending,
  onCodeChange,
  onResendCode,
  translate,
}) => {
  return (
    <Fragment>
      <p className="text-base mb-2">{translate("Message.Modal.EnterCodeToProceed")}</p>
      <TextInput
        placeholder={translate("Label.CodePlaceholder")}
        onChange={onCodeChange}
        type="text"
        inputMode="numeric"
        maxLength={VERIFICATION_CODE_LENGTH}
        value={code}
        isDisabled={isValidatingCode}
        autoComplete="off"
        aria-label={translate("Label.EnterVerificationCode")}
      />
      {(isValidatingCode || codeError) && (
        <p
          className={
            isValidatingCode
              ? "muted-text email-verify-code-error-text"
              : "text-error email-verify-code-error-text"
          }
        >
          {isValidatingCode ? translate("Message.Validating") : codeError}
        </p>
      )}
      <ResendButtonComponent
        isResending={isResending}
        isResendEnabled={isResendEnabled}
        timeUntilResend={timeUntilResend}
        onResendCode={onResendCode}
        translate={translate}
      />
    </Fragment>
  );
};

export default VerificationCodeModal;

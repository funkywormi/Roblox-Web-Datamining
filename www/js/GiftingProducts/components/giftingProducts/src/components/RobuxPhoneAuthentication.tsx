import React, { FC, useMemo } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { Button, Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { translationConfig } from "../translation.config";
import { UseRobuxPhoneVerificationResult } from "../hooks/useRobuxPhoneVerification";

const AUTHENTICATION_CODE_LENGTH = 6;

type RobuxPhoneAuthenticationProps = {
  robuxPhoneVerification: UseRobuxPhoneVerificationResult;
} & WithTranslationsProps;

const RobuxPhoneAuthentication: FC<RobuxPhoneAuthenticationProps> = ({
  robuxPhoneVerification: {
    phoneNumber,
    submitPhoneNumber,
    phonePrefixes,
    authenticationCode,
    setAuthenticationCode,
    phonePrefixIndex,
    submitAuthenticationCode,
    changeNumber,
    error,
    isSubmitting,
  },
  translate,
}) => {
  const phonePrefixAndNumber = useMemo(
    () =>
      `+${phonePrefixes[phonePrefixIndex]?.prefix ?? "1"} ${phoneNumber.substring(
        0,
        3,
      )} ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6, 10)}`,
    [phonePrefixes, phonePrefixIndex, phoneNumber],
  );

  return (
    <React.Fragment>
      <Modal.Body>
        <div className="verification-upsell-text-body">
          {translate("Message.PhoneVerification.AuthenticationInstructions", {
            phonePrefixAndNumber,
          })}
        </div>
        <button
          type="button"
          className="phone-number-change-number-button phone-number-text-button"
          onClick={changeNumber}
        >
          {translate("Action.ChangeNumber")}
        </button>
        <input
          type="text" // using text type + filtering for non-numeric chars because "e-+" are special chars in a numeric input
          inputMode="numeric" // use numeric inputMode instead of type=number because number will clip leading zeros in submission
          className={`${
            error ? "input-field-error" : ""
          } form-control input-field input-number verification-code-input`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAuthenticationCode(event.target.value);
          }}
          autoComplete="one-time-code"
          placeholder="6-digit code"
          maxLength={6}
          onKeyDown={event => {
            if (
              (event.key === "Enter" || event.key === "NumpadEnter") &&
              authenticationCode.length === AUTHENTICATION_CODE_LENGTH
            ) {
              // interpret pressing Enter as a click to continue

              submitAuthenticationCode();
            }
          }}
          value={authenticationCode}
        />
        {error && (
          <p className="input-field-error-text sms-code-error text-error modal-error-message">
            {translate(error)}
          </p>
        )}
        <div className="resend-text font-footer">
          {translate("Message.PhoneVerification.DidntReceiveCode")}&nbsp;
          <span
            role="button"
            tabIndex={0}
            onClick={submitPhoneNumber}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === "NumpadEnter") {
                // interpret pressing Enter as a click to continue

                submitPhoneNumber();
              }
            }}
          >
            {translate("Action.SendAgain")}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="buttons-section">
          <Button
            variant={Button.variants.growth}
            width={Button.widths.full}
            size={Button.sizes.medium}
            isDisabled={authenticationCode.length !== AUTHENTICATION_CODE_LENGTH || isSubmitting}
            onClick={submitAuthenticationCode}
          >
            {translate("Action.Verify")}
          </Button>
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
};

export default withTranslations(RobuxPhoneAuthentication, translationConfig);

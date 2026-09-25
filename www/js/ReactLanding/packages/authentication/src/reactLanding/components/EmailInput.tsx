import React from "react";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { FormFieldStatus } from "@rbx/authentication-common/types/signupTypes";
import { signupTranslationConfig } from "../translation.config";
import { signupFormStrings } from "../constants/signupConstants";
import { sendEmailFocusEvent, sendEmailOffFocusEvent } from "../services/eventService";

export type emailInputProps = {
  email: string;
  emailStatus: FormFieldStatus;
  handleEmailChange: (email: string) => void;
  emailErrorMessage: string;
  disabled: boolean;
  emailRef: React.RefObject<HTMLInputElement>;
  translate: WithTranslationsProps["translate"];
};

const EmailInput = ({
  email,
  handleEmailChange,
  emailStatus,
  emailErrorMessage,
  disabled,
  emailRef,
  translate,
}: emailInputProps): JSX.Element => {
  return (
    <div
      className={`${emailStatus === FormFieldStatus.Valid ? "has-success" : ""} ${
        emailStatus === FormFieldStatus.Invalid ? "has-error" : ""
      } form-group`}
    >
      <label htmlFor="landing-email" className="font-caption-header">
        {translate(signupFormStrings.EmailU13)}
      </label>
      {/* Not a valid autocomplete token, so browsers ignore it and the field does not
          autofill. Correcting it would newly enable autofill on the signup form. */}
      {/* eslint-disable-next-line jsx-a11y/autocomplete-valid */}
      <input
        id="signup-email"
        name="signupEmail"
        className="form-control font-body text input-field"
        type="text"
        autoComplete="signup-email"
        placeholder={translate(signupFormStrings.EmailU13)}
        value={email}
        onChange={e => handleEmailChange(e.target.value)}
        onFocus={sendEmailFocusEvent}
        onBlur={sendEmailOffFocusEvent}
        disabled={disabled}
        ref={emailRef}
      />
      <p
        id="signup-emailInputValidation"
        className="form-control-label font-caption-body input-validation text-error"
        aria-live="polite"
      >
        {emailErrorMessage ? translate(emailErrorMessage) : ""}
      </p>
    </div>
  );
};

export default EmailInput;

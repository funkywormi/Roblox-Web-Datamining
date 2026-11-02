import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextInput } from "@rbx/foundation-ui";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { detectInputMethod } from "@rbx/authentication-common/utils/inputMethodUtils";
import {
  sendAuthFormInteractionEvent,
  sendPasswordFocusEvent,
  sendPasswordOffFocusEvent,
  sendUsernameFocusEvent,
  sendUsernameOffFocusEvent,
} from "../services/eventService";
import { loginFormStrings } from "../constants/loginConstants";
import type { loginFormProps } from "./LoginForm";

export type FoundationLoginFormProps = loginFormProps;

const FoundationLoginForm = ({
  captchaId,
  captchaToken,
  credentialValue,
  password,
  isLoading,
  errorMsg,
  translate,
  onFormSubmit,
  onCredentialValueChange,
  onPasswordChange,
  isLoginFormDisabled,
}: FoundationLoginFormProps): React.JSX.Element => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const submittedCaptchaResponse = useRef("");
  const captchaResponse = captchaId && captchaToken ? `${captchaId}:${captchaToken}` : "";
  const isSubmitDisabled =
    isLoading || isLoginFormDisabled || credentialValue.length === 0 || password.length === 0;

  useEffect(() => {
    if (captchaResponse && submittedCaptchaResponse.current !== captchaResponse) {
      submittedCaptchaResponse.current = captchaResponse;
      onFormSubmit(false);
    }
  }, [captchaResponse, onFormSubmit]);

  const sendInputMethodEvent = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ): void => {
    const method = detectInputMethod(event.nativeEvent);
    if (method) {
      sendAuthFormInteractionEvent(EVENT_CONSTANTS.context.loginForm, field, method);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isSubmitDisabled) {
      onFormSubmit();
    }
  };

  const usernameLabel = translate(loginFormStrings.LabelUsernameEmailOrPhone);
  const passwordLabel = translate(loginFormStrings.LabelPassword);
  const hasError = errorMsg.length > 0;

  return (
    <form
      className="flex width-full flex-col gap-large"
      name="loginForm"
      onSubmit={handleSubmit}
      aria-busy={isLoading}
      data-testid="foundation-login-form"
    >
      <TextInput
        id="login-username"
        name="username"
        type="text"
        size="Medium"
        label={usernameLabel}
        placeholder={usernameLabel}
        autoComplete="username webauthn"
        value={credentialValue}
        isDisabled={isLoading}
        onFocus={sendUsernameFocusEvent}
        onBlur={sendUsernameOffFocusEvent}
        onChange={event => {
          sendInputMethodEvent(event, EVENT_CONSTANTS.field.username);
          onCredentialValueChange(event.target.value);
        }}
      />
      <TextInput
        id="login-password"
        name="password"
        type={isPasswordVisible ? "text" : "password"}
        size="Medium"
        label={passwordLabel}
        placeholder={passwordLabel}
        autoComplete="current-password"
        value={password}
        isDisabled={isLoading}
        hasError={hasError}
        error={hasError ? errorMsg : undefined}
        onFocus={sendPasswordFocusEvent}
        onBlur={sendPasswordOffFocusEvent}
        onChange={event => {
          sendInputMethodEvent(event, EVENT_CONSTANTS.field.password);
          onPasswordChange(event);
        }}
        trailingIconNode={
          <IconButton
            type="button"
            icon={isPasswordVisible ? "icon-regular-eye" : "icon-regular-eye-slash"}
            ariaLabel={translate(isPasswordVisible ? "Label.HidePassword" : "Label.ShowPassword")}
            size="XSmall"
            variant="Utility"
            isDisabled={isLoading}
            onClick={() => setIsPasswordVisible(currentValue => !currentValue)}
          />
        }
      />
      <Button
        className="width-full"
        type="submit"
        size="Medium"
        variant="Emphasis"
        isDisabled={isSubmitDisabled}
        isLoading={isLoading}
      >
        {translate(loginFormStrings.ActionSignInSentenceCase)}
      </Button>
    </form>
  );
};

export default FoundationLoginForm;

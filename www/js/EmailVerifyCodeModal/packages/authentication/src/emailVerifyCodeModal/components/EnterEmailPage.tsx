import React, { Fragment, useEffect, useState } from "react";
import { Button, DialogBody, TextInput } from "@rbx/foundation-ui";
import { useDebounce } from "@rbx/react-utilities";
import { useTranslations } from "@rbx/www-common/i18n";
import { isValidEmail } from "@rbx/authentication-common/utils/formUtils";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { emailVerifyCodeModalActionType } from "../store/emailVerifyCodeModalStoreContext";
import { enterEmailStrings, emailLengthLimit } from "../constants/EmailVerifyCodeModalConstants";
import {
  sendOtpModalActionEvent,
  sendOtpButtonClickEvent,
  sendEmailInputEvent,
  sendOtpAuthPageLoadEvent,
} from "../services/eventService";
import useEmailVerifyCodeModalContext from "../hooks/useEmailVerifyCodeModalContext";
import VerificationDialogHeader from "../../shared/components/VerificationDialogHeader";

export type enterEmailPageProps = {
  origin: string;
  titleText: string;
  descriptionText: string;
  onSendCode: () => void;
  errorMessage: string;
  onClose: () => void;
};

const EnterEmailPage = ({
  origin,
  titleText,
  descriptionText,
  onSendCode,
  errorMessage,
  onClose,
}: enterEmailPageProps): React.JSX.Element => {
  const translate = useTranslations("Authentication.Login");
  const {
    state: { email },
    dispatch,
  } = useEmailVerifyCodeModalContext();
  const [isFirstEmailChange, setIsFirstEmailChange] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const context = EVENT_CONSTANTS.context.sendOTP;
  const debouncedEmail = useDebounce(email, 200);

  const handleEmailChange = (newEmail: string) => {
    dispatch({ type: emailVerifyCodeModalActionType.SET_EMAIL, email: newEmail });
  };

  const handleSendCode = () => {
    setIsLoading(true);
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.sendCode, origin);
    onSendCode();
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidEmail(email) && !isLoading) {
      handleSendCode();
    }
  };

  useEffect(() => {
    if (isFirstEmailChange && email.length > 0) {
      setIsFirstEmailChange(false);
      sendEmailInputEvent(origin);
    }

    if (!isValidEmail(debouncedEmail) && debouncedEmail.length > 0) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(enterEmailStrings.InvalidEmail),
      });
    } else {
      // clear error message from failed send code request
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: "",
      });
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (errorMessage) {
      setIsLoading(false);
    }
  }, [errorMessage]);

  const handleClose = (): void => {
    sendOtpButtonClickEvent(context, EVENT_CONSTANTS.btn.cancel, origin);
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.dismissed, origin);
    onClose();
  };

  useEffect(() => {
    sendOtpModalActionEvent(context, EVENT_CONSTANTS.aType.shown, origin);
    sendOtpAuthPageLoadEvent(context, origin);
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
        <p className="email-verify-code-help-text text-body-small medium:text-body-large">
          {descriptionText}
        </p>
        <TextInput
          aria-label={translate(enterEmailStrings.EmailPlaceholder)}
          placeholder={translate(enterEmailStrings.EmailPlaceholder)}
          onChange={e => handleEmailChange(e.target.value)}
          type="email"
          /* eslint-disable */
          autoFocus
          /* eslint-enable */
          size="Medium"
          autoComplete="email"
          maxLength={emailLengthLimit}
          onKeyPress={handleEmailKeyPress}
          value={email}
          hasError={errorMessage !== ""}
        />
        <div className="email-verify-code-error-text text-body-small content-system-alert">
          {errorMessage}
        </div>
        <Button
          className="email-verify-code-button width-full !text-label-large"
          variant="Standard"
          size="Small"
          isDisabled={isLoading || !isValidEmail(email)}
          onClick={handleSendCode}
        >
          {translate(enterEmailStrings.SendCode)}
        </Button>
      </DialogBody>
    </Fragment>
  );
};

export default EnterEmailPage;

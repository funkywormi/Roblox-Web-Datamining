/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@rbx/foundation-ui";
import { useDebounce } from "@rbx/react-utilities";
import { useTranslations } from "@rbx/www-common/i18n";

import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { TEnterCodeErrorEvent } from "@rbx/authentication-common/types/otpTypes";
import { EmailVerifyCodeModalParams } from "../interface";
import useEmailVerifyCodeModalContext from "../hooks/useEmailVerifyCodeModalContext";
import { emailVerifyCodeModalActionType } from "../store/emailVerifyCodeModalStoreContext";

import EnterEmailPage from "../components/EnterEmailPage";
import EnterCodePage from "../components/EnterCodePage";

import { sendCode, resendCode, validateCode } from "../services/otpService";
import {
  pageNames,
  contactType,
  errorCodes,
  errorStrings,
  statusCodes,
} from "../constants/EmailVerifyCodeModalConstants";

import {
  sendErrorEvent,
  sendOtpButtonClickEvent,
  sendOtpModalActionEvent,
} from "../services/eventService";
import "../css/emailVerifyCodeModal.css";

const preventDefault = (event: Event) => event.preventDefault();

export const EmailVerifyCodeModalContainer = ({
  containerId,
  codeLength,
  onEmailCodeEntered,
  onComplete,
  onModalAbandoned,
  enterEmailTitle,
  enterEmailDescription,
  enterCodeTitle,
  enterCodeDescription,
  legalCheckboxLabel,
  origin,
  isChangeEmailEnabled = false,
  renderInWebview,
}: EmailVerifyCodeModalParams): React.JSX.Element => {
  const translate = useTranslations("Authentication.Login");
  const {
    state: {
      emailVerifyCodeModalPage,
      email,
      sessionToken,
      code,
      isChecked,
      isCheckboxEnabled,
      isLoading,
      isCodeValid,
      errorMessage,
      isModalOpen,
      isContinueButtonEnabled,
    },
    dispatch,
  } = useEmailVerifyCodeModalContext();

  const debouncedCode = useDebounce(code, 200);

  // handle email code enter without validation on entries like login with OTP.
  useEffect(() => {
    if (onEmailCodeEntered && !legalCheckboxLabel && debouncedCode.length === codeLength) {
      // eslint-disable-next-line no-void
      void handleValidateCode();
      dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: true });
      sendOtpButtonClickEvent(EVENT_CONSTANTS.context.enterOTP, EVENT_CONSTANTS.btn.login, origin);
    } else if (legalCheckboxLabel) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_CHECKBOX_AND_CONTINUE_BUTTON_STATE,
        isContinueButtonEnabled: debouncedCode.length === codeLength && isChecked,
        isCheckboxEnabled: debouncedCode.length === codeLength,
      });
    }
  }, [debouncedCode, isChecked]);

  useEffect(() => {
    if (legalCheckboxLabel && onComplete && isCodeValid) {
      // handle OTP signup case
      dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });
      sendOtpModalActionEvent(
        EVENT_CONSTANTS.context.enterOTP,
        EVENT_CONSTANTS.aType.dismissed,
        origin,
      );
      sendOtpButtonClickEvent(EVENT_CONSTANTS.context.enterOTP, EVENT_CONSTANTS.btn.signup, origin);
      onComplete({ otpSessionToken: sessionToken, otpContactType: contactType });
    } else if (isCodeValid && onEmailCodeEntered) {
      dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });

      // handle OTP login case
      onEmailCodeEntered(sessionToken, debouncedCode);
    }
  }, [isCodeValid]);

  // attach event listener for onEnterEmailVerifyCodeError to handle errors from
  // submitting the code
  useEffect(() => {
    const onEnterEmailVerifyCodeError = (event: CustomEvent<TEnterCodeErrorEvent>) => {
      if (event.detail) {
        if (event.detail.shouldCloseModal) {
          handleCloseModal();
          return;
        }
        dispatch({
          type: emailVerifyCodeModalActionType.SET_ERROR,
          errorMessage: event.detail.errorMessage,
        });
      }
      dispatch({ type: emailVerifyCodeModalActionType.SET_OTP_CODE, code: "" });
      dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: false });
    };

    window.addEventListener(
      "onEnterEmailVerifyCodeError",
      onEnterEmailVerifyCodeError as EventListener,
    );
    return () => {
      window.removeEventListener(
        "onEnterEmailVerifyCodeError",
        onEnterEmailVerifyCodeError as EventListener,
      );
    };
  }, []);

  // allow this modal to be closed from elsewhere, such as the accountSelector
  // TODO: user createModal function to create modal, so that close method in
  // IModalService can be accessed
  useEffect(() => {
    window.addEventListener("closeEmailVerifyCodeModal", handleCloseModal);
  }, []);

  const handleCloseModal = () => {
    onModalAbandoned();
    dispatch({ type: emailVerifyCodeModalActionType.CLOSE_MODAL });
  };

  const handleError = (error: unknown, ctx: string) => {
    const errorObject = error as Record<string, unknown>;
    const errorCode = errorObject.data;
    const statusCode = errorObject.status;

    dispatch({ type: emailVerifyCodeModalActionType.SET_LOADING, isLoading: false });
    if (errorCode === errorCodes.throttled) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.Throttled),
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    if (errorCode === errorCodes.vpnRequired) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.VpnRequired),
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    // invalid code error
    if (errorCode === errorCodes.codeInvalid) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.CodeInvalid),
      });
      sendErrorEvent(ctx, String(errorCode), origin);
      return;
    }
    // gateWay throttle has no error code, but same statusCode as ip throttle
    if (statusCode === statusCodes.gatewayThrottle) {
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: translate(errorStrings.Throttled),
      });
      sendErrorEvent(ctx, String(statusCode), origin);
      return;
    }
    if (errorCode === errorCodes.sessionTokenInvalid) {
      // this will only be reached from resend endpoint
      // send new code if session token for previous code expired
      sendErrorEvent(ctx, String(errorCode), origin);
      // eslint-disable-next-line no-void
      void handleSendCode();
      return;
    }
    sendErrorEvent(ctx, String(errorCode), origin);
    dispatch({
      type: emailVerifyCodeModalActionType.SET_ERROR,
      errorMessage: translate(errorStrings.Unknown),
    });
  };

  const handleSendCode = async () => {
    try {
      const data = await sendCode({ origin, contactType, contactValue: email });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_SESSION_TOKEN,
        sessionToken: data?.otpSessionToken ?? "",
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: "",
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ENTER_CODE_PAGE,
      });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.sendOTP);
    }
  };

  const handleResendCode = async () => {
    try {
      const data = await resendCode({ contactType, origin, otpSessionToken: sessionToken });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_SESSION_TOKEN,
        sessionToken: data?.otpSessionToken ?? "",
      });
      dispatch({
        type: emailVerifyCodeModalActionType.SET_ERROR,
        errorMessage: "",
      });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.enterOTP);
    }
  };

  const handleValidateCode = async () => {
    try {
      const data = await validateCode({
        passCode: debouncedCode,
        otpSessionToken: sessionToken,
        contactType,
        origin,
      });
      dispatch({ type: emailVerifyCodeModalActionType.SET_CODE_VALID, isCodeValid: true });
    } catch (error) {
      handleError(error, EVENT_CONSTANTS.context.validateOTP);
    }
  };

  const handleContinue = () => {
    if (isContinueButtonEnabled) {
      sendOtpButtonClickEvent(
        EVENT_CONSTANTS.context.enterOTP,
        EVENT_CONSTANTS.btn.continue,
        origin,
      );
      // eslint-disable-next-line no-void
      void handleValidateCode();
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          handleCloseModal();
        }
      }}
      size="Large"
      isModal
      hasMarginTop={false}
      hasCloseAffordance={false}
      experimentalDisablePointerEventsStylingOnBody
    >
      <DialogContent
        className={`email-verify-code-dialog${renderInWebview ? " email-verify-code-webview" : ""}`}
        overlayClassName={renderInWebview ? "email-verify-code-webview-overlay" : undefined}
        // Radix props forwarded through DialogContent's ...props spread (not in its types).
        {...({
          onPointerDownOutside: preventDefault,
          onInteractOutside: preventDefault,
        } as Record<string, unknown>)}
      >
        {emailVerifyCodeModalPage === pageNames.EnterEmail && (
          <EnterEmailPage
            origin={origin}
            titleText={enterEmailTitle}
            descriptionText={enterEmailDescription}
            onSendCode={handleSendCode}
            errorMessage={errorMessage}
            onClose={handleCloseModal}
          />
        )}
        {emailVerifyCodeModalPage === pageNames.EnterCode && sessionToken && (
          <EnterCodePage
            origin={origin}
            titleText={enterCodeTitle}
            descriptionText={enterCodeDescription}
            legalCheckboxLabel={legalCheckboxLabel}
            code={code}
            codeLength={codeLength}
            onContinueButtonPressed={handleContinue}
            onResendCode={handleResendCode}
            isLoading={isLoading}
            isContinueButtonEnabled={isContinueButtonEnabled}
            isCheckboxEnabled={isCheckboxEnabled}
            isChecked={isChecked}
            errorMessage={errorMessage}
            onClose={handleCloseModal}
            isChangeEmailEnabled={isChangeEmailEnabled}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerifyCodeModalContainer;

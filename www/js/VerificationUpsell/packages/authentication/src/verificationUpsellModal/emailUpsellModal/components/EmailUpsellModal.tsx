import React from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { Button, Modal } from "react-style-guide";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import verificationUpsellConstants from "../constants/verificationUpsellConstants";
import useEmailUpsellState from "../hooks/useEmailUpsellState";

const isAndroidApp = getDeviceMeta()?.isAndroidApp ?? false;

type EmailUpsellModalProps = {
  translate: TranslateFunction;
  onHide: () => void;
  show: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (key: string) => void;
  onBackAction: () => void;
  onInputFocus: () => void;
};

function EmailUpsellModal({
  translate,
  onHide,
  show,
  onPrimaryAction,
  onSecondaryAction,
  onInputChange,
  onKeyDown,
  onBackAction,
  onInputFocus,
}: EmailUpsellModalProps) {
  const { emailUpsellState } = useEmailUpsellState();
  const {
    pageName,
    titleText,
    bodyText,
    primaryButtonText,
    secondaryButtonText,
    userEmailInput,
    userEmailInputPlaceholder,
    userEmail,
    errorMsg,
    isEmailSent,
    isEmailUpdating,
  } = emailUpsellState;

  const isUnder13 = authenticatedUser()?.isUnder13;

  return (
    <Modal
      show={show}
      onHide={onHide}
      /* eslint-enable */
      className={`${isAndroidApp ? "verification-android-modal" : ""} verification-modal`}
      size="lg"
      aria-labelledby="verification-upsell-modal-title"
      scrollable="true"
      centered="true"
    >
      <Modal.Header useBaseBootstrapComponent>
        <div className="verification-upsell-title-container">
          <Modal.Title id="verification-upsell-modal-title">{translate(titleText)}</Modal.Title>
        </div>
        {pageName === verificationUpsellConstants.UpdatePassword ? (
          <button type="button" className="close close-button" onClick={onBackAction}>
            <span className="icon-back" />
          </button>
        ) : (
          <button type="button" className="close close-button" onClick={onHide}>
            <span className="icon-close" />
          </button>
        )}
      </Modal.Header>
      <Modal.Body>
        <div className="email-verification-upsell-image" />
        <p className="verification-upsell-text-body">
          {translate(bodyText, { emailAddress: userEmail })}
        </p>
        {pageName === verificationUpsellConstants.UpdateEmail && (
          <input
            type="email"
            /* eslint-disable */
            autoFocus
            /* eslint-enable */
            className={`${
              errorMsg ? "input-field-error" : ""
            } form-control input-field verification-upsell-modal-input`}
            placeholder={translate(userEmailInputPlaceholder)}
            autoComplete="email"
            value={userEmailInput}
            onChange={event => onInputChange(event.target.value)}
            onFocus={() => onInputFocus()}
            onKeyDown={event => onKeyDown(event.key)}
          />
        )}
        {errorMsg && (
          <p className="text-error modal-error-message sms-code-error">{translate(errorMsg)}</p>
        )}
        {pageName === verificationUpsellConstants.UpdateEmail && isUnder13 && (
          <div className="privacy-policy-button">
            <a
              href={verificationUpsellConstants.PrivacyPolicyLink}
              target="_blank"
              rel="noreferrer"
            >
              {translate(verificationUpsellConstants.ActionPrivacyPolicy)}
            </a>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="verification-upsell-footer-container">
          {pageName !== verificationUpsellConstants.Verification && (
            <Button
              className="modal-button verification-upsell-btn"
              variant={Button.variants.cta}
              size={Button.sizes.medium}
              isDisabled={isEmailUpdating}
              onClick={onPrimaryAction}
            >
              {translate(primaryButtonText)}
            </Button>
          )}
          {pageName === verificationUpsellConstants.Verification && (
            <button
              type="button"
              className={`${
                isEmailSent ? "resend-button-disabled" : ""
              } resend-verification-email-button`}
              disabled={isEmailSent || errorMsg !== ""}
              onClick={onPrimaryAction}
            >
              {translate(primaryButtonText)}
            </button>
          )}
          {secondaryButtonText && (
            <button type="button" className="change-email-button" onClick={onSecondaryAction}>
              {translate(secondaryButtonText)}
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default EmailUpsellModal;

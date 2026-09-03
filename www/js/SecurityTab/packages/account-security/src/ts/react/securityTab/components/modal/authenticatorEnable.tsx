import React, { useEffect, useState } from "react";
import { AccountIntegrityChallengeService, DeviceMeta } from "Roblox";
import { authenticatedUser } from "header-scripts";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import InputControl, { validateTrue } from "../../../common/inputControl";
import { REGEX_CODE } from "../../../challenge/twoStepVerification/constants/patterns";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { SecurityTabActionType } from "../../store/action";
import { MediaType } from "../../../challenge/twoStepVerification";

const ModalAuthenticatorEnable: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      resources,
      requestService,
      systemFeedbackService,
      modalStateAndProps,
      twoStepVerificationMetadata,
    },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [setupToken, setSetupToken] = useState<string>("");
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>("");
  const [manualEntryKey, setManualEntryKey] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [codeError, setCodeError] = useState<string | null>(null);
  // If we're running on mobile we show the manual key and not the QR code, which can't be
  // scanned on the same device.
  const [viewQrCode, setViewQrCode] = useState<boolean>(!DeviceMeta().isPhone);

  /*
   * Effects
   */

  useEffect(() => {
    const initializeModal = async () => {
      if (modalStateAndProps.modalState !== ModalState.AUTHENTICATOR_ENABLE) {
        return;
      }
      const enableAuthenticatorResult =
        await requestService.twoStepVerification.enableAuthenticator(
          authenticatedUser.id!.toString(),
        );
      if (enableAuthenticatorResult.isError) {
        const { Generic } = AccountIntegrityChallengeService;
        // Ignore challenge abandons for errors.
        if (Generic.ChallengeError.matchAbandoned(enableAuthenticatorResult.errorRaw)) {
          closeModal();
        } else {
          dispatch({
            type: SecurityTabActionType.SET_MODAL_STATE,
            modalState: ModalState.GENERIC_TEXT_ERROR,
            additionalModalProps: {
              title: resources.Heading.Dialog.DefaultError,
              body: resources.Response.Dialog.DefaultErrorMessage,
              button: resources.Action.Dialog.Success,
            },
          });
        }
        return;
      }
      setSetupToken(enableAuthenticatorResult.value.setupToken);
      setQrCodeImageUrl(enableAuthenticatorResult.value.qrCodeImageUrl);
      setManualEntryKey(enableAuthenticatorResult.value.manualEntryKey);
    };

    // eslint-disable-next-line no-void
    void initializeModal();
  }, []);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.AUTHENTICATOR_ENABLE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);

  const toggleQrCode = () => {
    setViewQrCode(!viewQrCode);
  };

  const onManualKeyClick = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(manualEntryKey);
      systemFeedbackService.success(resources.Message.ManualKeyCopied);
    }
  };

  const handleManualKeyKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      await onManualKeyClick();
    }
  };

  const enableVerifyCode = async () => {
    setRequestInFlight(true);
    setRequestError(null);

    const enableVerifyAuthenticatorResult =
      await requestService.twoStepVerification.enableVerifyAuthenticator(
        authenticatedUser.id!.toString(),
        setupToken,
        code,
      );

    if (enableVerifyAuthenticatorResult.isError) {
      setRequestInFlight(false);
      setRequestError(
        mapTwoStepVerificationErrorToResource(resources, enableVerifyAuthenticatorResult.error),
      );
      return;
    }

    dispatch({
      type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
      mediaType: MediaType.Authenticator,
    });

    const { recoveryCodes } = enableVerifyAuthenticatorResult.value;

    const shouldProceedToSecurityKey =
      modalStateAndProps.additionalModalProps?.onAuthenticatorComplete;

    // Only skip recovery code generation if no recovery codes
    // were auto-generated (because recovery codes already exist).
    if (recoveryCodes && recoveryCodes.length > 0) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.RECOVERY_CODES_DISPLAY,
        additionalModalProps: {
          recoveryCodes,
          onRecoveryCodesComplete: shouldProceedToSecurityKey,
        },
      });
      return;
    }

    if (shouldProceedToSecurityKey) {
      closeModal();
      shouldProceedToSecurityKey();
      return;
    }

    closeModal();
  };

  /*
   * Component Markup
   */

  const codeValid =
    codeError === null &&
    requestError === null &&
    code.length === twoStepVerificationMetadata.authenticatorCodeLength;

  return (
    <div className="enable-authenticator-modal">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal} disabled={requestInFlight}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{resources.Action.Dialog.Close}</span>
          </button>
        </div>
        <div className="modal-title">
          <h2>{resources.Heading.Dialog.AuthenticatorSetup}</h2>
        </div>
      </div>
      {setupToken !== "" ? (
        <React.Fragment>
          <Modal.Body>
            <div>
              <React.Fragment>
                {viewQrCode && (
                  <React.Fragment>
                    <div className="img-container modal-image-container">
                      <img className="modal-thumb" src={qrCodeImageUrl} alt="" />
                      <br />
                      <button
                        type="button"
                        className="text-link xsmall transparent-button"
                        onClick={toggleQrCode}
                        tabIndex={0}
                      >
                        {resources.Action.Dialog.AuthenticatorSetupViewManualEntryKey}
                      </button>
                    </div>
                    <br />
                    <div className="body-text text-description">
                      {resources.Description.Dialog.AuthenticatorSetupQRCode}
                    </div>
                    <br />
                  </React.Fragment>
                )}
                {!viewQrCode && (
                  <React.Fragment>
                    <div
                      role="button"
                      className="body-text section-content-off"
                      onClick={onManualKeyClick}
                      onKeyDown={handleManualKeyKeyDown}
                      tabIndex={0}
                    >
                      {manualEntryKey}
                    </div>
                    <button
                      type="button"
                      className="text-link xsmall toggle-qr-code transparent-button"
                      onClick={toggleQrCode}
                      tabIndex={0}
                    >
                      {resources.Action.Dialog.AuthenticatorSetupViewQRCode}
                    </button>
                    <br />
                    <div className="body-text text-description">
                      {resources.Description.Dialog.AuthenticatorSetupManualEntryKey}
                    </div>
                    <br />
                  </React.Fragment>
                )}
                <React.Fragment>
                  <InputControl
                    id="2sv-verify-enable-authenticator"
                    inputType="text"
                    disabled={requestInFlight}
                    value={code}
                    setValue={setCode}
                    error={requestError || codeError}
                    setError={setCodeError}
                    validate={validateTrue}
                    canSubmit={codeValid}
                    handleSubmit={enableVerifyCode}
                    onChange={clearRequestError}
                    // Optional parameters:
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={resources.Label.Dialog.AuthenticatorSetupCodeInputPlaceholder(
                      twoStepVerificationMetadata.authenticatorCodeLength,
                    )}
                    maxLength={twoStepVerificationMetadata.authenticatorCodeLength}
                    validCharactersRegEx={REGEX_CODE}
                    hideFeedback
                  />
                  <div className="xsmall text-link toggle-qr-code">
                    <a
                      href={twoStepVerificationMetadata.authenticatorHelpSiteAddress}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {resources.Action.Dialog.AuthenticatorHelpMessage}
                    </a>
                  </div>
                </React.Fragment>
              </React.Fragment>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {requestInFlight ? (
              <div className="spinner spinner-sm spinner-no-margin spinner-block" />
            ) : (
              <React.Fragment>
                <div className="modal-modern-footer-buttons center-buttons">
                  <button
                    type="submit"
                    className="btn-secondary-md"
                    onClick={enableVerifyCode}
                    disabled={!codeValid}
                  >
                    {resources.Action.Dialog.Verify}
                  </button>
                  <button type="button" className="btn-control-md" onClick={closeModal}>
                    {resources.Action.Dialog.Cancel}
                  </button>
                </div>
                <p className="xsmall">{resources.Description.SecurityWarningShort("", "")}</p>
              </React.Fragment>
            )}
          </Modal.Footer>
        </React.Fragment>
      ) : (
        <Modal.Body>
          <div className="spinner spinner-default modal-margin-bottom-large" />
        </Modal.Body>
      )}
    </div>
  );
};
export default ModalAuthenticatorEnable;

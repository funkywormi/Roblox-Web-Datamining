import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { MediaType } from "../../../challenge/twoStepVerification";
import { SecurityTabActionType } from "../../store/action";

const ModalTwoStepEnableWarning: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps, enabledMediaTypes, twoStepVerificationMetadata },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */
  const [checkboxState, setCheckboxState] = useState<boolean>(false);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.TWO_STEP_ENABLE_WARNING) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const checkboxClickHandler = () => {
    setCheckboxState(!checkboxState);
  };

  // If single method is enabled and the user is enabling a lower security level 2SV method,
  // authenticator will be deactivated. We want to explicitly warn them of this.
  const isAuthenticatorDeactivated = () => {
    return (
      enabledMediaTypes.includes(MediaType.Authenticator) &&
      twoStepVerificationMetadata.isSingleMethodEnforcementEnabled
    );
  };

  const userHasSecurityKeys = () => {
    return isAuthenticatorDeactivated() && enabledMediaTypes.includes(MediaType.SecurityKey);
  };

  const showAdditionalDisableAuthenticatorWarning = () => {
    return twoStepVerificationMetadata.receiveWarningsOnDisableTwoStep;
  };

  const getTitle = () => {
    if (!isAuthenticatorDeactivated()) {
      return resources.Heading.Dialog.OneOptionAtATime;
    }
    if (!showAdditionalDisableAuthenticatorWarning()) {
      return resources.Heading.Dialog.AreYouSure;
    }
    return resources.Response.Dialog.Warning;
  };

  const userAcknowledged = async () => {
    if (!userHasSecurityKeys()) {
      await modalStateAndProps.additionalModalProps.enableFunction(closeModal);
    } else {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.SECURITY_KEY_DELETED_WARNING,
        additionalModalProps: {
          title: getTitle(),
          pendingActionFunction: modalStateAndProps.additionalModalProps.enableFunction,
        },
      });
    }
  };

  const disableTurnOffButton = () => {
    return showAdditionalDisableAuthenticatorWarning() && !checkboxState;
  };

  /*
   * Component Markup
   */

  return (
    <div className="update-two-step">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          {!(isAuthenticatorDeactivated() && showAdditionalDisableAuthenticatorWarning()) && (
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">
                <span className="icon-close" />
              </span>
              <span className="sr-only">{resources.Action.Dialog.Close}</span>
            </button>
          )}
        </div>
        <div className="modal-title">
          <h2>
            <span>{getTitle()}</span>
          </h2>
        </div>
      </div>
      {!isAuthenticatorDeactivated() && (
        <Modal.Body>
          <div className="text-center">
            <div>{resources.Response.Dialog.EnableTwoStepVerificationSingleMethodWarning}</div>
          </div>
        </Modal.Body>
      )}
      {isAuthenticatorDeactivated() && !showAdditionalDisableAuthenticatorWarning() && (
        <Modal.Body>
          <div className="text-center">
            <div>{resources.Description.TurnOnLowerSecurity2SVMethod}</div>
          </div>
        </Modal.Body>
      )}
      {isAuthenticatorDeactivated() && showAdditionalDisableAuthenticatorWarning() && (
        <Modal.Body>
          <div className="text-center">
            <div>
              {resources.Response.Dialog.TwoStepDisableAdditionalWarningAuthenticatorGeneric}
            </div>
          </div>
        </Modal.Body>
      )}
      <Modal.Footer>
        {isAuthenticatorDeactivated() && showAdditionalDisableAuthenticatorWarning() && (
          <div className="modal-modern-footer-buttons center-buttons">
            <div className="user-acknowledge-checkbox">
              <input
                id="acknowledgement"
                className="larger"
                type="checkbox"
                onClick={checkboxClickHandler}
              />
              <label htmlFor="acknowledgement">
                {resources.Label.DisableAuthenticator.Acknowledge}
              </label>
            </div>
          </div>
        )}
        <div className="modal-modern-footer-buttons center-buttons">
          <button
            className="btn-primary-md"
            type="button"
            onClick={userAcknowledged}
            disabled={disableTurnOffButton()}
          >
            {resources.Label.Dialog.Confirm}
          </button>
          <button className="btn-secondary-md" type="button" onClick={closeModal}>
            {resources.Label.Cancel}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};
export default ModalTwoStepEnableWarning;

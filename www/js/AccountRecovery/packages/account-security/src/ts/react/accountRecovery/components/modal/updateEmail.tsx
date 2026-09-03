import React, { Fragment, useState } from "react";
import { Modal } from "react-style-guide";
import { FooterButtonConfig } from "../../../common/modalFooter";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import ModalState from "../../store/modalState";
import { mapAccountRecoveryErrorToResource } from "../../constants/resources";

const ModalUpdateEmail: React.FC = () => {
  const {
    state: { resources, requestService, recoverySessionId, modalStateAndProps },
  } = useAccountRecoveryContext();

  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  if (modalStateAndProps.modalState !== ModalState.UPDATE_EMAIL) {
    return <Fragment />;
  }

  const handleSetEmail = async () => {
    setRequestInFlight(true);
    const setEmailResult = await requestService.accountRecoveryApi.setEmail(recoverySessionId);
    if (setEmailResult.isError) {
      setRequestInFlight(false);
      setRequestError(mapAccountRecoveryErrorToResource(resources, setEmailResult.error));
      return;
    }
    modalStateAndProps.additionalModalProps.onPasswordResetSuccess();
  };

  const positiveButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Ok
    ),
    label: resources.Action.Ok,
    enabled: !requestInFlight,
    action: handleSetEmail,
  };

  return (
    <React.Fragment>
      <Modal.Header useBaseBootstrapComponent>
        <div />
        <span className="text-heading-small text-align-x-center padding-large">
          {resources.Heading.UpdateEmail}
        </span>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center modal-margin-bottom">
          {resources.Description.UpdateEmailConfirmation(
            modalStateAndProps.additionalModalProps.updatedEmail,
          )}
        </p>
        <p className="text-error xsmall">{requestError}</p>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-buttons">
          <button
            type="button"
            className="btn-growth-md modal-modern-footer-button update-email-button"
            aria-label={positiveButton.label}
            disabled={!positiveButton.enabled}
            onClick={positiveButton.action}
          >
            {positiveButton.content}
          </button>
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
};

export default ModalUpdateEmail;

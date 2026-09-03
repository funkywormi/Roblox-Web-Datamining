import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import InputControl, { validateTrue } from "../../../common/inputControl";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { FooterButtonConfig, FragmentModalFooter } from "../../../common/modalFooter";
import { SecurityTabActionType } from "../../store/action";
import { MediaType } from "../../../challenge/twoStepVerification";

const ModalSecurityKeyName: React.FC<ModalFragmentProps> = ({ closeModal }: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  /**
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_NAME) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);

  const submit = async () => {
    setRequestInFlight(true);

    const enableVerifySecurityKeyResult =
      await requestService.twoStepVerification.enableVerifySecurityKey(
        authenticatedUser.id!.toString(),
        modalStateAndProps.additionalModalProps.sessionId,
        name,
        modalStateAndProps.additionalModalProps.credential,
      );
    if (enableVerifySecurityKeyResult.isError) {
      setRequestInFlight(false);
      setRequestError(
        mapTwoStepVerificationErrorToResource(resources, enableVerifySecurityKeyResult.error),
      );
      return;
    }

    dispatch({
      type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
      mediaType: MediaType.SecurityKey,
    });

    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_SUCCESS,
      additionalModalProps: {
        registerSecurityKeyFunction:
          modalStateAndProps.additionalModalProps.registerSecurityKeyFunction,
      },
    });
  };

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className="spinner spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Dialog.Success
    ),
    label: resources.Action.Dialog.Success,
    enabled: !requestInFlight && name.length > 0,
    action: submit,
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{resources.Action.Dialog.Close}</span>
          </button>
        </div>
        <div className="modal-title">
          <h2>
            <span>{resources.Heading.NameSecurityKey}</span>
          </h2>
        </div>
      </div>
      <Modal.Body>
        <div className="result-security-key-modal modal-margin-bottom">
          <div>{resources.Description.SecurityKey.NameKey}</div>
        </div>
        <InputControl
          id="securityKeyName"
          inputType="text"
          disabled={requestInFlight}
          value={name}
          setValue={setName}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          canSubmit={name.length > 0}
          handleSubmit={submit}
          onChange={clearRequestError}
          // Optional parameters:
          autoComplete="off"
          placeholder={resources.Label.SecurityKey.Name}
          maxLength={40}
          hideFeedback
        />
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};
export default ModalSecurityKeyName;

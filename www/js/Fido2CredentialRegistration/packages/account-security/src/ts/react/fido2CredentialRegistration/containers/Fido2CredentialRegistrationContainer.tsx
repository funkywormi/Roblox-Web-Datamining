import React, { useState, useEffect } from "react";
import { Modal } from "react-style-guide";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import { CredentialPurpose, ModalFragmentProps } from "../constants/types";
import ModalState from "../store/modalState";
import ModalFido2CredentialEnable from "../modals/fido2CredentialEnable";
import ModalFido2CredentialName from "../modals/fido2CredentialName";
import ModalFido2CredentialConfirmTrust from "../modals/fido2CredentialConfirmTrust";
import ModalFido2CredentialDelete from "../modals/fido2CredentialDelete";
import ModalFido2CredentialManage from "../modals/fido2CredentialManage";
import ModalFido2CredentialError from "../modals/fido2CredentialError";
import { Fido2CredentialRegistrationActionType } from "../store/action";

type ModalSchema = {
  innerFragment: React.FC<ModalFragmentProps>;
  canClickBackdropOrEscToClose: boolean;
};

const createModalSchema = (
  innerFragment: React.FC<ModalFragmentProps>,
  canClickBackdropOrEscToClose: boolean,
): ModalSchema => {
  return {
    innerFragment,
    canClickBackdropOrEscToClose,
  };
};

const getModalSchema = (modalState: ModalState): ModalSchema | null => {
  const modalStateToInnerFragment = new Map<ModalState, ModalSchema>([
    [ModalState.FIDO_CREDENTIAL_ENABLE, createModalSchema(ModalFido2CredentialEnable, false)],
    [ModalState.FIDO_CREDENTIAL_NAME, createModalSchema(ModalFido2CredentialName, false)],
    [
      ModalState.FIDO_CREDENTIAL_CONFIRM_TRUST,
      createModalSchema(ModalFido2CredentialConfirmTrust, true),
    ],
    [ModalState.FIDO_CREDENTIAL_ERROR, createModalSchema(ModalFido2CredentialError, true)],
    [ModalState.FIDO_CREDENTIAL_DELETE, createModalSchema(ModalFido2CredentialDelete, true)],
    [ModalState.FIDO_CREDENTIAL_MANAGE, createModalSchema(ModalFido2CredentialManage, true)],
  ]);
  const modalSchema = modalStateToInnerFragment.get(modalState);

  return modalSchema !== undefined ? modalSchema : null;
};

const Fido2CredentialRegistrationContainer = (): JSX.Element => {
  const {
    state: { modalStateAndProps, registeredKeys, credentialPurpose },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  /*
   * Component State
   */

  const [isModalVisible, setIsModalVisible] = useState(true);

  /*
   * Event Handlers
   */

  const closeModal = () => setIsModalVisible(false);

  /**
   * While it is typical to trigger a modal close `onHide` (a property of every
   * modal), we do not set the modal state to `NONE` in a handler attached to
   * that event, since doing so would remove the modal element from the DOM
   * immediately and prevent a close animation from running.
   *
   * To allow the animation to run before setting a `NONE` state, we attach
   * this function to the modal's `onExited` event.
   */
  const setModalStateNone = () => {
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.NONE,
      additionalModalProps: null,
    });
    // Reset the modal visible state (although the component itself will not be
    // rendered at this point).
    setIsModalVisible(true);
  };

  // Mounts the initial flow depending on registration purpose and existing keys.
  useEffect(() => {
    if (registeredKeys.length > 0) {
      dispatch({
        type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
        modalState: ModalState.FIDO_CREDENTIAL_MANAGE,
        additionalModalProps: null,
      });
    } else {
      // eslint-disable-next-line default-case
      switch (credentialPurpose) {
        case CredentialPurpose.Login:
          dispatch({
            type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
            modalState: ModalState.FIDO_CREDENTIAL_CONFIRM_TRUST,
            additionalModalProps: null,
          });
          break;
        case CredentialPurpose.TwoStepVerification:
          dispatch({
            type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
            modalState: ModalState.FIDO_CREDENTIAL_ENABLE,
            additionalModalProps: null,
          });
      }
    }
  }, []);

  /*
   * Component Markup
   */

  // We retrieve a schema to manually render an outer modal element instead of
  // delegating the modal render to the specific modal page component. This is
  // to prevent unwanted animations on modal updates due to modal components
  // being added and removed from the DOM.
  const modalSchema = getModalSchema(modalStateAndProps.modalState);

  // This is an unfortunate edge case but we need to mount the spinner from the container to avoid modal parts showing.
  const showSpinner =
    (modalStateAndProps.modalState === ModalState.FIDO_CREDENTIAL_ENABLE ||
      modalStateAndProps.modalState === ModalState.FIDO_CREDENTIAL_NAME) &&
    credentialPurpose === CredentialPurpose.Login;

  return (
    <React.Fragment>
      {modalSchema && (
        <Modal
          className="modal-modern"
          show={isModalVisible}
          onHide={closeModal}
          onExited={setModalStateNone}
          backdrop={modalSchema.canClickBackdropOrEscToClose ? undefined : "static"}
          // The keyboard parameter prevents the modal from closing when the escape key is pressed
          keyboard={modalSchema.canClickBackdropOrEscToClose}
        >
          <modalSchema.innerFragment closeModal={closeModal} />
        </Modal>
      )}
      {showSpinner && (
        <div className="centered-spinner">
          <div className="spinner-donut" />
        </div>
      )}
    </React.Fragment>
  );
};

export default Fido2CredentialRegistrationContainer;

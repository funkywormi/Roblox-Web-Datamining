import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { MAX_KEY_COUNT } from "../../app.config";
import { SecurityTabActionType } from "../../store/action";

const ModalSecurityKeyManage: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */

  const [haveKeysToDelete, setHaveKeysToDelete] = useState<boolean>(false);
  const [keysCheckedState, setKeysCheckedState] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_MANAGE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const checkboxClickHandler = (credentialID: string) => {
    setKeysCheckedState(
      keysCheckedState.set(credentialID, !(keysCheckedState.get(credentialID) || false)),
    );
    const oneOrMoreKeysChecked = modalStateAndProps.additionalModalProps.registeredKeysList.reduce(
      (keysChecked, registeredKey) => {
        return keysChecked || keysCheckedState.get(registeredKey.credentialID) || false;
      },
      false,
    );
    setHaveKeysToDelete(oneOrMoreKeysChecked);
  };

  const deleteCheckedKeys = () => {
    const keysToDelete = modalStateAndProps.additionalModalProps.registeredKeysList.filter(
      registeredKey => keysCheckedState.get(registeredKey.credentialID) || false,
    );
    const keysToDeleteIDs = keysToDelete.map(keyToDelete => keyToDelete.credentialID);
    const keysToDeleteNames = keysToDelete.map(keyToDelete => keyToDelete.nickname);
    const deletedAllKeys =
      keysToDelete.length === modalStateAndProps.additionalModalProps.registeredKeysList.length;
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_DELETE,
      additionalModalProps: {
        keysToDeleteIDs,
        keysToDeleteNames,
        deletedAllKeys,
      },
    });
  };

  /*
   * Component Markup
   */

  const registeredKeysToDisplay = modalStateAndProps.additionalModalProps.registeredKeysList;
  const registeredKeysToDislayElements = registeredKeysToDisplay.map(registeredKey => (
    <React.Fragment key={registeredKey.credentialID}>
      <div className="security-key-checkbox-container">
        <h3 className="font-header-2">{registeredKey.nickname}</h3>
        <div className="security-key-checkbox">
          <input
            className="larger"
            type="checkbox"
            onClick={() => checkboxClickHandler(registeredKey.credentialID)}
          />
        </div>
      </div>
      <div className="rbx-divider" />
    </React.Fragment>
  ));

  return (
    <div className="result-security-key-modal">
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
            <span>{resources.Heading.ManageYourKeys}</span>
          </h2>
        </div>
      </div>
      <Modal.Body>
        {!(MAX_KEY_COUNT === modalStateAndProps.additionalModalProps.registeredKeysList.length) && (
          <div className="security-key-description-centered">
            {resources.Label.SecurityKey.RegisteredKey(
              modalStateAndProps.additionalModalProps.registeredKeysList.length,
              MAX_KEY_COUNT,
            )}
          </div>
        )}
        {MAX_KEY_COUNT === modalStateAndProps.additionalModalProps.registeredKeysList.length && (
          <div className="security-key-description-centered">
            {resources.Label.SecurityKey.RegisteredKeysAtCapacity(
              modalStateAndProps.additionalModalProps.registeredKeysList.length,
              MAX_KEY_COUNT,
            )}
          </div>
        )}
        {registeredKeysToDislayElements}
      </Modal.Body>
      <Modal.Footer>
        <div className="security-key-dual-button-container">
          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            disabled={
              modalStateAndProps.additionalModalProps.registeredKeysList.length === MAX_KEY_COUNT
            }
            onClick={modalStateAndProps.additionalModalProps.registerSecurityKeyFunction}
          >
            {resources.Action.AddSecurityKey}
          </button>
          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={deleteCheckedKeys}
            disabled={!haveKeysToDelete}
          >
            {resources.Action.DeleteSecurityKey}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};
export default ModalSecurityKeyManage;

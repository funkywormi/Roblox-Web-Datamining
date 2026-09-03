import { DeviceMeta } from "Roblox";
import { hybridResponseService } from "core-roblox-utilities";
import React, { useState, useEffect } from "react";
import { Modal } from "react-style-guide";
import { CredentialPurpose, ModalFragmentProps } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { MAX_KEY_COUNT } from "../app.config";
import { Fido2CredentialRegistrationActionType } from "../store/action";

const ModalFido2CredentialManage: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      translate,
      credentialPurpose,
      registeredKeys,
      modalStateAndProps,
      fido2Supported,
      deleteAllPasskeysAllowed,
    },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  const [localFido2Supported, setLocalFido2Supported] = useState(fido2Supported);

  useEffect(() => {
    const updateLocalFido2Supported = async () => {
      if (DeviceMeta && DeviceMeta().isInApp) {
        if (DeviceMeta().isIosApp || DeviceMeta().isAndroidApp) {
          const isAvailable = await hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
            {},
            10000,
          );
          setLocalFido2Supported(isAvailable === "true");
        } else {
          setLocalFido2Supported(false);
        }
      } else {
        try {
          setLocalFido2Supported(PublicKeyCredential !== undefined);
        } catch {
          setLocalFido2Supported(false);
        }
      }
    };

    // Set new value only if no initial value was passed in at the entry.
    if (localFido2Supported === undefined) {
      // eslint-disable-next-line no-void
      void updateLocalFido2Supported();
    }
  }, []);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_MANAGE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const handleDeleteKey = (name: string) => {
    // The endpoint (and therefore the delete modal) supports batch deletes, but for now we're okay with deleting only one key at a time.
    // This UI may change in the future.
    const keysToDeleteNames = [name];
    const deletedAllKeys = keysToDeleteNames.length === registeredKeys.length;
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.FIDO_CREDENTIAL_DELETE,
      additionalModalProps: {
        keysToDeleteNames,
        deletedAllKeys,
      },
    });
  };

  const onRegisterKey = () => {
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
  };
  /*
   * Component Markup
   */

  let headingTranslationString;
  let addButtonTranslationString;
  let keyIconClassName: string;
  // eslint-disable-next-line default-case
  switch (credentialPurpose) {
    case CredentialPurpose.Login:
      headingTranslationString = "Heading.ManageYourPasskeys";
      addButtonTranslationString = "Action.AddPasskey";
      keyIconClassName = "passkey-icon";
      break;
    case CredentialPurpose.TwoStepVerification:
      headingTranslationString = "Heading.ManageYourSecurityKeys";
      addButtonTranslationString = "Action.ManageAddSecurityKey";
      keyIconClassName = "fido-credential-usb-icon-lg";
  }

  const canDeleteKeys = deleteAllPasskeysAllowed || registeredKeys.length > 1;
  const registeredKeysToDislayElements = registeredKeys.map(registeredKey => (
    <React.Fragment key={registeredKey.nickname}>
      <div className="fido-credential-checkbox-container">
        <span className={keyIconClassName} />
        <div className="fido-credential-name">{registeredKey.nickname}</div>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        {canDeleteKeys && (
          <button
            className="fido-credential-delete-button"
            type="button"
            onClick={() => handleDeleteKey(registeredKey.nickname)}
          >
            <span className="icon-trash-bin" />
          </button>
        )}
      </div>
      <div className="rbx-divider" />
    </React.Fragment>
  ));

  const deviceNotCompatibleWarning = (
    <React.Fragment>
      <div className="passkey-incompatible-warning">
        <span className="icon-warning-orange passkey-incompatible-icon" />
        <span>{translate("Description.DeviceNotCompatible")}</span>
      </div>
    </React.Fragment>
  );

  const compatibilityCheckView = (
    <React.Fragment>
      <div className="passkey-compatibility-check">
        <div className="passkey-compatibility-spinner">
          <div className="spinner spinner-sm" />
        </div>
        <span className="passkey-compatibility-check-message">
          {translate("Description.CheckingPasskeyCompatibility")}
        </span>
      </div>
    </React.Fragment>
  );

  const maxPasskeysAddedWarning = (
    <React.Fragment>
      <div className="passkey-manage-warning">
        <span>
          {translate("Description.NumPasskeysAddedStatus", {
            registeredKeys: registeredKeys.length,
            maxKeys: MAX_KEY_COUNT,
          })}
        </span>
      </div>
    </React.Fragment>
  );

  const cannotDeleteLastKeyWarning = (
    <React.Fragment>
      <div className="passkey-manage-warning">
        <span>{translate("Description.LastPasskeyWarning")}</span>
      </div>
    </React.Fragment>
  );

  return (
    <div className="result-fido-credential-modal">
      <div className="modal-header fido-credential-modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{translate("Action.Dialog.Close")}</span>
          </button>
        </div>
        <div className="modal-title">
          <h4 className="fido-credential-header">
            <span>{translate(headingTranslationString)}</span>
          </h4>
        </div>
      </div>
      <Modal.Body>
        {credentialPurpose === CredentialPurpose.TwoStepVerification && (
          <div className="fido-credential-description">
            {translate("Label.SecurityKey.RegisteredKey", {
              registeredKeysCount: registeredKeys.length,
              totalKeysCount: MAX_KEY_COUNT,
            })}
          </div>
        )}
        {registeredKeysToDislayElements}
        {registeredKeys.length < MAX_KEY_COUNT && localFido2Supported && (
          <div
            role="button"
            onClick={onRegisterKey}
            onKeyDown={onRegisterKey}
            tabIndex={0}
            className="fido-credential-add-button"
          >
            <div className="fido-credential-icon-add">
              <span className="icon-plus" />
            </div>
            <p className="passkey-add-account-text">{translate(addButtonTranslationString)}</p>
          </div>
        )}
        {localFido2Supported === undefined && compatibilityCheckView}
        {localFido2Supported === false && deviceNotCompatibleWarning}
        {localFido2Supported && registeredKeys.length >= MAX_KEY_COUNT && maxPasskeysAddedWarning}
        {!canDeleteKeys && cannotDeleteLastKeyWarning}
      </Modal.Body>
    </div>
  );
};
export default ModalFido2CredentialManage;

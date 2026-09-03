import Roblox from "Roblox";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import App from "./App";
import { Fido2CredentialRegistrationParams } from "./interface";
import { CredentialPurpose } from "./constants/types";
import "../../../css/fido2CredentialRegistration/fido2CredentialRegistration.scss";

const renderFido2CredentialRegistration = ({
  containerId,
  onCreationSuccess,
  onDuplicateCreated,
  onDeleteSuccess,
  onLastKeyDeleted,
  onGenericError,
  onRenameSuccess,
  credentialPurpose,
  registeredKeys,
  fido2Supported,
  deleteAllPasskeysAllowed,
  registrationSource,
}: Fido2CredentialRegistrationParams): boolean => {
  const container = document.getElementById(containerId);
  if (container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);
    render(
      <App
        onCreationSuccess={onCreationSuccess}
        onDuplicateCreated={onDuplicateCreated}
        onDeleteSuccess={onDeleteSuccess}
        onLastKeyDeleted={onLastKeyDeleted}
        onGenericError={onGenericError}
        onRenameSuccess={onRenameSuccess}
        credentialPurpose={credentialPurpose}
        registeredKeys={registeredKeys}
        fido2Supported={fido2Supported}
        deleteAllPasskeysAllowed={deleteAllPasskeysAllowed}
        registrationSource={registrationSource}
      />,
      container,
    );
    return true;
  }
  return false;
};

const Fido2CredentialRegistrationService = {
  renderFido2CredentialRegistration,
  CredentialPurpose,
};

Object.assign(Roblox, {
  Fido2CredentialRegistrationService,
});

export default renderFido2CredentialRegistration;

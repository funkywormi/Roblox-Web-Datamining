import { ModalStateAndProps } from "../constants/types";
import { Fido2CredentialRegistrationState } from "./state";
import { Fido2CredentialRegistrationAction, Fido2CredentialRegistrationActionType } from "./action";

const fido2CredentialRegistrationStateReducer = (
  oldState: Fido2CredentialRegistrationState,
  action: Fido2CredentialRegistrationAction,
): Fido2CredentialRegistrationState => {
  const newState = { ...oldState };
  switch (action.type) {
    case Fido2CredentialRegistrationActionType.SET_MODAL_STATE:
      newState.modalStateAndProps = {
        modalState: action.modalState,
        additionalModalProps: action.additionalModalProps,
      } as ModalStateAndProps;
      return newState;

    default:
      return newState;
  }
};

export default fido2CredentialRegistrationStateReducer;

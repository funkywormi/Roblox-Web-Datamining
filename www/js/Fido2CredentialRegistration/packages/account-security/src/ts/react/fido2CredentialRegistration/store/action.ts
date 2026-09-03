import { ModalStateAndProps } from "../constants/types";

export enum Fido2CredentialRegistrationActionType {
  SET_MODAL_STATE,
}

export type Fido2CredentialRegistrationAction = {
  type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE;
} & ModalStateAndProps;

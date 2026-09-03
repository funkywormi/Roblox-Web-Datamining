import { Fido2Credential } from "../../../common/request/types/twoStepVerification";
import ModalState from "../store/modalState";

export type ModalFragmentProps = {
  closeModal: () => void;
};

export type ModalStateAndProps =
  | {
      modalState:
        | ModalState.NONE
        | ModalState.FIDO_CREDENTIAL_MANAGE
        | ModalState.FIDO_CREDENTIAL_ERROR
        | ModalState.FIDO_CREDENTIAL_ENABLE
        | ModalState.FIDO_CREDENTIAL_CONFIRM_TRUST;
      additionalModalProps: null;
    }
  | {
      modalState: ModalState.GENERIC_TEXT_ERROR;
      additionalModalProps: {
        title: string;
        body: string;
        button: string;
      };
    }
  | {
      modalState: ModalState.FIDO_CREDENTIAL_NAME;
      additionalModalProps: {
        sessionId: string;
        credential: string;
      };
    }
  | {
      modalState: ModalState.FIDO_CREDENTIAL_DELETE;
      additionalModalProps: {
        keysToDeleteNames: string[];
        deletedAllKeys: boolean;
      };
    };

export type AdditionalModalProps = ModalStateAndProps["additionalModalProps"];

export type PublicKeyCredentialNative = {
  id: string;
  type: string;
  rawId?: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
};

export type Fido2CreateCredentialOutput = {
  credential: string | null;
};

export enum CredentialPurpose {
  TwoStepVerification,
  Login,
}

import { Fido2Credential } from "../../../common/request/types/twoStepVerification";
import { MediaType } from "../../challenge/twoStepVerification";
import ModalState from "../store/modalState";

export type ModalFragmentProps = {
  closeModal: () => void;
};

export type ModalStateAndProps =
  | {
      modalState:
        | ModalState.NONE
        | ModalState.SECURITY_KEY_ERROR
        | ModalState.RECOVERY_CODES_GENERATE;
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
      modalState: ModalState.TWO_STEP_DISABLE;
      additionalModalProps: {
        mediaTypeToDisable: MediaType;
      };
    }
  | {
      modalState: ModalState.TWO_STEP_DISABLE_ALL;
      additionalModalProps: {
        enabledMethods: MediaType[];
      };
    }
  | {
      modalState: ModalState.TWO_STEP_ENABLE_WARNING;
      additionalModalProps: {
        enableFunction: (closeModal?: () => void) => Promise<void>;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_DELETED_WARNING;
      additionalModalProps: {
        title: string;
        pendingActionFunction: (
          closeModal?: () => void,
          setError?: (error: string | null) => void,
          setInFlight?: (inFlight: boolean) => void,
        ) => Promise<void>;
        onDeleteComplete?: () => Promise<void>;
        customMessage?: string;
      };
    }
  | {
      modalState: ModalState.TURN_ON_AUTHENTICATOR;
      additionalModalProps: {
        enableAuthenticatorFunction: (emailVerified: boolean) => void;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_ENABLE;
      additionalModalProps: {
        creationOptions: CredentialCreationOptions;
        sessionId: string;
        isInApp: boolean;
        registerSecurityKeyFunction: () => Promise<void>;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_NAME;
      additionalModalProps: {
        sessionId: string;
        credential: string;
        registerSecurityKeyFunction: () => Promise<void>;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_SUCCESS;
      additionalModalProps: {
        registerSecurityKeyFunction: () => Promise<void>;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_MANAGE;
      additionalModalProps: {
        registeredKeysList: Fido2Credential[];
        registerSecurityKeyFunction: () => Promise<void>;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_DELETE;
      additionalModalProps: {
        keysToDeleteIDs: string[];
        keysToDeleteNames: string[];
        deletedAllKeys: boolean;
      };
    }
  | {
      modalState: ModalState.SECURITY_KEY_DELETE_SUCCESS;
      additionalModalProps: {
        deletedKeys: string[];
      };
    }
  | {
      modalState: ModalState.RECOVERY_CODES_DISPLAY;
      additionalModalProps: {
        recoveryCodes: string[];
        onRecoveryCodesComplete?: () => void;
      };
    }
  | {
      modalState: ModalState.AUTHENTICATOR_ENABLE;
      additionalModalProps: {
        onAuthenticatorComplete?: () => void;
      };
    };

export type AdditionalModalProps = ModalStateAndProps["additionalModalProps"];

export const SecurityLevelMap: Record<MediaType, number> = {
  Passkey: 3,
  SecurityKey: 3,
  Authenticator: 3,
  Email: 2,
  CrossDevice: 2,
  QuickSignIn: 2,
  Password: 1,
  SMS: 0,
  RecoveryCode: 0,
  None: 0,
};

export enum ConsoleType {
  XBOX,
  PLAYSTATION,
}

export type PublicKeyCredentialNative = {
  id: string;
  type: string;
  rawId?: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
};

export type SecurityKeyCreateCredentialOutput = {
  credential: string | null;
};

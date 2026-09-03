import { RecoveryState } from "../../../common/request/types/accountRecovery";
import { PhonePrefix } from "../../../common/request/types/phone";
import { ComponentStateAndProps, ModalStateAndProps } from "../constants/types";

export enum AccountRecoveryActionType {
  SET_RECOVERY_SESSION_ID,
  SET_PHONE_PREFIX_LIST,
  SET_COMPONENT_STATE,
  SET_USER_ID_TO_RECOVER,
  SET_USER_NAMES,
  SET_MODAL_STATE,
  SET_CONTINUING_RECOVERY,
  SET_RECOVER_PASSWORD_AND_2SV,
}

export type AccountRecoveryAction =
  | {
      type: AccountRecoveryActionType.SET_RECOVERY_SESSION_ID;
      recoverySessionId: string;
    }
  | {
      type: AccountRecoveryActionType.SET_PHONE_PREFIX_LIST;
      phonePrefixList: PhonePrefix[];
    }
  | ({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE;
      recoverySessionState: RecoveryState;
    } & ComponentStateAndProps)
  | {
      type: AccountRecoveryActionType.SET_USER_ID_TO_RECOVER;
      userIdToRecover: number;
    }
  | {
      type: AccountRecoveryActionType.SET_USER_NAMES;
      username: string;
      combinedName: string;
    }
  | ({
      type: AccountRecoveryActionType.SET_MODAL_STATE;
    } & ModalStateAndProps)
  | {
      type: AccountRecoveryActionType.SET_CONTINUING_RECOVERY;
      continuingRecovery: boolean;
    }
  | {
      type: AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV;
      recoverPassword: boolean;
      recover2sv: boolean;
    };

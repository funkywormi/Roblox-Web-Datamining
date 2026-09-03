import { RecoveryState } from "../../../common/request/types/accountRecovery";
import { LOG_PREFIX } from "../app.config";
import { ComponentStateAndProps, ModalStateAndProps } from "../constants/types";
import { AccountRecoveryAction, AccountRecoveryActionType } from "./action";
import ComponentState, { validComponentStatesForRecoverySessionState } from "./componentState";
import { AccountRecoveryState } from "./state";

function isComponentStateValid(
  recoveryState: RecoveryState,
  componentState: ComponentState,
): boolean {
  return (
    validComponentStatesForRecoverySessionState[recoveryState]?.includes(componentState) ?? false
  );
}

const accountRecoveryStateReducer = (
  oldState: AccountRecoveryState,
  action: AccountRecoveryAction,
): AccountRecoveryState => {
  const newState = { ...oldState };
  switch (action.type) {
    case AccountRecoveryActionType.SET_RECOVERY_SESSION_ID:
      newState.recoverySessionId = action.recoverySessionId;
      return newState;

    case AccountRecoveryActionType.SET_PHONE_PREFIX_LIST:
      newState.phonePrefixList = action.phonePrefixList;
      return newState;

    case AccountRecoveryActionType.SET_COMPONENT_STATE:
      if (!isComponentStateValid(action.recoverySessionState, action.componentState)) {
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, "invalid component for recovery state");
        return newState;
      }
      newState.recoverySessionState = action.recoverySessionState;
      newState.componentStateAndProps = {
        componentState: action.componentState,
        additionalComponentProps: action.additionalComponentProps,
      } as ComponentStateAndProps;
      return newState;

    case AccountRecoveryActionType.SET_USER_ID_TO_RECOVER:
      newState.userIdToRecover = action.userIdToRecover;
      return newState;

    case AccountRecoveryActionType.SET_USER_NAMES:
      newState.username = action.username;
      newState.combinedName = action.combinedName;
      return newState;

    case AccountRecoveryActionType.SET_MODAL_STATE:
      newState.modalStateAndProps = {
        modalState: action.modalState,
        additionalModalProps: action.additionalModalProps,
      } as ModalStateAndProps;
      return newState;

    case AccountRecoveryActionType.SET_CONTINUING_RECOVERY:
      newState.continuingRecovery = action.continuingRecovery;
      return newState;

    case AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV:
      newState.recoverPassword = action.recoverPassword;
      newState.recover2sv = action.recover2sv;
      return newState;

    default:
      return newState;
  }
};

export default accountRecoveryStateReducer;

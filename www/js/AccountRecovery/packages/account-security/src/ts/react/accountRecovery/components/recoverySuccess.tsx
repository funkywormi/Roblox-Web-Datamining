import React from "react";
import { Button } from "@rbx/foundation-ui";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import ComponentState from "../store/componentState";
import ModalState from "../store/modalState";
import { AccountRecoveryActionType } from "../store/action";

const RecoverySuccess: React.FC = () => {
  const {
    state: { resources, componentStateAndProps, eventService },
    dispatch,
  } = useAccountRecoveryContext();

  const handleContinue = () => {
    if (componentStateAndProps.componentState !== ComponentState.RECOVERY_SUCCESS) return;

    const {
      shouldUpdateEmail,
      updatedEmail,
      shouldPrompt2svRemoval,
      shouldPromptPasskeyAddition,
      shouldPromptCredentialInvalidation,
      flowType,
      onPasswordResetSuccess,
    } = componentStateAndProps.additionalComponentProps;

    eventService.sendRecoverySuccessContinueClicked(flowType);

    if (shouldPromptCredentialInvalidation) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.INVALIDATE_CREDENTIALS,
        additionalModalProps: {
          shouldPromptPasskeyAddition,
          shouldPrompt2svRemoval,
          shouldUpdateEmail,
          updatedEmail,
          onPasswordResetSuccess,
        },
      });
      return;
    }

    if (shouldPromptPasskeyAddition) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.ADD_NEW_PASSKEY,
        additionalModalProps: {
          shouldUpdateEmail,
          updatedEmail,
          onPasswordResetSuccess,
        },
      });
      return;
    }

    if (shouldPrompt2svRemoval) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD,
        additionalModalProps: {
          shouldUpdateEmail,
          updatedEmail,
          onPasswordResetSuccess,
        },
      });
      return;
    }

    if (shouldUpdateEmail) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.UPDATE_EMAIL,
        additionalModalProps: {
          updatedEmail,
          onPasswordResetSuccess,
        },
      });
      return;
    }

    onPasswordResetSuccess();
  };

  return (
    <React.Fragment>
      <h1 className="text-heading-large text-center padding-bottom-medium">
        {resources.Heading.RecoverySuccess}
      </h1>
      <div className="flex flex-col padding-medium">
        <p className="text-center text-body-large padding-bottom-xxlarge">
          {resources.Description.AccountSuccessfullyRecovered}
        </p>
        <Button variant="Emphasis" size="Large" className="fill" onClick={handleContinue}>
          {resources.Action.Continue}
        </Button>
      </div>
    </React.Fragment>
  );
};

export default RecoverySuccess;

import React, { useState } from "react";
import { DialogBody, ProgressCircle } from "@rbx/foundation-ui";
import { PromptType } from "../../../../../common/request/types/promptAssignments";
import {
  ChallengeDialogFooter,
  FooterButtonConfig,
} from "../../../../common/challengeDialogFooter";
import { ChallengeDialogHeader, HeaderButtonType } from "../../../../common/challengeDialogHeader";
import { ModalFragmentProps } from "../../../constants/types";
import useAccountSecurityPromptContext from "../../../hooks/useAccountSecurityPromptContext";
import { AccountSecurityPromptActionType } from "../../../store/action";
import ModalState from "../../../store/modalState";
import { getDaysRemainingToForceReset } from "../../commonHelpers";

/**
 * The start of the change password modal flow.
 */
const ModalChangePasswordIntro: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { promptAssignment, resources, requestService },
    dispatch,
  } = useAccountSecurityPromptContext();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const continueToChangePassword = () => {
    setRequestError(null);
    setRequestInFlight(true);
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.CHANGE_PASSWORD_FORM,
    });
  };

  /*
   * Render Properties
   */

  let bodyText: React.ReactNode = "An unexpected issue occurred while displaying this text.";
  if (!promptAssignment.isGeneric) {
    bodyText =
      promptAssignment.promptType !== PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL ? (
        `${resources.Description.UnusualActivity} ${resources.Description.ChangeYourPassword}`
      ) : (
        // PromptType.CHANGE_PASSWORD__BREACHED_CREDENTIAL
        <React.Fragment>
          {resources.Description.ChangeYourPasswordImmediately}{" "}
          {resources.Description.NoChangeForceReset(
            getDaysRemainingToForceReset(promptAssignment.metadata.forceResetTimestamp),
          )}
        </React.Fragment>
      );
  }

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <ProgressCircle
        variant="Indeterminate"
        size="Small"
        ariaLabel={resources.Action.ContinueChangePassword}
      />
    ) : (
      resources.Action.ContinueChangePassword
    ),
    label: resources.Action.ContinueChangePassword,
    enabled: !requestInFlight,
    action: continueToChangePassword,
  };

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <ChallengeDialogHeader
        headerText={resources.Header.ChangeYourPassword}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <DialogBody>
        <div className="modal-lock-icon" />
        <p className="modal-margin-bottom">{bodyText}</p>
        <p className="text-caption-small content-system-alert xsmall">{requestError}</p>
      </DialogBody>
      <ChallengeDialogFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default ModalChangePasswordIntro;

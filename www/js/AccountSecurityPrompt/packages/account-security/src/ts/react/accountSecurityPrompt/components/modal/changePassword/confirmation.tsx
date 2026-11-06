import React from "react";
import { DialogBody } from "@rbx/foundation-ui";
import { ChallengeDialogHeader, HeaderButtonType } from "../../../../common/challengeDialogHeader";
import { ModalFragmentProps } from "../../../constants/types";
import useAccountSecurityPromptContext from "../../../hooks/useAccountSecurityPromptContext";

/**
 * The confirmation page of the change password modal flow.
 */
const ModalChangePasswordConfirmation: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources },
  } = useAccountSecurityPromptContext();

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <ChallengeDialogHeader
        headerText={resources.Header.Success}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled
        headerInfo={null}
      />
      <DialogBody>
        <div className="modal-lock-icon" />
        <p className="modal-margin-bottom-large">
          {resources.Description.ChangeYourPasswordSuccess}
        </p>
      </DialogBody>
    </React.Fragment>
  );
};

export default ModalChangePasswordConfirmation;

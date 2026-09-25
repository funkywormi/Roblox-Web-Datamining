import React, { useEffect } from "react";
import { createModal } from "@rbx/core-ui/legacy/react-style-guide";

import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { idVerificationTranslationConfig } from "../translation.config";
import { signupFormStrings } from "../constants/signupConstants";
import { identityVerificationResultTokenErrorHandler } from "../utils/identityVerificationUtils";

const IdVerificationErrorModal = ({
  hasIdVerificationError,
  translate,
}: {
  hasIdVerificationError: boolean;
  translate: WithTranslationsProps["translate"];
}): JSX.Element => {
  const [Modal, modalService] = createModal();

  useEffect(() => {
    modalService.open();
  }, [hasIdVerificationError]);

  return (
    <Modal
      title={translate(signupFormStrings.IdVerificationErrorTitle)}
      body={<p>{translate(signupFormStrings.IdVerificationErrorBody)}</p>}
      neutralButtonText={translate(signupFormStrings.TryAgain)}
      onNeutral={identityVerificationResultTokenErrorHandler}
      size="sm"
    />
  );
};

export default IdVerificationErrorModal;

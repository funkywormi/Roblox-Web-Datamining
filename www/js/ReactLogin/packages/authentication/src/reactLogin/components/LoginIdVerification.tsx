import React, { useEffect } from "react";
import { createModal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { idVerificationTranslationConfig } from "../translation.config";
import {
  storeIdentityVerificationLoginTicket,
  startIdentityVerification,
} from "../services/identityVerificationService";

export const LoginIdVerification = ({
  identityVerificationLoginTicket,
  translate,
}: {
  identityVerificationLoginTicket: string;
  translate: WithTranslationsProps["translate"];
}): JSX.Element => {
  const [Modal, modalService] = createModal();

  useEffect(() => {
    storeIdentityVerificationLoginTicket(identityVerificationLoginTicket);
    if (identityVerificationLoginTicket) {
      modalService.open();
    }
  }, [identityVerificationLoginTicket]);

  return (
    <Modal
      title={translate("Title.VerificationRequired")}
      body={translate("Description.VerificationRequired")}
      neutralButtonText={translate("Action.StartVerification")}
      onNeutral={startIdentityVerification}
      closeable={false}
      size="sm"
    />
  );
};

export default LoginIdVerification;

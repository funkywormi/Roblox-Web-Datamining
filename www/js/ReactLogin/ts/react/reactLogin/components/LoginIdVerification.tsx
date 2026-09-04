import React, { useEffect } from 'react';
import { createModal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { idVerificationTranslationConfig } from '../translation.config';
import {
  storeIdentityVerificationLoginTicket,
  startIdentityVerification
} from '../services/identityVerificationService';

export const LoginIdVerification = ({
  identityVerificationLoginTicket,
  translate
}: {
  identityVerificationLoginTicket: string;
  translate: WithTranslationsProps['translate'];
}): JSX.Element => {
  const [Modal, modalService] = createModal();

  useEffect(() => {
    storeIdentityVerificationLoginTicket(identityVerificationLoginTicket);
    if (identityVerificationLoginTicket) {
      modalService.open();
    }
  }, [identityVerificationLoginTicket]);

  return (
    { identityVerificationLoginTicket } && (
      <Modal
        title={translate('Title.VerificationRequired')}
        body={translate('Description.VerificationRequired')}
        neutralButtonText={translate('Action.StartVerification')}
        onNeutral={startIdentityVerification}
        closeable={false}
      />
    )
  );
};

export default withTranslations(LoginIdVerification, idVerificationTranslationConfig);

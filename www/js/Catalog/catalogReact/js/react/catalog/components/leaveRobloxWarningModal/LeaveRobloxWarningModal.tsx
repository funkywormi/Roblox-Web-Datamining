import React from 'react';
import { SimpleModal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { leaveRobloxWarningModalTranslationConfig } from '../../translation.config';

type LeaveRobloxWarningModalProps = {
  showModal: boolean;
  onModalClosed: () => void;
  onModalContinue: () => void;
};

const LeaveRobloxWarningModal = ({
  showModal,
  onModalClosed,
  onModalContinue,
  translate
}: LeaveRobloxWarningModalProps & WithTranslationsProps): JSX.Element => {
  const modalBody = (
    <React.Fragment>
      <p className='modal-body'>
        {translate('Description.RedirectToPartnerWebsite', { linebreak: '\n\n' })}
      </p>
    </React.Fragment>
  );

  return (
    <SimpleModal
      title={translate('Heading.LeavingRoblox')}
      body={modalBody}
      show={showModal}
      actionButtonShow
      actionButtonText={translate('Action.ContinueToPayment')}
      neutralButtonText={translate('Action.Cancel')}
      onAction={onModalContinue}
      onNeutral={onModalClosed}
      onClose={onModalClosed}
    />
  );
};

export default withTranslations(LeaveRobloxWarningModal, leaveRobloxWarningModalTranslationConfig);

import React from 'react';
import { Button, Modal } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { EnvironmentUrls } from 'Roblox';
import { useVerificationModal } from '../context/VerificationModalContext';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import { VerificationLevel } from '../constants/verificationConstants';
import '../../../../css/groupProfileHeader/_verificationModal.scss';

const VerificationModal: React.FC = () => {
  const { translate } = useTranslation();
  const { modalState, closeVerificationModal } = useVerificationModal();
  const { isGroupVerificationRequiredToJoin } = useGroupProfileHeaderContext();
  const { isOpen, verificationLevel } = modalState;

  const sharedTitle = translate('Heading.VerificationRequired');

  const getModalContentByLevel = () => {
    switch (verificationLevel) {
      case VerificationLevel.LOW:
        return translate('Modal.ContentTextLow');
      case VerificationLevel.MEDIUM:
        return translate('Modal.ContentTextMedium');
      case VerificationLevel.HIGH:
        return translate('Modal.ContentTextHigh');
      default:
        return '';
    }
  };

  const handleVerifyAccount = () => {
    window.open(`${EnvironmentUrls.websiteUrl}/my/account#!/info`, '_blank');
  };

  if (!isGroupVerificationRequiredToJoin || !verificationLevel) return null;

  const bodyContent = getModalContentByLevel();

  return (
    <Modal
      show={isOpen}
      onHide={closeVerificationModal}
      className='group-verification-modal'
      size='sm'
      aria-labelledby='group-verification-modal-title'
      scrollable='true'
      centered='true'>
      <Modal.Header useBaseBootstrapComponent>
        <button type='button' className='close' onClick={closeVerificationModal}>
          <span className='icon-close' />
        </button>
        <Modal.Title id='group-verification-modal-title'>{sharedTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyContent}</Modal.Body>
      <Modal.Footer>
        <Button
          variant={Button.variants.primary}
          width='full'
          onClick={handleVerifyAccount}
          className='modal-button'>
          {translate('Action.VerifyMyAccount')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VerificationModal;

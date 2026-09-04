import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-style-guide';
import {
  getExperimentEnrollments,
  getMetadata
} from '../services/crossDeviceLoginDisplayCodeService';
import CrossDeviceLoginCodeModalBody from './CrossDeviceLoginCodeModalBody';
import CrossDeviceLoginStatusModalBody from './CrossDeviceLoginStatusModalBody';

function CrossDeviceLoginDisplayCodeModal({
  show,
  onHide,
  code,
  qrUrl,
  accountName,
  accountPictureUrl,
  translate
}) {
  const [altTitle, setAltTitle] = useState('');
  const [altInstruction, setAltInstruction] = useState('');
  const [altDeviceSpecificInstruction, setAltDeviceSpecificInstruction] = useState('');
  async function SetExperimentState() {
    const metadata = await getMetadata();
    if (
      metadata?.data?.ShouldEnableCrossDeviceLoginInitiatorExperiments &&
      /^en\b/.test(navigator.language)
    ) {
      const enrollments = await getExperimentEnrollments();
      setAltTitle(enrollments?.alt_title);
      setAltInstruction(enrollments?.alt_instruction);
      setAltDeviceSpecificInstruction(enrollments?.alt_device_specific_instruction);
    }
  }

  useEffect(() => SetExperimentState(), []);

  return (
    <Modal
      show={show}
      onHide={onHide}
      className='cross-device-login-display-code-modal'
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered='true'>
      <Modal.Header useBaseBootstrapComponent>
        <div className='cross-device-login-display-code-modal-title-container'>
          <button
            type='button'
            className='cross-device-login-display-code-modal-title-button'
            onClick={onHide}>
            <span className='close icon-close' />
          </button>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.LoginCode')}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        {accountName ? (
          <CrossDeviceLoginStatusModalBody
            accountName={accountName}
            accountPictureUrl={accountPictureUrl}
            translate={translate}
          />
        ) : (
          <CrossDeviceLoginCodeModalBody
            code={code}
            qrUrl={qrUrl}
            translate={translate}
            altTitle={altTitle}
            altInstruction={altInstruction}
            altDeviceSpecificInstruction={altDeviceSpecificInstruction}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

CrossDeviceLoginDisplayCodeModal.propTypes = {
  translate: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  code: PropTypes.string.isRequired,
  qrUrl: PropTypes.string.isRequired,
  accountName: PropTypes.string.isRequired,
  accountPictureUrl: PropTypes.string.isRequired
};

export default CrossDeviceLoginDisplayCodeModal;

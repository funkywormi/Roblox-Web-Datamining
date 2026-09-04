import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-style-guide';

function AccountRecoveryModal({ show, onHide, translate, onPrimaryAction }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      className='account-recovery-modal'
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      scrollable='true'
      centered='true'
      backdrop='static'>
      <Modal.Header useBaseBootstrapComponent>
        <div className='account-recovery-modal-title-container'>
          <Modal.Title id='contained-modal-title-vcenter'>
            {translate('Heading.AccountRecoveryPrompt.Title')}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className='account-recovery-modal-body-container'>
          <div className='text-lead account-recovery-modal-body-text'>
            {translate('Description.AccountRecoveryPrompt.Body')}
          </div>
          <div className='account-recovery-yes-button-container'>
            <button
              type='button'
              className='btn-primary-lg btn-full-width account-recovery-yes-button'
              onClick={onPrimaryAction}>
              {translate('Action.Yes')}
            </button>
          </div>
          <div className='account-recovery-no-button-container'>
            <button
              type='button'
              className='btn-secondary-lg btn-full-width account-recovery-no-button'
              onClick={onHide}>
              {translate('Action.No')}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

AccountRecoveryModal.propTypes = {
  translate: PropTypes.func.isRequired,
  onPrimaryAction: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};

export default AccountRecoveryModal;

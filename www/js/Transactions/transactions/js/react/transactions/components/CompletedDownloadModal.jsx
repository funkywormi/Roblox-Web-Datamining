import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-style-guide';

function CompletedDownloadModal({ translate, show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} className='transactions-modal'>
      <Modal.Header title={translate('Message.CompletingRequest')} onClose={onClose} />
      <Modal.Body>{translate('Description.DownloadPopup')}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} className='cancel-btn' variant={Button.variants.secondary}>
          {translate('Action.BackToTransactions')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

CompletedDownloadModal.propTypes = {
  translate: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CompletedDownloadModal;

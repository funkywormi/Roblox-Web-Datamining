import React from 'react';
import PropTypes from 'prop-types';
import { Button, Link, Modal } from 'react-style-guide';

function VerificationModal({ translate, show, onClose }) {
  return (
    <Modal show={show} onHide={onClose} className='transactions-modal'>
      <Modal.Header title={translate('Heading.2SVRequired')} onClose={onClose} />
      <Modal.Body>{translate('Description.2SVRequired')}</Modal.Body>
      <Modal.Footer>
        <Link url='/my/account#!/security' className='btn-primary-md'>
          {translate('Action.Enable') || 'Enable'}
        </Link>
        <Button onClick={onClose} className='cancel-btn' variant={Button.variants.secondary}>
          {translate('Action.Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

VerificationModal.propTypes = {
  translate: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default VerificationModal;

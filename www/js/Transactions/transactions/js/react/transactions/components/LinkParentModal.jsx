import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-style-guide';
import { getParentalControlsUrl } from '../utils/urlHelper';

function LinkParentModal({ translate, show, onClose }) {
  const parentalControlsUrl = getParentalControlsUrl();
  return (
    <Modal show={show} onHide={onClose} className='transactions-modal'>
      <Modal.Header title={translate('Heading.AddParent')} onClose={onClose} />
      <Modal.Body>
        <p
          dangerouslySetInnerHTML={{
            __html: translate('Description.AddParent', {
              linkStart: `<a class="text-link" target="_blank" href="${parentalControlsUrl}">`,
              linkEnd: `</a>`
            })
          }}
        />
      </Modal.Body>
    </Modal>
  );
}

LinkParentModal.propTypes = {
  translate: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default LinkParentModal;

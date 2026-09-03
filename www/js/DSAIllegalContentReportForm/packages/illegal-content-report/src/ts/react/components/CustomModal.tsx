import React, { Fragment, ReactElement, useCallback, useEffect } from 'react';
import './CustomModal.scss';

type Props = {
  /* A boolean indicating whether the modal is open or not */
  open: boolean;

  /* A function to be called when user presses the escape key or clicks on a close button */
  onClose: () => void;

  /* A optional string that represents title of modal. If not provided, a default title will be used */
  title?: string;

  /* The optional content of the modal. It can be a simple string or a React Node */
  content?: string | React.ReactNode;

  /* Children elements to be rendered inside the modal, such as buttons or custom footers */
  children?: ReactElement;
};
const CustomModal = ({ open, onClose, title, content, children }: Props): ReactElement => {
  useEffect(() => {
    const escFunction = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', escFunction, false);
    }

    return () => {
      document.removeEventListener('keydown', escFunction, false);
    };
  }, [open, onClose]);

  return (
    <Fragment>
      {open && (
        <div className='modal-overlay'>
          <div className='custom-modal'>
            <div className='modal-header'>
              <div className='modal-head-left'>
                <h2>{title}</h2>
              </div>
              <div className='modal-head-right'>
                <button
                  type='button'
                  onClick={onClose}
                  className='transparent-button'
                  aria-label='Close'>
                  <span className='close-icon' />
                </button>
              </div>
            </div>
            {content && <p className='modal-content'>{content}</p>}
            {children}
          </div>
        </div>
      )}
    </Fragment>
  );
};

CustomModal.defaultProps = {
  title: 'Default Modal Title',
  content: '',
  children: null
};

export default CustomModal;

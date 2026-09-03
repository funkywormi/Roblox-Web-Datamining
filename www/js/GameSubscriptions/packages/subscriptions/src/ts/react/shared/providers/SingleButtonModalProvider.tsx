/* eslint-disable react/jsx-no-literals */
import React, { useState } from 'react';
import { Modal, Button } from 'react-style-guide';
import SingleButtonModalContext from '../utils/SingleButtonModalContext';
import '../../../../css/shared/modal.scss';

const SingleButtonModalProvider: React.FC = ({ children }) => {
  const [heading, setHeading] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [showErrorIcon, setShowErrorIcon] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [buttonOnPressFn, setButtonOnPressFn] = useState<() => void>(() => ({}));

  const [secondaryButtonText, setSecondaryButtonText] = useState('');

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const updateModalContent = (
    newHeading: string,
    newBodyText: string,
    newButtonText: string,
    canShowErrorIcon: boolean,
    buttonOnPress: () => void,
    secondarylButtonText?: string
  ) => {
    setHeading(newHeading);
    setBodyText(newBodyText);
    setShowErrorIcon(canShowErrorIcon);
    setButtonText(newButtonText);
    setButtonOnPressFn(buttonOnPress);
    if (secondarylButtonText) {
      setSecondaryButtonText(secondarylButtonText);
    }
  };

  return (
    <SingleButtonModalContext.Provider
        value={{
          openModal,
          closeModal,
          updateModalContent
        }}>
        {children}
        <Modal show={showModal} hide={closeModal} size='md' className='error-modal'>
          <Modal.Header title={heading} showCloseButton onClose={closeModal} />
          <Modal.Body>
            {bodyText}
            {showErrorIcon && <div className='icon-warning' />}
          </Modal.Body>
          <Modal.Footer>
            <Button
              size={secondaryButtonText ? Button.sizes.medium : Button.sizes.large}
              width={secondaryButtonText ? undefined : Button.widths.full}
              onClick={buttonOnPressFn}>
              {buttonText}
            </Button>

            {secondaryButtonText && (
              <Button size={Button.sizes.medium} className='btn-control-md' onClick={closeModal}>
                {secondaryButtonText}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </SingleButtonModalContext.Provider>
  );
};

export default SingleButtonModalProvider;

import React, { useMemo, useState } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import ClassNames from 'classnames';

type TConfirmationModal = (props: {
  titleText: string;
  bodyComponent?: React.ReactNode;
  actionButtonText: string;
  onAction?: () => void;
  neutralButtonText?: string;
  onNeutral?: () => void;
  closeable?: boolean;
  disableActionButton?: boolean;
}) => [JSX.Element, IModalService];

const useConfirmationModal: TConfirmationModal = ({
  titleText,
  bodyComponent,
  actionButtonText,
  onAction,
  neutralButtonText,
  onNeutral,
  closeable = true,
  disableActionButton = false
}): [JSX.Element, IModalService] => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const btnClass = ClassNames({
    'info-modal-half-width-button': neutralButtonText,
    'info-modal-full-width-button': !neutralButtonText
  });
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
      }}
      backdrop={closeable ? true : 'static'}
      keyboard={closeable}
      className='confirmation-modal'
      size='sm'
      aria-labelledby='info-modal-title'
      scrollable
      centered
      closeable={closeable}>
      <Modal.Header useBaseBootstrapComponent>
        <div>
          <Modal.Title id='info-modal-title'>{titleText}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>{bodyComponent}</Modal.Body>
      <Modal.Footer>
        {neutralButtonText && (
          <Button
            className={btnClass}
            variant={Button.variants.secondary}
            size={Button.sizes.medium}
            onClick={() => {
              onNeutral?.();
              modalService.close();
            }}>
            {neutralButtonText}
          </Button>
        )}
        <Button
          className={btnClass}
          variant={Button.variants.primary}
          size={Button.sizes.medium}
          isDisabled={disableActionButton}
          onClick={() => {
            onAction?.();
            modalService.close();
          }}>
          {actionButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return [modal, modalService];
};

export default useConfirmationModal;

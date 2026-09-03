import React, { useMemo, useState } from 'react';
import { Button, IModalService, Modal } from 'react-style-guide';
import ClassNames from 'classnames';
import { TranslateFunction } from 'react-utilities';

type TModalSize = 'xs' | 'xsmall' | 'sm' | 'small' | 'md' | 'medium' | 'lg' | 'large';

type TCreateSettingsModal = (props: {
  translate: TranslateFunction;
  titleResourceId?: string;
  // Sometimes it's more convenient for callers to provide a pre-translated title. If both translatedTitle and
  // titleResourceId are provided, translatedTitle takes precedence.
  translatedTitle?: string;
  bodyResourceId?: string;
  // Sometimes it's more convenient for callers to provide a pre-translated body. If both translatedBody and
  // bodyResourceId are provided, translatedBody takes precedence.
  translatedBody?: React.ReactNode;
  actionButtonTextResourceId?: string;
  neutralButtonTextResourceId?: string;
  footerTextResourceId?: string;
  size?: TModalSize;
  footerHyperlink?: string;
  onAction?: () => void;
  disableActionButton?: boolean;
  disabledNeutralButton?: boolean;
  shouldCloseModalOnActionButton?: boolean;
  onHide?: () => void;
  onNeutral?: () => void;
}) => [JSX.Element, IModalService];

const useSettingsModal: TCreateSettingsModal = ({
  translate,
  titleResourceId,
  translatedTitle,
  bodyResourceId,
  translatedBody,
  actionButtonTextResourceId,
  neutralButtonTextResourceId,
  footerTextResourceId,
  size = 'lg',
  footerHyperlink,
  onAction,
  disableActionButton,
  disabledNeutralButton,
  shouldCloseModalOnActionButton = true,
  onHide = () => {
    // do nothing by default
  },
  onNeutral // use this to create a different effect than onHide callback.
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const buttonClassNames = ClassNames({
    'modal-half-width-button': neutralButtonTextResourceId,
    'modal-full-width-button': !neutralButtonTextResourceId
  });

  const modal = (
    <Modal
      show={modalOpen}
      onHide={() => {
        modalService.close();
        onHide();
      }}
      backdrop
      className='user-settings-modal'
      size={size}
      aria-labelledby='user-settings-modal-title'
      scrollable
      centered>
      <Modal.Header useBaseBootstrapComponent>
        <div className='user-settings-modal-title-container'>
          <Modal.Title id='user-settings-modal-title'>
            {translatedTitle || (titleResourceId && translate(titleResourceId))}
          </Modal.Title>
        </div>
        <button
          type='button'
          className='close close-button'
          onClick={() => {
            modalService.close();
            onHide();
          }}>
          <span className='icon-close' />
        </button>
      </Modal.Header>
      <Modal.Body>{translatedBody || (bodyResourceId && translate(bodyResourceId))}</Modal.Body>
      <Modal.Footer>
        {actionButtonTextResourceId && (
          <Button
            className={buttonClassNames}
            variant={Button.variants.primary}
            size={Button.sizes.medium}
            isDisabled={disableActionButton}
            onClick={() => {
              if (shouldCloseModalOnActionButton) {
                modalService.close();
              }
              onAction?.();
            }}>
            {translate(actionButtonTextResourceId)}
          </Button>
        )}
        {neutralButtonTextResourceId && (
          <Button
            className={buttonClassNames}
            variant={Button.variants.secondary}
            size={Button.sizes.medium}
            isDisabled={disabledNeutralButton}
            onClick={() => {
              modalService.close();
              onNeutral?.();
            }}>
            {translate(neutralButtonTextResourceId)}
          </Button>
        )}
      </Modal.Footer>
      {footerTextResourceId && footerHyperlink && (
        <div className='text-footer user-settings-modal-text-footer border-top'>
          <span>
            <div className='icon-moreinfo' />
            <a
              className='text-link user-settings-modal-text-footer-link'
              target='_blank'
              rel='noreferrer'
              href={footerHyperlink}>
              {translate(footerTextResourceId)}
            </a>
          </span>
        </div>
      )}
    </Modal>
  );

  return [modal, modalService];
};

export default useSettingsModal;

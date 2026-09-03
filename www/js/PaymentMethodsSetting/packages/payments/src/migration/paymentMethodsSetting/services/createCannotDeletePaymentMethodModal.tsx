/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { createModal, IModalService } from 'react-style-guide';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TCannotDeletePaymentMethodModalProps = {
  translate: TranslateFunction;
};

export function createCannotDeletePaymentMethodModal(): [
  ({ translate }: TCannotDeletePaymentMethodModalProps) => JSX.Element,
  IModalService
] {
  const [Modal, modalService] = createModal();

  function CannotDeletePaymentMethodModal({ translate }: TCannotDeletePaymentMethodModalProps) {
    const deletePaymentMethodHeader = translate(TRANSLATION_KEYS.CannotDeletePaymentMethodHeading);
    const body = (
      <div className='cannot-delete-payment-method-text'>
        {translate(TRANSLATION_KEYS.CannotDeletePaymentMethodDesc)}
      </div>
    );

    // TODO: Figure out how to prevent closing modal when clicking on backdrop
    return (
      <Modal
        id='cannot-delete-card-modal'
        title={deletePaymentMethodHeader}
        body={body}
        neutralButtonText={translate('Action.GotIt') || 'Got it'}
        onNeutral={() => {
          modalService.close();
        }}
        closeable
        size='md'
      />
    );
  }

  return [CannotDeletePaymentMethodModal, modalService];
}

export default createCannotDeletePaymentMethodModal;

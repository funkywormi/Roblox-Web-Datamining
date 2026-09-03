import React, { useState } from 'react';
import { fireEvent } from 'roblox-event-tracker';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { COUNTER_METRICS } from '../constants/constants';
import createRemovePaymentMethodModal from '../services/createRemovePaymentMethodModal';
import createCannotDeletePaymentMethodModal from '../services/createCannotDeletePaymentMethodModal';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TPayPalAccountProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  updatePaymentProfiles: () => void;
  paymentProfileId: string;
  email?: string;
};

export const PayPalAccount = ({
  translate,
  systemFeedbackService,
  updatePaymentProfiles,
  paymentProfileId,
  email
}: TPayPalAccountProps): JSX.Element | null => {
  const [accountDeleted, setAccountDeleted] = useState<boolean>(false);
  const [
    RemovePaymentMethodModal,
    removePaymentMethodModalService
  ] = createRemovePaymentMethodModal();
  const [
    CannotDeletePaymentMethodModal,
    cannotDeletePaymentMethodModalService
  ] = createCannotDeletePaymentMethodModal();

  const onDeleteSuccess = () => {
    updatePaymentProfiles();
    setAccountDeleted(true);
  };

  if (accountDeleted) return null;

  const emailLabel = translate(TRANSLATION_KEYS.EmailLabel) || 'Email';
  const emailDisplay = email ? `${emailLabel}: ${email}` : '';

  return (
    <div className='cardContainer'>
      <RemovePaymentMethodModal
        translate={translate}
        systemFeedbackService={systemFeedbackService}
        cannotDeletePaymentMethodModalService={cannotDeletePaymentMethodModalService}
        paymentProfileId={paymentProfileId}
        onDeleteSuccess={onDeleteSuccess}
      />
      <CannotDeletePaymentMethodModal translate={translate} />
      <span className='payment-method-image cardIcon paypal' />
      <div className='cardNumber font-bold'>{translate(TRANSLATION_KEYS.PayPalLabel)}</div>
      {email && <div className='paypalEmail'>{emailDisplay}</div>}
      <button type='button' className='btn-generic-edit-sm' style={{ visibility: 'hidden' }}>
        <span className='icon-edit' />
      </button>
      <button
        type='button'
        className='btn-generic-trash-bin-sm'
        onClick={() => {
          removePaymentMethodModalService.open();
          fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.DELETE_CARD_CLICKED);
        }}>
        <span className='icon-trash-bin' />
      </button>
    </div>
  );
};

export default PayPalAccount;

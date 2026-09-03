import React, { Fragment, useEffect, useState } from 'react';
import { fireEvent } from 'roblox-event-tracker';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { getShortenedDateFormat } from '../../core/utils/dateUtils';
import { COUNTER_METRICS, getPaymentMethodClassNameMapping } from '../constants/constants';
import createRemovePaymentMethodModal from '../services/createRemovePaymentMethodModal';
import createCannotDeletePaymentMethodModal from '../services/createCannotDeletePaymentMethodModal';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import useUpdateCardModal from '../hooks/useUpdateCardModal';

type TGeneralCardProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  updatePaymentProfiles: () => void;
  paymentProfileId: string;
  cardType: string; // Change to GeneralCard Type Enum
  lastFour: string;
  expMonth: number; // Will be formatted as MM/YY
  expYear: number; // Will be formatted as MM/YY
};

export const GeneralCard = ({
  translate,
  systemFeedbackService,
  updatePaymentProfiles,
  paymentProfileId,
  cardType,
  lastFour,
  expMonth, // Note: Stripe Months are 1-12; Date months are 0-11.
  expYear
}: TGeneralCardProps): JSX.Element | null => {
  const [cardDeleted, setCardDeleted] = useState<boolean>(false);
  const [
    RemovePaymentMethodModal,
    removePaymentMethodModalService
  ] = createRemovePaymentMethodModal();
  const [
    CannotDeletePaymentMethodModal,
    cannotDeletePaymentMethodModalService
  ] = createCannotDeletePaymentMethodModal();
  const [cardExpired, setCardExpired] = useState<boolean>(false);
  const [expirationMonth, setExpirationMonth] = useState(expMonth);
  const [expirationYear, setExpirationYear] = useState(expYear);

  const cardNum = `****${lastFour}`;
  const expiration = `${translate(TRANSLATION_KEYS.ExpLabel)} ${getShortenedDateFormat(
    expirationYear,
    expirationMonth
  )}`;

  useEffect(() => {
    setCardExpired(new Date(expirationYear, expirationMonth - 1) < new Date());
  }, [expirationMonth, expirationYear]);

  const onDeleteSuccess = () => {
    updatePaymentProfiles();
    setCardDeleted(true);
  };

  const onUpdateSuccess = (month: number, year: number) => {
    setExpirationMonth(month);
    setExpirationYear(year);
  };

  const [UpdatePaymentMethodModal, updatePaymentMethodModalService] = useUpdateCardModal();

  if (cardDeleted) return null;

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
      <UpdatePaymentMethodModal
        translate={translate}
        onUpdateSuccess={onUpdateSuccess}
        systemFeedbackService={systemFeedbackService}
        paymentProfileId={paymentProfileId}
        cardType={cardType}
        lastFour={lastFour}
        expMonth={expirationMonth}
        expYear={expirationYear}
      />
      <span
        className={`payment-method-image cardIcon ${getPaymentMethodClassNameMapping(cardType)}`}
      />
      <div className='cardNumber font-bold'>{cardNum}</div>
      <div className='cardExpiry'>{expiration}</div>
      <button
        type='button'
        className='btn-generic-edit-sm'
        onClick={() => {
          updatePaymentMethodModalService.open();
          fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.UPDATE_CARD_CLICKED);
        }}>
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
      {cardExpired && (
        <Fragment>
          <span className='icon-remove' />
          <div className='card-expired'>{translate(TRANSLATION_KEYS.ExpiredLabel)}</div>
        </Fragment>
      )}
    </div>
  );
};

export default GeneralCard;

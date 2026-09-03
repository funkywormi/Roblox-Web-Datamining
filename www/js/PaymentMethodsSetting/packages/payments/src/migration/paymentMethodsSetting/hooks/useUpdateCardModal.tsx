/* eslint-disable react/jsx-no-literals */
/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Button, IModalService, Modal, TSystemFeedbackService } from 'react-style-guide';
import { fireEvent } from 'roblox-event-tracker';
import {
  getDateFromFormattedExpiration,
  getShortenedDateFormat,
  getMonthAndYearFromFormattedExpiration
} from '../../core/utils/dateUtils';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { COUNTER_METRICS, getPaymentMethodClassNameMapping } from '../constants/constants';
import { updateCardExpiry } from '../services/paymentMethodsSettingService';

type TUpdateCardModalProps = {
  translate: TranslateFunction;
  onUpdateSuccess: (month: number, year: number) => void;
  systemFeedbackService: TSystemFeedbackService;
  paymentProfileId: string;
  cardType: string;
  lastFour: string;
  expMonth: number; // Will be formatted as MM
  expYear: number; // Will be formatted as YY
};

const useUpdateCardModal = (): [
  ({
    translate,
    onUpdateSuccess,
    systemFeedbackService,
    paymentProfileId,
    cardType,
    lastFour,
    expMonth,
    expYear
  }: TUpdateCardModalProps) => JSX.Element,
  IModalService
] => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const modalService: IModalService = useMemo(
    () => ({
      open: () => setModalOpen(true),
      close: () => setModalOpen(false)
    }),
    []
  );

  const UpdatePaymentMethodModal = ({
    translate,
    onUpdateSuccess,
    systemFeedbackService,
    paymentProfileId,
    cardType,
    lastFour,
    expMonth,
    expYear
  }: TUpdateCardModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [expiration, setExpiration] = useState<string>(getShortenedDateFormat(expYear, expMonth));
    const [expirationError, setExpirationError] = useState<boolean>(false);
    const updatePaymentMethodHeader = translate(TRANSLATION_KEYS.UpdatePaymentMethodHeading);
    const cardNum = `****${lastFour}`;
    const updateDisclosure = {
      __html: translate('Description.SavedCreditCard.StripeUpdatePaymentMethodDisclosure', {
        RobloxTermsLinkStart:
          '<a href="https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use" class="text-link" target="_blank">',
        RobloxTermsLinkEnd: '</a>',
        RobloxPrivacyPolicyLinkStart: `<a href='https://en.help.roblox.com/hc/en-us/articles/115004630823-Roblox-Privacy-and-Cookie-Policy' class="text-link" target="_blank">`,
        RobloxPrivacyPolicyLinkEnd: '</a>',
        StripeTermsOfUseLinkStart:
          '<a href="https://stripe.com/legal/end-users" class="text-link" target="_blank">',
        StripeTermsOfUseLinkEnd: '</a>',
        StripePrivacyPolicyLinkStart: `<a href='https://stripe.com/privacy' class="text-link" target="_blank">`,
        StripePrivacyPolicyLinkEnd: '</a>'
      })
    };

    useEffect(() => {
      if (!modalOpen) {
        setExpiration(getShortenedDateFormat(expYear, expMonth));
      }
      setExpirationError(false);
      setCanSubmit(false);
    }, [expMonth, expYear]);

    useEffect(() => {
      const initialDate = new Date(expYear, expMonth - 1);
      const proposedDate = getDateFromFormattedExpiration(expiration);
      const startOfTheMonth = new Date(new Date().getFullYear(), new Date().getMonth());

      setCanSubmit(proposedDate !== initialDate && proposedDate >= startOfTheMonth);
      setExpirationError(proposedDate < startOfTheMonth || proposedDate < initialDate);
    }, [expMonth, expYear, expiration]);

    const onUpdate = useCallback(async () => {
      setLoading(true);

      try {
        const [month, year] = getMonthAndYearFromFormattedExpiration(expiration);
        fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_CALLED);
        const response = await updateCardExpiry(paymentProfileId, month, year);
        if (response.status === 200) {
          fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_SUCCEEDED);
          systemFeedbackService.success(translate(TRANSLATION_KEYS.UpdatePaymentMethodSuccessDesc));
          onUpdateSuccess(month, year);
        }
      } catch (e) {
        fireEvent(COUNTER_METRICS.API.UPDATE_SAVED_PAYMENT_PROFILE_FAILED);
        systemFeedbackService.warning(
          translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse)
        );
      }

      setLoading(false);
      modalService.close();
    }, [expiration, onUpdateSuccess, paymentProfileId, systemFeedbackService, translate]);

    return (
      <Modal
        show={modalOpen}
        onHide={modalService.close}
        size='md'
        id='update-payment-method-modal'>
        <Modal.Header title={updatePaymentMethodHeader} onClose={modalService.close} />
        <Modal.Body>
          <div className='modal-description font-header-2 text-emphasis'>
            {translate(TRANSLATION_KEYS.CreditOrDebitCardHeading)}
          </div>
          <div className='fr payment-method-display'>
            <span
              className={`payment-method-image cardIcon ${getPaymentMethodClassNameMapping(
                cardType
              )}`}
            />
            <div className='cardNumber text-emphasis font-header-2'>{cardNum}</div>
          </div>
          <div className='font-caption-header text-emphasis'>{translate('Label.Expiration')}</div>
          <input
            type='string'
            name='expiration'
            placeholder='MM/YY'
            className={`expiry-input ${expirationError ? 'error-input' : ''}`}
            value={expiration}
            inputMode='numeric'
            onChange={e => {
              let input = e.target.value;

              // Deletion
              if (expiration.indexOf(input) === 0) {
                setExpiration(input);
                return;
              }

              if (expiration.length >= 2 && input.startsWith('1/')) {
                input = `0${input}`;
              }

              // // Remove any non-numeric characters
              input = input.replace(/\D/g, '');

              if (input.length > 4) {
                input = input.slice(0, 4);
              }

              if (input.length === 1 && input !== '0' && input !== '1') {
                // months 2-9 are prefixed with 0
                input = `0${input}/`;
              } else if (input.length === 2 && Number(input) > 12) {
                input = `0${input.slice(0, 1)}/${input.slice(1)}`;
              } else if (input.length >= 2 && input.length <= 4) {
                input = `${input.slice(0, 2)}/${input.slice(2)}`;
              }

              setExpiration(input);
            }}
          />
          {expirationError && (
            <div className='font-caption-body input-error-text'>
              {translate(TRANSLATION_KEYS.InvalidExpirationDate)}
            </div>
          )}
        </Modal.Body>
        <div className='footer-divider' />
        <Modal.Footer>
          <div
            className='font-caption-body disclosure-text'
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={updateDisclosure}
          />
          <div className='modal-buttons'>
            <Button
              variant={Button.variants.secondary}
              width={Button.widths.full}
              size={Button.sizes.large}
              className='action-button'
              onClick={modalService.close}>
              {translate('Action.Cancel')}
            </Button>
            <Button
              width={Button.widths.full}
              size={Button.sizes.large}
              className='action-button'
              isLoading={loading}
              isDisabled={!canSubmit}
              onClick={onUpdate}>
              {translate('Action.Save')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  return [UpdatePaymentMethodModal, modalService];
};

export default useUpdateCardModal;

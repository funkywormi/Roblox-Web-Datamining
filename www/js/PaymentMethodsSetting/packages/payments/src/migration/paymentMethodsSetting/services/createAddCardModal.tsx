/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { createModal, IModalService, TSystemFeedbackService } from 'react-style-guide';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { fireEvent } from 'roblox-event-tracker';
import StripeForm from '../components/StripeForm';
import {
  COUNTER_METRICS,
  getPaymentMethodsSettingTabUrl,
  STRIPE_ERROR_CODES
} from '../constants/constants';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { PAYMENT_PROVIDER, verifyPaymentProfileCreation } from './paymentMethodsSettingService';

type TAddCardModalProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  onSuccess: () => void;
  stripeEmail: string;
  robloxEmail: string;
};

export function createAddCardModal(): [
  ({
    translate,
    systemFeedbackService,
    onSuccess,
    stripeEmail,
    robloxEmail
  }: TAddCardModalProps) => JSX.Element,
  IModalService
] {
  const [Modal, modalService] = createModal();

  function AddCardModal({
    translate,
    systemFeedbackService,
    onSuccess,
    stripeEmail,
    robloxEmail
  }: TAddCardModalProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState<boolean>(false);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
    const [inputEmail, setInputEmail] = useState<string>(
      stripeEmail !== '' ? stripeEmail : robloxEmail
    );
    const [stripeErrorCode, setStripeErrorCode] = useState<string | null>(null);
    let providerPaymentProfileId = '';

    const addPaymentMethodHeader = translate(TRANSLATION_KEYS.AddPaymentMethodHeading);

    const onFormChange = (disable: boolean) => {
      setDisableSubmit(disable);
    };

    const updateEmail = (email: string) => {
      setInputEmail(email);
    };

    const verifyPaymentProfileCreationPoll = async () => {
      try {
        fireEvent(COUNTER_METRICS.API.VERIFY_PAYMENT_PROFILE_CALLED);
        const response = await verifyPaymentProfileCreation(
          PAYMENT_PROVIDER.Stripe,
          providerPaymentProfileId
        );
        if (response) {
          fireEvent(COUNTER_METRICS.API.VERIFY_PAYMENT_PROFILE_SUCCEEDED);
          return true;
        }
      } catch (e) {
        fireEvent(COUNTER_METRICS.API.VERIFY_PAYMENT_PROFILE_FAILED);
      }
      return false;
    };

    const poll = async (fn: () => Promise<boolean>, interval: number, times: number) => {
      try {
        const result = await fn();
        if (result) {
          systemFeedbackService.success(
            translate(TRANSLATION_KEYS.SavePaymentMethodSuccessResponse)
          );
          onSuccess();
          setLoading(false);
          modalService.close();
          return;
        }
        if (times === 0) {
          fireEvent(COUNTER_METRICS.STRIPE.CONFIRM_SETUP_INTENT_FAILED);
          systemFeedbackService.warning(translate(TRANSLATION_KEYS.SavePaymentMethodErrorDesc));
          setLoading(false);
          modalService.close();
          return;
        }
        setTimeout(() => {
          void poll(fn, interval, times - 1);
        }, interval);
      } catch (e) {
        fireEvent(COUNTER_METRICS.API.VERIFY_PAYMENT_PROFILE_FAILED);
      }
    };

    const onSubmit = async () => {
      if (!stripe || !elements) {
        modalService.close();
        return;
      }

      setLoading(true);
      setStripeErrorCode(null);

      let confirmParams;
      type AllowRedisplay = 'always' | 'limited' | 'unspecified';
      const allowRedisplayValue: AllowRedisplay = 'always';

      if (stripeEmail === '' && inputEmail !== robloxEmail) {
        confirmParams = {
          return_url: getPaymentMethodsSettingTabUrl(),
          payment_method_data: {
            billing_details: {
              email: inputEmail
            },
            allow_redisplay: allowRedisplayValue
          }
        };
      } else {
        confirmParams = {
          return_url: getPaymentMethodsSettingTabUrl(),
          payment_method_data: {
            allow_redisplay: allowRedisplayValue
          }
        };
      }

      try {
        fireEvent(COUNTER_METRICS.STRIPE.CONFIRM_SETUP_INTENT_CALLED);
        const response = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
          confirmParams
        });
        if (response?.setupIntent?.status === 'succeeded') {
          fireEvent(COUNTER_METRICS.STRIPE.CONFIRM_SETUP_INTENT_SUCCEEDED);
          providerPaymentProfileId = response?.setupIntent?.payment_method?.toString() ?? '';
          if (providerPaymentProfileId) {
            void poll(verifyPaymentProfileCreationPoll, 5000, 3);
          }
        } else if (response?.error?.code) {
          fireEvent(COUNTER_METRICS.STRIPE.CONFIRM_SETUP_INTENT_FAILED);
          switch (response.error.code) {
            case STRIPE_ERROR_CODES.INCORRECT_CVC:
            case STRIPE_ERROR_CODES.EXPIRED_CARD:
              setStripeErrorCode(response?.error?.code);
              break;
            case STRIPE_ERROR_CODES.CARD_DECLINED:
              systemFeedbackService.warning(
                translate(TRANSLATION_KEYS.CardDeclinedErrorDesc) ||
                  'Card declined. Please review the card details or try a different card.'
              );
              modalService.close();
              break;
            default:
              systemFeedbackService.warning(translate(TRANSLATION_KEYS.SavePaymentMethodErrorDesc));
              modalService.close();
          }
          setLoading(false);
        }
      } catch (e) {
        fireEvent(COUNTER_METRICS.STRIPE.CONFIRM_SETUP_INTENT_FAILED);
        systemFeedbackService.warning(translate(TRANSLATION_KEYS.SavePaymentMethodErrorDesc));
        modalService.close();
        setLoading(false);
      }
    };

    // TODO: Figure out how to prevent closing modal when clicking on backdrop
    return (
      <Modal
        id='add-card-modal'
        title={addPaymentMethodHeader}
        body={
          <StripeForm
            translate={translate}
            elements={elements}
            onFormChange={onFormChange}
            updateInputEmail={updateEmail}
            stripeEmail={stripeEmail}
            robloxEmail={robloxEmail}
            stripeErrorCode={stripeErrorCode}
          />
        }
        loading={loading}
        neutralButtonText={translate(TRANSLATION_KEYS.CancelAction)}
        actionButtonText={translate(TRANSLATION_KEYS.SaveAction)}
        onNeutral={() => {
          fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.CANCEL_ADD_CLICKED);
          modalService.close();
        }}
        onAction={() => {
          fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.SUBMIT_ADD_CLICKED);
          void onSubmit();
        }}
        closeable
        size='md'
        actionButtonShow
        disableActionButton={disableSubmit}
      />
    );
  }

  return [AddCardModal, modalService];
}

export default createAddCardModal;

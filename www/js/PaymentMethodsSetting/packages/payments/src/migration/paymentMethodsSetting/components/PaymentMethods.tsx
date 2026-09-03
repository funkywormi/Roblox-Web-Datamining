/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useCallback, useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { Button, TSystemFeedbackService } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import { fireEvent } from 'roblox-event-tracker';
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import GeneralCard from './GeneralCard';
import PayPalAccount from './PayPalAccount';
import { createAddCardModal } from '../services/createAddCardModal';
import {
  getPaymentProfileSetup,
  getSavedPaymentProfiles,
  PAYMENT_PROVIDER,
  SavedPaymentProfile
} from '../services/paymentMethodsSettingService';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import OtherPaymentMethods from './OtherPaymentMethods';
import {
  COUNTER_METRICS,
  getStripeFormOptions,
  getStripePublicAPIKeyForEnv
} from '../constants/constants';

type TPaymentMethodsProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  hideAddCardButton: boolean;
  shouldDisplaySavedPaymentMethods: boolean;
  hideSavedPaymentMethodsIfNoSavedCards: boolean;
};

const [AddCardModal, addCardModalService] = createAddCardModal();

export const PaymentMethods = ({
  translate,
  systemFeedbackService,
  hideAddCardButton,
  shouldDisplaySavedPaymentMethods,
  hideSavedPaymentMethodsIfNoSavedCards
}: TPaymentMethodsProps): JSX.Element => {
  const isMobile = DeviceMeta ? DeviceMeta().isAndroidApp || DeviceMeta().isIosApp : false;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentProfiles, setPaymentProfiles] = useState<Array<SavedPaymentProfile> | null>([]);
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [stripeEmail, setStripeEmail] = useState<string>('');
  const [robloxEmail, setRobloxEmail] = useState<string>('');
  const savedPaymentMethodHeader = translate(TRANSLATION_KEYS.SavedPaymentMethodHeading);
  const noPaymentMethodsText = translate(TRANSLATION_KEYS.NoSavedPaymentMethodsDesc);

  const fetchSavedPaymentProfiles = async () => {
    try {
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_CALLED);
      const response = await getSavedPaymentProfiles();
      if (response?.data?.length > 0 && shouldDisplaySavedPaymentMethods) {
        setPaymentProfiles(response.data.slice());
      }
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_SUCCEEDED);
    } catch (e) {
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_FAILED);
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
    setIsLoading(false);
  };

  const fetchStripePromise = async () => {
    try {
      const stripePublicKey = getStripePublicAPIKeyForEnv();
      fireEvent(COUNTER_METRICS.STRIPE.LOAD_STRIPE_CALLED);
      const response = await loadStripe(stripePublicKey);
      fireEvent(COUNTER_METRICS.STRIPE.LOAD_STRIPE_SUCCEEDED);
      setStripePromise(response);
    } catch (e) {
      fireEvent(COUNTER_METRICS.STRIPE.LOAD_STRIPE_FAILED);
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchStripeClientSecret = async () => {
    try {
      fireEvent(COUNTER_METRICS.API.GET_PAYMENT_PROFILE_SETUP_CALLED);
      const response = await getPaymentProfileSetup(PAYMENT_PROVIDER.Stripe);
      fireEvent(COUNTER_METRICS.API.GET_PAYMENT_PROFILE_SETUP_SUCCEEDED);
      setClientSecret(response?.data?.providerPayload?.clientSecret ?? '');
      if (response?.data?.providerPayload?.stripeCustomerEmail) {
        setStripeEmail(response?.data?.providerPayload?.stripeCustomerEmail);
        fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.STRIPE_EMAIL_EXISTS);
      } else {
        fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.STRIPE_EMAIL_DOES_NOT_EXIST);
      }
      setRobloxEmail(response?.data?.providerPayload?.robloxUserEmail ?? '');
    } catch (e) {
      fireEvent(COUNTER_METRICS.API.GET_PAYMENT_PROFILE_SETUP_FAILED);
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  useEffect(() => {
    void fetchSavedPaymentProfiles();
  }, [hideAddCardButton, shouldDisplaySavedPaymentMethods]);

  const onAddCardClick = useCallback(async () => {
    await fetchStripePromise();
    await fetchStripeClientSecret();
    addCardModalService.open();
    fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.ADD_CARD_CLICKED);
  }, []);

  const onAddCardSuccess = useCallback(async () => {
    await fetchSavedPaymentProfiles();
  }, [hideAddCardButton, shouldDisplaySavedPaymentMethods]);

  const removePaymentProfile = (index: number) => {
    if (paymentProfiles) {
      const newPaymentProfiles = paymentProfiles.slice();
      newPaymentProfiles.splice(index, 1);
      setPaymentProfiles(newPaymentProfiles);
    }
  };

  const showSavedPaymentMethods = !(
    hideSavedPaymentMethodsIfNoSavedCards && paymentProfiles?.length === 0
  );

  let paymentProfilesList;
  if (!isLoading) {
    if (paymentProfiles && paymentProfiles.length > 0) {
      paymentProfilesList = paymentProfiles?.map((paymentProfile, index) => {
        const { providerPayload } = paymentProfile;

        // Type narrowing: check payment profile type
        if (providerPayload.paymentProfileType === 'paypal') {
          return (
            <PayPalAccount
              key={paymentProfile.id.substring(0, 4)}
              translate={translate}
              systemFeedbackService={systemFeedbackService}
              updatePaymentProfiles={() => removePaymentProfile(index)}
              paymentProfileId={paymentProfile.id}
              email={providerPayload.Email}
            />
          );
        }

        // Type narrowing: if it's a card type
        if (providerPayload.paymentProfileType === 'card') {
          return (
            <GeneralCard
              key={paymentProfile.id.substring(0, 4)}
              translate={translate}
              systemFeedbackService={systemFeedbackService}
              updatePaymentProfiles={() => removePaymentProfile(index)}
              paymentProfileId={paymentProfile.id}
              cardType={providerPayload.CardNetwork}
              lastFour={providerPayload.Last4Digits}
              expMonth={providerPayload.ExpMonth}
              expYear={providerPayload.ExpYear}
            />
          );
        }

        // Unknown payment type, skip rendering
        return null;
      });
    } else {
      paymentProfilesList = showSavedPaymentMethods && (
        <div className='no-payment-methods-text'>{noPaymentMethodsText}</div>
      );
      fireEvent(COUNTER_METRICS.API.GET_SAVED_PAYMENT_PROFILES_RETURNS_NONE);
    }
  }

  return (
    <div className='payment-methods-settings-container'>
      {stripePromise && clientSecret ? (
        <Elements
          key={clientSecret}
          stripe={stripePromise && clientSecret ? stripePromise : null}
          options={
            stripePromise && clientSecret
              ? (getStripeFormOptions(clientSecret) as StripeElementsOptions)
              : undefined
          }>
          <AddCardModal
            translate={translate}
            systemFeedbackService={systemFeedbackService}
            onSuccess={() => {
              void onAddCardSuccess();
            }}
            stripeEmail={stripeEmail}
            robloxEmail={robloxEmail}
          />
        </Elements>
      ) : null}
      {showSavedPaymentMethods && (
        <div className='saved-payment-method-header-container'>
          <h5>{savedPaymentMethodHeader}</h5>
          {!isMobile && !hideAddCardButton ? (
            <Button
              className='add-card-button btn-secondary-md'
              onClick={() => {
                void onAddCardClick();
                fireEvent(COUNTER_METRICS.SAVED_PAYMENT_METHODS.ADD_CARD_CLICKED);
              }}>
              {translate(TRANSLATION_KEYS.AddAction)}
            </Button>
          ) : null}
        </div>
      )}
      {isLoading ? <span className='spinner spinner-default' /> : paymentProfilesList}
      {!isMobile ? (
        <OtherPaymentMethods translate={translate} systemFeedbackService={systemFeedbackService} />
      ) : null}
    </div>
  );
};

export default PaymentMethods;

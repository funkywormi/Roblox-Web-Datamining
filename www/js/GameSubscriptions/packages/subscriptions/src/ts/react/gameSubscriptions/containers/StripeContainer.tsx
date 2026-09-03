/* eslint-disable no-void */
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements } from '@stripe/react-stripe-js';
import {
  getStripeFormOptions,
  getStripePublicAPIKeyForEnv
} from '../../../core/constants/paymentConstants';
import '../../../../css/shared/stripe.scss';
import StripeModal from '../components/StripeModal';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import useGameSubscriptions from '../hooks/useGameSubscriptions';
import { GameSubscriptionActionTypes } from '../utils/GameSubscriptionActions';
import trackerClient, {
  SubscriptionInputType,
  SubscriptionPurchaseEventType,
  SubscriptionViewName
} from '../utils/logging';

const StripeContainer = (): JSX.Element => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const { systemFeedbackService } = useSystemFeedbackContext();
  const { translate } = useTranslation();
  const { state, dispatch } = useGameSubscriptions();
  const { showStripeModal, stripeClientSecret } = state;
  const { purchaseFlowUuid, selectedSubscription } = state;

  useEffect(() => {
    const fetchStripePromise = async () => {
      try {
        const stripePublicKey = getStripePublicAPIKeyForEnv();
        const response = await loadStripe(stripePublicKey);
        setStripePromise(response);
      } catch (e) {
        systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
        dispatch({ type: GameSubscriptionActionTypes.CLOSE_STRIPE_MODAL });
      }
    };
    void fetchStripePromise();
  }, [dispatch, systemFeedbackService, translate]);

  useEffect(() => {
    if (stripeClientSecret && stripePromise && selectedSubscription) {
      trackerClient.sendExperienceSubscriptionEvent(
        purchaseFlowUuid,
        SubscriptionPurchaseEventType.VIEW_SHOWN,
        SubscriptionViewName.VPC_NEW_PAYMENT_MODAL,
        selectedSubscription,
        SubscriptionInputType.SUBSCRIBE
      );
    }
  }, [stripePromise, stripeClientSecret, selectedSubscription, purchaseFlowUuid]);

  if (!stripePromise || !stripeClientSecret) {
    return <Fragment />;
  }

  return (
    <Elements
      key={stripeClientSecret}
      stripe={stripePromise && stripeClientSecret ? stripePromise : null}
      options={
        stripePromise && stripeClientSecret ? getStripeFormOptions(stripeClientSecret) : undefined
      }>
      <StripeModal
        showStripeModal={showStripeModal}
        closeStripeModal={() => dispatch({ type: GameSubscriptionActionTypes.CLOSE_STRIPE_MODAL })}
      />
    </Elements>
  );
};

export default StripeContainer;

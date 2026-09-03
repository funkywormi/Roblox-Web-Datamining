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
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import useSystemFeedbackContext from '../hooks/useSystemFeedback';
import { getStripeClientSecret } from '../../../core/services/paymentServices';

type StripeElementsContainerProps = {
  children: JSX.Element | JSX.Element[];
};

const StripeElementsContainer: React.FC<StripeElementsContainerProps> = ({
  children
}): JSX.Element => {
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const { systemFeedbackService } = useSystemFeedbackContext();
  const { translate } = useTranslation();

  useEffect(() => {
    const fetchStripePromise = async () => {
      try {
        const stripePublicKey = getStripePublicAPIKeyForEnv();
        const response = await loadStripe(stripePublicKey);
        setStripePromise(response);
        const clientSecret = await getStripeClientSecret();
        setStripeClientSecret(clientSecret);
      } catch (e) {
        systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError));
      }
    };
    void fetchStripePromise();
  }, [systemFeedbackService, translate]);

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
      {children}
    </Elements>
  );
};

export default StripeElementsContainer;

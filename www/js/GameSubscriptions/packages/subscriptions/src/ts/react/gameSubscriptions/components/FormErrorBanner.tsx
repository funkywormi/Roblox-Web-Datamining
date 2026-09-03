import React from 'react';
import { useTranslation } from 'react-utilities';
import { STRIPE_ERROR_CODES } from '../../../core/constants/paymentConstants';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';

type TFormErrorBannerProps = {
  errorCode: string;
};

export const FormErrorBanner = ({ errorCode }: TFormErrorBannerProps): JSX.Element | null => {
  const { translate } = useTranslation();

  let errorMessage = '';
  switch (errorCode) {
    case STRIPE_ERROR_CODES.INCORRECT_CVC:
      errorMessage = translate(FeatureSubscriptions.ErrorStripeIncorrectCVC);
      break;
    case STRIPE_ERROR_CODES.EXPIRED_CARD:
      errorMessage = translate(FeatureSubscriptions.ErrorStripeCardExpired);
      break;
    default:
      return null;
  }

  return <div className='alert-warning small-oneline form-error-banner'>{errorMessage}</div>;
};

export default FormErrorBanner;

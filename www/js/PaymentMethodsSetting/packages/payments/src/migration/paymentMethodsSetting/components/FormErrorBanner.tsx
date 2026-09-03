import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { STRIPE_ERROR_CODES } from '../constants/constants';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TFormErrorBannerProps = {
  translate: TranslateFunction;
  errorCode: string;
};

export const FormErrorBanner = ({
  translate,
  errorCode
}: TFormErrorBannerProps): JSX.Element | null => {
  let errorMessage = '';
  switch (errorCode) {
    case STRIPE_ERROR_CODES.INCORRECT_CVC:
      errorMessage =
        translate(TRANSLATION_KEYS.IncorrectCVCErrorDesc) ||
        'Incorrect CVC. Please check your information and try again.';
      break;
    case STRIPE_ERROR_CODES.EXPIRED_CARD:
      errorMessage =
        translate(TRANSLATION_KEYS.CardExpiredErrorDesc) ||
        'Card expired. Please review the card details or try a different card.';
      break;
    default:
      return null;
  }

  return <div className='alert-warning small-oneline form-error-banner'>{errorMessage}</div>;
};

export default FormErrorBanner;

/* eslint-disable react/jsx-no-literals */
import { AddressElement, PaymentElement } from '@stripe/react-stripe-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { StripeAddressElement, StripePaymentElement, StripeElements } from '@stripe/stripe-js';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import FormErrorBanner from './FormErrorBanner';

type StripeFormProps = {
  onFormStatusChange: (isSubmitAllowed: boolean) => void;
  inputEmail: string;
  setInputEmail: React.Dispatch<React.SetStateAction<string>>;
  stripeErrorCode: string | null;
  elements: StripeElements | null;
};

const StripeForm = ({
  onFormStatusChange,
  inputEmail,
  setInputEmail,
  stripeErrorCode,
  elements
}: StripeFormProps): JSX.Element => {
  const [emailError, setEmailError] = useState<boolean>(false);
  const { translate } = useTranslation();

  const paymentElement = useRef<StripePaymentElement | null | undefined>(null);
  const addressElement = useRef<StripeAddressElement | null | undefined>(null);

  const [paymentInfoComplete, setPaymentInfoComplete] = useState<boolean>(false);
  const [addressInfoComplete, setAddressInfoComplete] = useState<boolean>(false);

  const stripeFormDisclosure = {
    __html: translate(FeatureSubscriptions.MessageStripeAddPaymentMethodDisclosure, {
      stripeTermsOfUseLinkStart:
        '<a href="https://stripe.com/legal/end-users" class="text-link" target="_blank">',
      stripeTermsOfUseLinkEnd: '</a>',
      stripePrivacyPolicyLinkStart: `<a href='https://stripe.com/privacy' class="text-link" target="_blank">`,
      stripePrivacyPolicyLinkEnd: '</a>'
    })
  };

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Remove whitespace from string
      const inputtedEmail = event.target.value.trim().replace(/\s/g, '');
      // Check for correct email format
      const emailRegex = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
      setEmailError(inputtedEmail !== '' && emailRegex.exec(inputtedEmail) === null);
      setInputEmail(inputtedEmail);
    },
    [setInputEmail]
  );

  useEffect(() => {
    // Checks used to prevent duplicate event handlers from
    // being attached
    if (!paymentElement.current) {
      paymentElement.current = elements?.getElement('payment');

      if (paymentElement.current) {
        paymentElement.current.on('ready', () => {
          paymentElement.current?.clear();
        });
        paymentElement.current?.on('change', event => {
          setPaymentInfoComplete(event.complete);
        });
      }
    }
    if (!addressElement.current) {
      addressElement.current = elements?.getElement('address');

      if (addressElement.current) {
        addressElement.current.on('ready', () => {
          addressElement.current?.clear();
        });
        addressElement.current.on('change', event => {
          setAddressInfoComplete(event.complete);
        });
      }
    }
  }, [elements]);

  useEffect(() => {
    onFormStatusChange(
      paymentInfoComplete && addressInfoComplete && !emailError && inputEmail !== ''
    );
  }, [paymentInfoComplete, addressInfoComplete, inputEmail, emailError, onFormStatusChange]);

  return (
    <div>
      <div className='font-header-2 text-emphasis stripe-header'>
        {translate(FeatureSubscriptions.HeadingStripeFormAddPaymentMethod)}
      </div>
      <PaymentElement options={{ wallets: { applePay: 'never', googlePay: 'never' } }} />
      <div className='font-header-2 text-emphasis stripe-header billing-email-header'>
        {translate(FeatureSubscriptions.HeadingBillingEmail)}
      </div>
      <div>
        <div className={`form-group form-has-feedback ${emailError ? 'form-has-error' : ''}`}>
          <input
            className='form-control input-field billing-email-input'
            type='email'
            name='email'
            value={inputEmail}
            onChange={e => handleEmailChange(e)}
          />
        </div>
        <div className='form-group form-has-feedback'>
          <div className='form-control-label small text email-label'>
            {translate(FeatureSubscriptions.MessageStripeEmailInputSubText)}
          </div>
        </div>
      </div>
      <div className='font-header-2 text-emphasis stripe-header'>
        {translate(FeatureSubscriptions.HeadingBillingAddress)}
      </div>
      <AddressElement
        options={{
          mode: 'billing'
        }}
      />
      <div
        className='form-control-label small text stripe-form-disclosure'
        // This is intentional for the link portions of the translation string
        // Since this is a display and not an input this doesn't expose us to any attacks.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={stripeFormDisclosure}
      />
      {stripeErrorCode ? <FormErrorBanner errorCode={stripeErrorCode} /> : null}
    </div>
  );
};

export default StripeForm;

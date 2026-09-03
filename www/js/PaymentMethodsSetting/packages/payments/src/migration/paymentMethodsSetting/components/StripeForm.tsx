import React, { FC, useEffect, useState } from 'react';
import { PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { TranslateFunction } from 'react-utilities';
import { StripeAddressElement, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import FormErrorBanner from './FormErrorBanner';

export type StripeFormProps = {
  translate: TranslateFunction;
  elements: StripeElements | null;
  onFormChange: (disable: boolean) => void;
  updateInputEmail: (email: string) => void;
  stripeEmail: string;
  robloxEmail: string;
  stripeErrorCode: string | null;
};

// Component for core Stripe iframe
const StripeForm: FC<StripeFormProps> = ({
  translate,
  elements,
  onFormChange,
  updateInputEmail,
  stripeEmail,
  robloxEmail,
  stripeErrorCode
}) => {
  const [paymentInfoComplete, setPaymentInfoComplete] = useState<boolean>(false);
  const [addressInfoComplete, setAddressInfoComplete] = useState<boolean>(false);
  const [disableEmail, setDisableEmail] = useState<boolean>(
    stripeEmail !== '' || robloxEmail !== ''
  );
  const [userEmail, setUserEmail] = useState<string>(
    stripeEmail !== '' ? stripeEmail : robloxEmail
  );
  const [emailError, setEmailError] = useState<boolean>(false);
  const [inEditState, setInEditState] = useState<boolean>(false);

  const disclosure = {
    __html: translate(TRANSLATION_KEYS.AddPaymentMethodDisclosureDesc, {
      stripeTermsOfUseLinkStart:
        '<a href="https://stripe.com/legal/end-users" class="text-link" target="_blank">',
      stripeTermsOfUseLinkEnd: '</a>',
      stripePrivacyPolicyLinkStart: `<a href='https://stripe.com/privacy' class="text-link" target="_blank">`,
      stripePrivacyPolicyLinkEnd: '</a>'
    })
  };

  let paymentElement: StripePaymentElement | null | undefined;
  let addressElement: StripeAddressElement | null | undefined;

  const emailSubText = translate(TRANSLATION_KEYS.ProvideEmailDesc);
  const invalidEmailText = translate(TRANSLATION_KEYS.InvalidEmailLabel);
  const existingStripeEmailSubtext = translate(TRANSLATION_KEYS.EmailCannotBeChangedDesc);

  useEffect(() => {
    // Checks used to prevent duplicate event handlers from
    // being attached
    if (!paymentElement) {
      paymentElement = elements?.getElement('payment');
      paymentElement?.on('ready', function () {
        paymentElement?.clear();
      });
      paymentElement?.on('change', function (event) {
        setPaymentInfoComplete(event.complete);
      });
    }
    if (!addressElement) {
      addressElement = elements?.getElement('address');
      addressElement?.on('ready', function () {
        addressElement?.clear();
      });
      addressElement?.on('change', function (event) {
        setAddressInfoComplete(event.complete);
      });
    }
  }, []);

  useEffect(() => {
    onFormChange(!paymentInfoComplete || !addressInfoComplete || emailError || userEmail === '');
  }, [paymentInfoComplete, addressInfoComplete, userEmail, emailError]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remove whitespace from string
    const inputtedEmail = event.target.value.trim().replace(/\s/g, '');
    // Check for correct email format
    const emailRegex = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
    setEmailError(inEditState && inputtedEmail !== '' && emailRegex.exec(inputtedEmail) === null);
    setUserEmail(inputtedEmail);
    updateInputEmail(inputtedEmail);
  };

  const handleResetClick = () => {
    updateInputEmail(robloxEmail);
    setUserEmail(robloxEmail);
    setInEditState(false);
    setDisableEmail(true);
  };

  const handleEditClick = () => {
    updateInputEmail('');
    setUserEmail('');
    setInEditState(true);
    setDisableEmail(false);
  };

  const existingStripeEmailInputField = (
    <div>
      <div className={`form-group form-has-feedback ${emailError ? 'form-has-error' : ''}`}>
        <input
          className='form-control input-field billing-email-input'
          type='email'
          name='email'
          value={userEmail}
          onChange={e => handleEmailChange(e)}
          disabled
        />
        <span className='icon-status-unavailable' />
      </div>
      <div className='form-group form-has-feedback'>
        <div className='form-control-label small text email-label'>
          {existingStripeEmailSubtext}
        </div>
      </div>
    </div>
  );

  const existingRobloxEmailInputField = (
    <div>
      <div className={`form-group form-has-feedback ${emailError ? 'form-has-error' : ''}`}>
        <input
          className='form-control input-field billing-email-input unset-cursor'
          type='email'
          name='email'
          value={userEmail}
          onChange={e => handleEmailChange(e)}
          disabled={disableEmail}
        />
        {inEditState ? (
          <button type='button' className='icon-button-override' onClick={handleResetClick}>
            <span className='icon-regenerate' />
          </button>
        ) : (
          <button type='button' className='icon-button-override' onClick={handleEditClick}>
            <span className='icon-edit' />
          </button>
        )}
        {emailError ? <p className='form-control-label'>{invalidEmailText}</p> : null}
      </div>
      <div className='form-group form-has-feedback'>
        <div className='form-control-label small text email-label'>{emailSubText}</div>
      </div>
    </div>
  );

  const noExistingEmailInputField = (
    <div>
      <div className={`form-group form-has-feedback ${emailError ? 'form-has-error' : ''}`}>
        <input
          className='form-control input-field billing-email-input'
          type='email'
          name='email'
          value={userEmail}
          onChange={e => handleEmailChange(e)}
          disabled={disableEmail}
        />
      </div>
      <div className='form-group form-has-feedback'>
        <div className='form-control-label small text email-label'>{emailSubText}</div>
      </div>
    </div>
  );

  const getEmailInput = () => {
    if (stripeEmail !== '') {
      return existingStripeEmailInputField;
    }
    if (robloxEmail !== '') {
      return existingRobloxEmailInputField;
    }
    return noExistingEmailInputField;
  };

  // Loading state if stripePromise has not loaded yet
  if (!elements) {
    return (
      <div className='add-card-modal'>
        <h2 className='stripe-form-header'>
          {translate(TRANSLATION_KEYS.CreditOrDebitCardHeading)}
        </h2>
        <span className='spinner spinner-default' />
        <h2 className='stripe-form-header'>{translate(TRANSLATION_KEYS.BillingAddressHeading)}</h2>
        <span className='spinner spinner-default' />
      </div>
    );
  }

  return (
    <div className='add-card-modal'>
      <h2 className='stripe-form-header'>{translate(TRANSLATION_KEYS.CreditOrDebitCardHeading)}</h2>
      <PaymentElement />
      <h2 className='stripe-form-header billing-email-header'>
        {translate(TRANSLATION_KEYS.BillingEmailHeading)}
      </h2>
      {getEmailInput()}
      <h2 className='stripe-form-header'>{translate(TRANSLATION_KEYS.BillingAddressHeading)}</h2>
      <AddressElement
        options={{
          mode: 'billing'
        }}
      />
      <div
        className='form-control-label small text stripe-form-disclosure'
        dangerouslySetInnerHTML={disclosure}
      />
      {stripeErrorCode ? (
        <FormErrorBanner translate={translate} errorCode={stripeErrorCode} />
      ) : null}
    </div>
  );
};

export default StripeForm;

/* eslint-disable react/jsx-no-literals */
import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-utilities';
import classNames from 'classnames';
import { IconButton } from '@rbx/foundation-ui';
import { CreditBalance } from '../../../core/types/serviceTypes';
import { PurchasePlatform, PaymentProvider } from '../../../core/types/subscriptionEnums';
import { PaymentProviderCardInfo } from '../../../core/types/cardInfo';
import '../../../../css/subscriptionManagement/paymentMethod.scss';
import { PremiumPurchasePlatform } from '../../../core/types/premiumEnums';
import { getPaymentIconClass } from '../utils/subscriptionUtils';

type PaymentMethodProps = {
  purchasePlatform: PurchasePlatform | PremiumPurchasePlatform;
  paymentProvider?: PaymentProvider;
  cardInfo?: PaymentProviderCardInfo;
  creditBalance: CreditBalance;
  isPaymentProfileEditingAllowed: boolean;
  onEditClick: () => void;
};

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  purchasePlatform,
  paymentProvider,
  cardInfo,
  creditBalance,
  isPaymentProfileEditingAllowed,
  onEditClick
}) => {
  const { translate } = useTranslation();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          tagClassName: 'remaining-credit-balance text-description',
          targetSelector: '.credit-balance-price-tag'
        }
      })
    );
  }, [creditBalance]);

  let paymentDetails: React.ReactNode = null;
  if (
    (purchasePlatform === PurchasePlatform.DESKTOP ||
      purchasePlatform === PremiumPurchasePlatform.DESKTOP) &&
    cardInfo &&
    paymentProvider === PaymentProvider.STRIPE
  ) {
    // If we purchased on desktop and have card information, display last 4 digits and expiration

    // Calculate expiration
    const expDate = new Date(cardInfo.expYear, cardInfo.expMonth - 1); // Note: Stripe Months are 1-12; Date months are 0-11.
    const expirationString = `${translate(
      'Label.SavedCreditCard.Exp'
    )} ${expDate.toLocaleDateString(undefined, {
      month: '2-digit',
      year: '2-digit'
    })}`;

    // Create last 4 digits
    const lastFourString = `****${cardInfo.last4Digits}`;

    paymentDetails = (
      <Fragment>
        <span className='card-four-digits'>{lastFourString}</span>
        <span className='card-expiraton text-description'>{expirationString}</span>
        {paymentProvider === PaymentProvider.STRIPE && isPaymentProfileEditingAllowed && (
          <IconButton
            className='edit-payment-method-button'
            icon='icon-regular-pencil-square'
            ariaLabel={translate('Action.EditPaymentMethod')}
            title={translate('Action.EditPaymentMethod')}
            size='Small'
            variant='Utility'
            onClick={onEditClick}
          />
        )}
      </Fragment>
    );
  } else if (
    purchasePlatform === PurchasePlatform.DESKTOP &&
    paymentProvider === PaymentProvider.CREDITBALANCE
  ) {
    paymentDetails = (
      <span className='purchase-platform-text text-description'>
        <span className='font-bold text-emphasis credit-label'>
          {translate('Label.RobloxCredit')}
        </span>
        <span>{translate('Label.Balance')}:</span>
        <span
          className='credit-balance-price-tag'
          data-amount={creditBalance.creditBalance}
          data-currency-code={creditBalance.currencyCode}
        />
      </span>
    );
  } else {
    // Otherwise display what platform the user purchased the subscription on instead of card info
    let paymentDetailsText = '';

    switch (purchasePlatform) {
      case PurchasePlatform.DESKTOP:
        switch (paymentProvider) {
          case PaymentProvider.BRAINTREE:
            // https://roblox.atlassian.net/browse/SUBS-4967
            // TODO: here we assume that a braintree payment is a paypal purchase. 
            // TODO: Technically it can be either paypal or venmo but we know that right now we only support paypal.
            paymentDetailsText = translate('Label.Subscriptions.PaypalPayment') || "Paypal";
            break;
          default:
            paymentDetailsText = translate('Label.Subscriptions.DesktopPayment');
            break;
        }
        break;
      case PurchasePlatform.APPLE:
        paymentDetailsText = translate('Label.Subscriptions.ApplePayment');
        break;
      case PurchasePlatform.GOOGLE:
        paymentDetailsText = translate('Label.Subscriptions.GooglePayment');
        break;
      default:
        break;
    }

    paymentDetails = (
      <span className='purchase-platform-text text-description'>{paymentDetailsText}</span>
    );
  }

  return (
    <div className='payment-method-container'>
      <span
        className={classNames(
          'card-icon',
          getPaymentIconClass(purchasePlatform, paymentProvider, cardInfo)
        )}
      />
      {paymentDetails}
    </div>
  );
};

export default PaymentMethod;

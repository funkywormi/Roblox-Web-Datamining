import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { Button } from 'react-style-guide';
import { fireEvent } from 'roblox-event-tracker';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { COUNTER_METRICS } from '../constants/constants';

type TSubscriptionProps = {
  translate: TranslateFunction;
  subscriptionIconClassName: string;
  subscriptionName: string;
  showCancelButton: boolean;
  cancelSubscriptionUrl: string;
  autoRenewDate: string; // Formatted as "Month Day Year"
  expirationDate: string; // Formatted as "Month Day Year"
};

export const Subscription = ({
  translate,
  subscriptionIconClassName,
  subscriptionName,
  showCancelButton,
  cancelSubscriptionUrl,
  autoRenewDate,
  expirationDate
}: TSubscriptionProps): JSX.Element => {
  const autoRenewPrefix = translate(TRANSLATION_KEYS.RenewsOnLabel);
  const autoRenew = `${autoRenewPrefix} ${autoRenewDate}`;
  const expirationPrefix = translate(TRANSLATION_KEYS.ExpiresOnLabel);
  const expiration = `${expirationPrefix} ${expirationDate}`;

  return (
    <div className='subscription-container'>
      <span className={subscriptionIconClassName} />
      <div className='subscription-desc'>
        <div className='subscription-header font-bold'>{subscriptionName}</div>
        {autoRenewDate !== '' ? (
          <p>{autoRenew}</p>
        ) : (
          <div className='expiration-text'>{expiration}</div>
        )}
      </div>
      {autoRenewDate !== '' && showCancelButton ? (
        <Button
          className='cancel-subscription-button btn-secondary-md'
          onClick={() => {
            fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.CANCEL_CLICKED);
            window.location.href = cancelSubscriptionUrl;
          }}>
          {translate(TRANSLATION_KEYS.CancelAction)}
        </Button>
      ) : null}
    </div>
  );
};

export default Subscription;

/* eslint-disable @typescript-eslint/restrict-template-expressions */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Modal } from 'react-style-guide';
import '../../../../css/subscriptionManagement/resubscribeSubscription.scss';
import classNames from 'classnames';
import { Price } from '../../../core/types/price';
import { PeriodType } from '../../../core/types/subscriptionEnums';
import {
  getSubscriptionResubscribeEligibility,
  resubscribeSubscription
} from '../../../core/services/subscriptionServices';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { UserSubscription } from '../../../core/types/userSubscription';
import trackerClient, { ManageEventType } from '../utils/logging';
import PriceDisplay from './PriceDisplay';
import PriceDisplayInRobux from './PriceDisplayInRobux';
import { premiumPeriod } from '../utils/premiumUtils';
import { getPaymentIconClass } from '../utils/subscriptionUtils';

type ResubscribeSubscriptionProps = {
  className?: string;
  subscription: UserSubscription | PremiumSubscription;
  onResubscribe?: (isPremium: boolean, subscriptionTargetKey?: string) => void;
  isPremium?: boolean;
  assumeEligible?: boolean;
};

const ResubscribeSubscription: React.FC<ResubscribeSubscriptionProps> = ({
  className,
  subscription,
  onResubscribe,
  isPremium = false,
  assumeEligible = false
}) => {
  const { translate } = useTranslation();

  // Whether the user is eligible to resubscribe
  const [canResubscribe, setCanResubscribe] = useState(assumeEligible);

  // Whether the modal that triggers resubscribe is visible
  const [isResubscribeModalVisible, setIsResubscribeModalVisible] = useState(false);

  // Whether the modal that shows a resubscribe error is visible
  const [isResubscribeErrorVisible, setIsResubscribeErrorVisible] = useState(false);

  const { systemFeedbackService } = useSystemFeedbackContext();

  // Get subscription resubscribe eligibility on load/change
  useEffect(() => {
    if (assumeEligible) return;
    getSubscriptionResubscribeEligibility({
      subscriptionProductTargetKey: subscription.subscriptionTargetKey
    })
      .then(response => {
        if (response) {
          setCanResubscribe(response.canResubscribe);
        }
      })
      .catch(() => {
        setCanResubscribe(false);
      });
  }, [subscription.subscriptionTargetKey, assumeEligible]);

  // Resubscribe the subscription on button click
  const resubscribe = () => {
    setIsResubscribeModalVisible(false);
    resubscribeSubscription({ subscriptionProductTargetKey: subscription.subscriptionTargetKey })
      .then(() => {
        systemFeedbackService.success(translate('Response.Subscriptions.ResubscribeSuccess'));

        setCanResubscribe(false);
        if (onResubscribe) {
          const targetKey =
            'subscriptionTargetKey' in subscription
              ? subscription.subscriptionTargetKey
              : undefined;
          onResubscribe(isPremium, targetKey);
        }
        if (!isPremium && 'subscriptionTargetKey' in subscription) {
          trackerClient.sendEvent(ManageEventType.RESUBSCRIBE_SUCCESS, subscription);
        }
      })
      .catch(() => setIsResubscribeErrorVisible(true));
  };

  // Show modal on button click
  const resubscribeButtonClick = () => {
    if (!isPremium) {
      if ('subscriptionTargetKey' in subscription) {
        trackerClient.sendEvent(ManageEventType.CLICK_RESUBSCRIBE, subscription);
      }
    }
    setIsResubscribeModalVisible(true);
  };

  // Convery expiration date to string
  const accessDateString = subscription.expiration.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const subscriptionPeriod = isPremium
    ? premiumPeriod(subscription as PremiumSubscription)
    : (subscription as UserSubscription).subscriptionPeriod || PeriodType.MONTH;
  const subscriptionPeriodCount = isPremium
    ? undefined
    : (subscription as UserSubscription).periodCount;

  const robuxPrice =
    !isPremium && 'priceInRobux' in subscription ? subscription.priceInRobux : null;
  const isRobux = robuxPrice != null && robuxPrice > 0;

  // Modal body content
  const resubscribeModalBody = () => {
    if (isRobux) {
      return (
        <div>
          <div className='description-top'>
            <span>
              {translate('Message.Subscriptions.ResubscribeConfirmationP1', {
                subscriptionName: subscription.name,
                subscriptionRenewalDate: accessDateString
              })}
            </span>{' '}
            <span>{translate('Message.Subscriptions.ResubscribeConfirmationP2')} </span>
            <PriceDisplayInRobux priceInRobux={robuxPrice} />
          </div>
        </div>
      );
    }
    if (subscription.cardInfo) {
      const lastFourString = `****${subscription.cardInfo.last4Digits}`;
      return (
        <div>
          <div className='description-top'>
            <span>
              {translate('Message.Subscriptions.ResubscribeConfirmationP1', {
                subscriptionName: subscription.name,
                subscriptionRenewalDate: accessDateString
              })}
            </span>
            <div className='resubscribe-payment-container'>
              <span
                className={classNames(
                  'resubscribe-card-icon',
                  getPaymentIconClass(
                    subscription.purchasePlatform,
                    subscription.paymentProvider,
                    subscription.cardInfo
                  )
                )}
              />
              <span className='card-four-digits'>{lastFourString}</span>
            </div>
            <span>{translate('Message.Subscriptions.ResubscribeConfirmationP2')} </span>
            <PriceDisplay
              price={subscription.price as Price}
              period={subscriptionPeriod}
              periodCount={subscriptionPeriodCount}
              className='resubscribe'
            />
          </div>
          <div className='description-bottom'>
            {translate('Message.Subscriptions.ResubscribeConfirmationP3')}
          </div>
        </div>
      );
    }
    return <div />;
  };
  return (
    <React.Fragment>
      {canResubscribe && (
        <button
          type='button'
          className={className}
          onClick={resubscribeButtonClick}
          data-testid='resubscribe'>
          {translate('Action.Resubscribe')}
        </button>
      )}
      <Modal show={isResubscribeModalVisible} onHide={() => setIsResubscribeModalVisible(false)}>
        <Modal.Header
          className='resubscribe-modal-header'
          title={translate('Action.Resubscribe')}
          showCloseButton
          onClose={() => setIsResubscribeModalVisible(false)}
        />
        <Modal.Body className='resubscribe-modal-body'>{resubscribeModalBody()}</Modal.Body>
        <Modal.Footer className='resubscribe-modal-footer'>
          <button
            type='button'
            className='btn-secondary-md btn-full-width'
            onClick={() => setIsResubscribeModalVisible(false)}>
            {translate('Action.Cancel')}
          </button>
          <button type='button' className='btn-cta-md btn-full-width' onClick={resubscribe}>
            {translate('Action.Resubscribe')}
          </button>
        </Modal.Footer>
      </Modal>
      <Modal show={isResubscribeErrorVisible} onHide={() => setIsResubscribeErrorVisible(false)}>
        <Modal.Header
          className='resubscribe-modal-header'
          title={translate('Heading.Dialog.DefaultError')}
          showCloseButton
          onClose={() => setIsResubscribeErrorVisible(false)}
        />
        <Modal.Body className='resubscribe-error-body'>
          {translate('Error.GenericError')}
          <span className='icon-status-alert-xl' />
        </Modal.Body>
        <Modal.Footer className='resubscribe-modal-footer'>
          <button
            type='button'
            className='btn-cta-md btn-full-width'
            onClick={() => setIsResubscribeErrorVisible(false)}>
            {translate('Action.Dialog.Success')}
          </button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default ResubscribeSubscription;

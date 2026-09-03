/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { authenticatedUser, deviceMeta } from 'header-scripts';
import { Intl } from 'Roblox';
import { Button, TSystemFeedbackService } from 'react-style-guide';
import { fireEvent } from 'roblox-event-tracker';
import {
  getUserPremiumSubscription,
  UserPremiumSubscriptionResponse
} from '../services/paymentMethodsSettingService';
import Subscription from './Subscription';
import {
  getSubscriptionPageUrl,
  getCancelSubscriptionPageUrl,
  PLATFORM_TYPE,
  ANDROID_CANCEL_RENEWAL_URL,
  TApiError,
  COUNTER_METRICS
} from '../constants/constants';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TSubscriptionsProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const Subscriptions = ({
  translate,
  systemFeedbackService
}: TSubscriptionsProps): JSX.Element => {
  const [userSubscription, setUserSubscription] = useState<UserPremiumSubscriptionResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const subscriptionsHeader = translate(TRANSLATION_KEYS.SubscriptionsHeading) || 'Subscriptions';
  const noSubscriptionsText = translate(TRANSLATION_KEYS.NoPremiumDesc);
  let cancelSubscriptionUrl = '';

  const getPremiumStatus = async () => {
    setIsLoading(true);
    try {
      fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_CALLED);
      const response = await getUserPremiumSubscription(authenticatedUser.id);
      if (response?.status === 200) {
        fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_SUCCEEDED);
        setUserSubscription(response?.data);
      }
    } catch (e: any) {
      const error = e as TApiError;
      // Note: 404 Status means the user does not have an subscription. It is not an error, so
      // we don't want to show an error message.
      if (error.status === 404) {
        fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.NO_EXISTING_SUBSCRIPTION);
      } else {
        fireEvent(COUNTER_METRICS.API.GET_USER_PREMIUM_SUBSCRIPTION_FAILED);
        systemFeedbackService.warning(
          translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse)
        );
      }
    }
    setIsLoading(false);
  };

  const showCancelButton = () => {
    const deviceMetaData = deviceMeta.getDeviceMeta();
    if (
      userSubscription &&
      userSubscription.subscriptionProductModel.purchasePlatform === PLATFORM_TYPE.isDesktop
    ) {
      // if user purchased subscription in desktop,
      // we show cancel button when user is not inApp/UWPApp, or in desktop UniversalApp.
      if (
        !deviceMetaData?.isInApp ||
        (deviceMetaData.isUniversalApp && deviceMetaData.isDesktop && !deviceMetaData.isUWPApp)
      ) {
        cancelSubscriptionUrl = getCancelSubscriptionPageUrl();
        return true;
      }
    } else if (
      userSubscription &&
      userSubscription.subscriptionProductModel.purchasePlatform === PLATFORM_TYPE.isAndroidApp
    ) {
      if (deviceMetaData?.isAndroidApp) {
        cancelSubscriptionUrl = ANDROID_CANCEL_RENEWAL_URL;
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    void getPremiumStatus();
  }, []);

  let autoRenew = '';
  let expiration = '';
  if (userSubscription?.subscriptionProductModel.subscriptionName) {
    const i = new Intl().getDateTimeFormatter();
    if (userSubscription?.subscriptionProductModel.renewal) {
      autoRenew = i.getCustomDateTime(userSubscription?.subscriptionProductModel.renewal, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
    if (userSubscription?.subscriptionProductModel.expiration) {
      expiration = i.getCustomDateTime(userSubscription?.subscriptionProductModel.expiration, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
  }

  if (isLoading) {
    return (
      <div>
        <h2 className='main-header'>{subscriptionsHeader}</h2>
        <span className='spinner spinner-default' />
      </div>
    );
  }

  if (userSubscription !== null) {
    return (
      <div>
        <h2 className='main-header'>{subscriptionsHeader}</h2>
        <Subscription
          translate={translate}
          subscriptionIconClassName='icon-premium-medium'
          subscriptionName={userSubscription?.subscriptionProductModel.subscriptionName} // TODO: Figure out if we need to translate subscription names
          showCancelButton={showCancelButton()}
          cancelSubscriptionUrl={cancelSubscriptionUrl}
          autoRenewDate={autoRenew}
          expirationDate={expiration}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className='main-header'>{subscriptionsHeader}</h2>
      <div className='subscription-container'>
        <p className='no-subscription-text'>{noSubscriptionsText}</p>
        <Button
          className='subscribe-button btn-secondary-md'
          onClick={() => {
            fireEvent(COUNTER_METRICS.SUBSCRIPTIONS.SUBSCRIBE_CLICKED);
            window.location.href = getSubscriptionPageUrl();
          }}>
          {translate(TRANSLATION_KEYS.SubscribeAction)}
        </Button>
      </div>
    </div>
  );
};

export default Subscriptions;

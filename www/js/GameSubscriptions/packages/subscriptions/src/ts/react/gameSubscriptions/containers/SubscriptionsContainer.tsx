import React, { useEffect, Fragment, useState } from 'react';
import { deviceMeta } from 'header-scripts';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-utilities';
import { Endpoints } from 'Roblox';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import { SubscriptionProductType } from '../../../core/types/subscriptionEnums';
import metadataConstants from '../../../core/constants/metadataConstants';
import {
  getSubscriptionMetadata,
  getSubscriptions,
  getSubscriptionsStatuses
} from '../../../core/services/subscriptionServices';
import SubscriptionsList from '../components/SubscriptionsList';
import StripeContainer from './StripeContainer';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import useGameSubscriptions from '../hooks/useGameSubscriptions';
import { GameSubscriptionActionTypes } from '../utils/GameSubscriptionActions';

export const SubscriptionsContainer = (): JSX.Element => {
  const { universeId = '' } = metadataConstants.gameMetadataData() || {};
  const { SystemFeedback } = useSystemFeedbackContext();
  const { translate } = useTranslation();
  const { state, dispatch } = useGameSubscriptions();
  const { subscriptions } = state;
  const [isStorePage, setIsStorePage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const [isWebPurchasingEnabled, setIsWebPurchasingEnabled] = useState(false);

  const logError = () => {
    // TODO: Add error instrumentation here.
    // https://roblox.atlassian.net/browse/SUBS-2115
  };

  useEffect(() => {
    if (
      location?.hash?.startsWith('#!/store') ||
      // Display for all UA builds that are on desktop
      (deviceMeta.getDeviceMeta()?.isUniversalApp && deviceMeta.getDeviceMeta()?.isDesktop) ||
      deviceMeta.getDeviceMeta()?.isPhone ||
      // Display on tablet but only if it isn't a UA build
      (deviceMeta.getDeviceMeta()?.isTablet && !deviceMeta.getDeviceMeta()?.isUniversalApp)
    ) {
      setIsStorePage(true);
      dispatch({ type: GameSubscriptionActionTypes.SEND_STORE_PAGE_LOAD_EVENT });
    }
  }, [dispatch, location, location?.hash, setIsStorePage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let computedUniverseId = '0';

      if (universeId) {
        computedUniverseId = universeId;
      } else if (deviceMeta.getDeviceMeta()?.isUniversalApp) {
        let path = location.pathname;
        if (Endpoints?.supportLocalizedUrls) {
          path = Endpoints.removeUrlLocale(path);
        }
        const [, , , urlUniverseId] = path.split('/');
        if (urlUniverseId) {
          computedUniverseId = urlUniverseId;
        }
      }

      const { subscriptionProductsInfo } = await getSubscriptions({
        subscriptionProductType: SubscriptionProductType.DEVELOPER_SUBSCRIPTION_PRODUCT,
        subscriptionProviderId: parseInt(computedUniverseId, 10) ?? 0
      });

      if (subscriptionProductsInfo.length > 0) {
        const targetKeys = subscriptionProductsInfo.map(info => info.subscriptionTargetKey);

        const { subscriptionStatuses } = await getSubscriptionsStatuses({
          subscriptionProductTargetKeys: targetKeys
        });

        subscriptionProductsInfo.forEach((info, index) => {
          const subscriptionStatus = subscriptionStatuses[info.subscriptionTargetKey];
          const subscriptionProductInfo = subscriptionProductsInfo[index];

          if (subscriptionStatus && subscriptionProductInfo) {
            subscriptionProductInfo.isForSale = !subscriptionStatus.isSubscribed;
            subscriptionProductsInfo[index] = subscriptionProductInfo;
          }
        });
      }

      dispatch({
        type: GameSubscriptionActionTypes.LOAD_SUBSCRIPTIONS,
        subscriptions: subscriptionProductsInfo
      });
      setIsLoading(false);
    };

    const fetchMetadata = async (): Promise<boolean> => {
      const response = await getSubscriptionMetadata();
      return response.isWebPurchasingEnabled;
    };

    if (isStorePage) {
      fetchMetadata()
        .then(purchasingEnabled => {
          setIsWebPurchasingEnabled(purchasingEnabled);

          if (purchasingEnabled) {
            fetchData().catch(logError);
          }
        })
        .catch(logError);
    }
  }, [dispatch, isStorePage, location.pathname, universeId]);

  if (!isWebPurchasingEnabled) {
    return <Fragment />;
  }

  if (isLoading || subscriptions.length === 0) {
    return <Fragment />;
  }

  return (
    <div id='rbx-subscriptions-container-content'>
      <div className='container-header'>
        <h3>{translate(FeatureSubscriptions.HeadingSubscriptions)}</h3>
      </div>
      <SubscriptionsList subscriptions={subscriptions} />
        <StripeContainer />
        <SystemFeedback />
    </div>
  );
};

export default SubscriptionsContainer;

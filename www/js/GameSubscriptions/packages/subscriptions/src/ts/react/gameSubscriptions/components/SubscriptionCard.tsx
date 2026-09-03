import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { CurrentUser } from 'Roblox';
import { createItemPurchase } from 'roblox-item-purchase';
import { Button, Icon } from '@rbx/foundation-ui';
import { Subscription } from '../../../core/types/serviceTypes';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import SubscriptionModal from './SubscriptionModal';
import SubscriptionDetailDrawer from './SubscriptionDetailDrawer';
import '../../../../css/gameSubscriptions/subscriptionCard.scss';
import useGameSubscriptions from '../hooks/useGameSubscriptions';
import trackerClient, {
  SubscriptionInputType,
  SubscriptionPurchaseEventType,
  SubscriptionViewName
} from '../utils/logging';
import { submitSafetyEvent } from '../../../core/services/safetyServices';
import { getPaymentMethodsForPurchase } from '../../../core/services/subscriptionServices';
import useSystemFeedbackContext from '../../shared/hooks/useSystemFeedback';
import { COUNTER_METRICS } from '../../subscriptionManagement/constants/metricConstants';
import { PaymentProvider } from '../../../core/types/subscriptionEnums';
import guacService from '../../../core/services/guacService';
import serviceConstants from '../../../core/constants/serviceConstants';
import { GameSubscriptionActionTypes } from '../utils/GameSubscriptionActions';
import { isRobuxSubscription } from '../utils/gameSubscriptionUtils';

const USE_UNIFIED_PURCHASE = true;

type TSubscriptionCardProps = {
  subscription: Subscription;
};

const SubscriptionCard = ({ subscription }: TSubscriptionCardProps): JSX.Element => {
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [primaryPaymentProviderType, setPrimaryPaymentProviderType] = useState('');
  const [allPaymentProviderTypes, setAllPaymentProviderTypes] = useState(['']);
  const closeModal = () => setShowModal(false);
  const { systemFeedbackService } = useSystemFeedbackContext();
  const { translate } = useTranslation();
  const { state, dispatch } = useGameSubscriptions();
  const { purchaseFlowUuid, pathName } = state;

  const {
    name,
    subscriptionProviderName,
    description,
    displayPrice,
    iconImageAssetId,
    subscriptionTargetKey,
    isForSale,
    priceInRobux,
    userBasePriceInRobux,
    priceDiscountDetails
  } = subscription;

  const isRobux = isRobuxSubscription(subscription);

  const discountInformation = useMemo(() => {
    if (!userBasePriceInRobux || !priceDiscountDetails?.length || !priceInRobux) return null;
    const totalDiscountAmount = userBasePriceInRobux - priceInRobux;
    if (totalDiscountAmount <= 0) return null;
    return {
      originalPrice: userBasePriceInRobux,
      totalDiscountAmount,
      totalDiscountPercentage: Math.round((totalDiscountAmount / userBasePriceInRobux) * 100),
      discounts: priceDiscountDetails.map(d => ({
        discountAmount: d.amountInRobux,
        discountPercentage: d.percent,
        discountCampaign: d.type
      }))
    };
  }, [userBasePriceInRobux, priceDiscountDetails, priceInRobux]);

  useEffect(() => {
    const { hash, pathname, search } = window.location;
    const hashQueryIndex = hash.indexOf('?');
    if (hashQueryIndex === -1) return;
    const hashParams = new URLSearchParams(hash.substring(hashQueryIndex));
    if (hashParams.get('subscription') === subscriptionTargetKey) {
      setShowDrawer(true);
      const cleanHash = hash.substring(0, hashQueryIndex);
      window.history.replaceState(null, '', `${pathname}${search}${cleanHash}`);
    }
  }, [subscriptionTargetKey]);

  const thumbnailComponent = useMemo(
    () => (
      <Thumbnail2d
        type={ThumbnailTypes.assetThumbnail}
        size={DefaultThumbnailSize}
        targetId={iconImageAssetId}
        altName={name}
        imgClassName='subscription-thumbnail'
        containerClass='subscription-thumbnail-container-class'
      />
    ),
    [iconImageAssetId, name]
  );

  const reportAbuseCallback = useCallback(async () => {
    const config = await guacService.loadGuacConfigNonThrowing();
    if (config?.EnableSubscriptions) {
      const reportUrl = serviceConstants.url.getAbuseReportRevampUrl({
        abuseVector: 'subscriptions',
        submitterId: CurrentUser.userId,
        targetId: subscriptionTargetKey,
        custom: JSON.stringify({
          stringId: iconImageAssetId.toString()
        })
      });
      window.location.href = reportUrl;
      return;
    }

    submitSafetyEvent({
      subscriptionTargetKey,
      imageAssetId: iconImageAssetId.toString(),
      reporterId: CurrentUser.userId
    })
      .then(() =>
        systemFeedbackService.success(translate(FeatureSubscriptions.MessageReportSubmitted))
      )
      .catch(() =>
        systemFeedbackService.warning(translate(FeatureSubscriptions.ErrorGenericError))
      );
  }, []);

  const getPrimaryActionButtonText = () => {
    if (isRobux) {
      return translate(FeatureSubscriptions.ActionSubscribe);
    }
    if (primaryPaymentProviderType === PaymentProvider.CREDITBALANCE) {
      return translate(FeatureSubscriptions.ActionSubscribeWithRobloxCredit);
    }
    return translate(FeatureSubscriptions.ActionSubscribeWithCreditDebitCard);
  };

  // Unified purchase flow — memoized so the component reference stays stable across re-renders
  const [ItemPurchase, itemPurchaseService] = useMemo(
    () => (USE_UNIFIED_PURCHASE ? createItemPurchase({ forceUnifiedModal: true }) : [null, null]),
    []
  );

  const onSubscribeClick = useCallback(() => {
    trackerClient.sendExperienceSubscriptionEvent(
      purchaseFlowUuid,
      SubscriptionPurchaseEventType.USER_INPUT,
      SubscriptionViewName.DEVSUB_CARD,
      subscription,
      SubscriptionInputType.OPEN_PURCHASE_MODAL
    );

    if (USE_UNIFIED_PURCHASE && itemPurchaseService) {
      if (isRobux) {
        setPrimaryPaymentProviderType('Robux');
      } else {
        getPaymentMethodsForPurchase(subscription.subscriptionTargetKey)
          .then(response => {
            setPrimaryPaymentProviderType(response.primaryPaymentProviderType);
            setAllPaymentProviderTypes(response.allPaymentProviderTypes);
          })
          .catch(() => {
            fireEvent(COUNTER_METRICS.API.GET_PAYMENT_METHODS_FAILED);
            setPrimaryPaymentProviderType(PaymentProvider.STRIPE);
            setAllPaymentProviderTypes([PaymentProvider.STRIPE]);
          });
      }
      itemPurchaseService.start();
      return;
    }

    // Fallback: old modal flow
    if (isRobux) {
      setPrimaryPaymentProviderType('Robux');
      setAllPaymentProviderTypes(['Robux']);
    } else {
      getPaymentMethodsForPurchase(subscription.subscriptionTargetKey)
        .then(response => {
          setPrimaryPaymentProviderType(response.primaryPaymentProviderType);
          setAllPaymentProviderTypes(response.allPaymentProviderTypes);
        })
        .catch(() => {
          fireEvent(COUNTER_METRICS.API.GET_PAYMENT_METHODS_FAILED);
          setPrimaryPaymentProviderType(PaymentProvider.STRIPE);
          setAllPaymentProviderTypes([PaymentProvider.STRIPE]);
        });
    }
    setShowModal(true);
  }, [isRobux, itemPurchaseService, purchaseFlowUuid, subscription]);

  const onPurchaseSuccess = useCallback(() => {
    dispatch({
      type: GameSubscriptionActionTypes.MARK_SUBSCRIBED,
      subscriptionTargetKey
    });
  }, [dispatch, subscriptionTargetKey]);

  return (
    <div className='subscription-card-item bg-shift-200'>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className='subscription-card-info' onClick={() => setShowDrawer(true)}>
        <div className='subscription-card-thumbnail'>{thumbnailComponent}</div>
        <div className='subscription-card-text'>
          <span className='text-title-medium content-emphasis subscription-card-title'>{name}</span>
          {description && (
            <span className='text-body-medium content-default subscription-card-description'>
              {description}
            </span>
          )}
          {isForSale && (
            <div className='subscription-card-price'>
              {isRobux && (
                <Icon name='icon-filled-robux' size='Small' className='content-default' />
              )}
              <span className='text-body-medium content-default'>
                {displayPrice}
                {translate(FeatureSubscriptions.LabelPerMonth)}
              </span>
            </div>
          )}
        </div>
      </div>
      <Button
        as='button'
        size='Medium'
        variant='Standard'
        isDisabled={!isForSale}
        onClick={onSubscribeClick}>
        {isForSale
          ? translate(FeatureSubscriptions.ActionSubscribe)
          : translate(FeatureSubscriptions.LabelSubscribed)}
      </Button>
      <div className='subscription-card-overlays'>
        {USE_UNIFIED_PURCHASE && ItemPurchase ? (
          <ItemPurchase
            translate={translate}
            productId={0}
            thumbnail={thumbnailComponent}
            assetName={name}
            assetType='Subscription'
            sellerName={subscriptionProviderName}
            expectedCurrency={1}
            expectedSellerId={parseInt(subscription.subscriptionProviderId, 10) || 0}
            expectedPrice={priceInRobux ?? 0}
            displayPrice={isRobux ? undefined : displayPrice}
            showSuccessBanner
            onPurchaseSuccess={onPurchaseSuccess}
            subscriptionTargetKey={subscriptionTargetKey}
            subscriptionPaymentProvider={primaryPaymentProviderType || 'Robux'}
            subscriptionTitle={translate(FeatureSubscriptions.HeadingGetSubscription)}
            primaryActionButtonText={getPrimaryActionButtonText()}
            subscriptionSecondaryPaymentProvider={
              !isRobux && allPaymentProviderTypes.length > 1
                ? allPaymentProviderTypes[1]
                : undefined
            }
            secondaryActionButtonText={
              !isRobux && allPaymentProviderTypes.length > 1
                ? translate(FeatureSubscriptions.ActionSubscribePayAnotherWay)
                : undefined
            }
            subscriptionFooterDisclaimer={translate(
              FeatureSubscriptions.MessageRecurringMonthlyDisclaimer
            )}
            subscriptionCancelPath={pathName}
            priceSuffix={translate(FeatureSubscriptions.LabelPerMonth)}
            discountInformation={discountInformation}
          />
        ) : (
          <SubscriptionModal
            title={translate(FeatureSubscriptions.HeadingGetSubscription)}
            show={showModal}
            assetId={iconImageAssetId}
            provider={subscriptionProviderName}
            name={name}
            displayPrice={displayPrice}
            description={description}
            isForSale={isForSale}
            cadence={translate(FeatureSubscriptions.LabelPerMonth)}
            cadenceDisclaimer={translate(FeatureSubscriptions.MessageMonthlyCadenceDisclaimer)}
            closeModal={closeModal}
            primaryPaymentProviderType={primaryPaymentProviderType}
            allPaymentProviderTypes={allPaymentProviderTypes}
            subscription={subscription}
          />
        )}
        <SubscriptionDetailDrawer
          show={showDrawer}
          subscription={subscription}
          onClose={() => setShowDrawer(false)}
          onSubscribe={onSubscribeClick}
          onReport={reportAbuseCallback}
          translate={translate}
        />
      </div>
    </div>
  );
};

export default SubscriptionCard;

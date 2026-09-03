import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import {
  PeriodType as ApiPeriodType,
  ProductType,
  RobloxSubscriptionProductFeatureConfig
} from '@rbx/client-subscriptions-api/v1';
import { Chip, Icon } from '@rbx/foundation-ui';
import { Link } from '@rbx/ui';
import { TranslationProvider } from '@rbx/core-scripts/react';
import {
  BenefitList,
  ONE_ROBUX_IN_MICROS,
  RobloxPlusGiftItemUpsellBanner,
  RobloxPlusFreeTrialBanner
} from '@rbx/subscriptions-common';
import { CreditBalance, SubscriptionMetadata } from '../../../core/types/serviceTypes';
import { APP_STORE_CANCEL_HELP_URL } from '../../../core/constants/websiteConstants';
import { PremiumPurchasePlatform } from '../../../core/types/premiumEnums';
import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { UserSubscription } from '../../../core/types/userSubscription';
import { PaymentProvider, PeriodType, PurchasePlatform } from '../../../core/types/subscriptionEnums';
import { premiumPeriod, premiumName } from '../utils/premiumUtils';
import PriceDisplay from './PriceDisplay';
import PriceDisplayInRobux from './PriceDisplayInRobux';
import CycleEndDate from './CycleEndDate';
import CancelSubscription from './CancelSubscription';
import ResubscribeSubscription from './ResubscribeSubscription';
import PaymentMethod from './PaymentMethod';
import '../../../../css/subscriptionManagement/subscriptionDetails.scss';
import {
  GetLowBalanceNotificationType,
  SubscriptionNotification
} from '../../../core/types/notifications';
import NotificationBanner from './NotificationBanner';
import Banner, { BannerType } from '../../shared/components/Banner';
import { isExpiring, hasFreeTrialOffer } from '../utils/subscriptionUtils';
import { getExperiencePlaceId } from '../../../core/services/gameServices';

// Only Premium 1000 and Premium 2200 unlock access to marketplace sell/earn
const minPremiumMarketplacSell = 1000;

const PLUS_UPSELL_BANNER_ASSET_ID = 85595358191154;

type SubscriptionDetailsProps = {
  subscription: UserSubscription | PremiumSubscription;
  isPremium: boolean;
  creditBalance: CreditBalance;
  subscriptionMetadata: SubscriptionMetadata;
  // Trigger on cancel/resubscribe
  onStatusChange: (isPremium: boolean, canceled: boolean, subscriptionTargetKey: string) => void;
  onNotificationDismiss: (subscriptionTargetKey?: string) => void;
  onBack?: () => void;
  onEditPaymentMethodClick: () => void;
  // Roblox Plus product info, used to render the dynamic benefit list when
  // viewing a Blackbird subscription. Null while loading or unavailable.
  blackbirdProductInfo?: {
    featureConfig: RobloxSubscriptionProductFeatureConfig;
    periodType: ApiPeriodType;
  } | null;
  isFaeFreeTrial?: boolean;
};

// Used only for TS type checking purposes
const subIsPremium = (
  sub: UserSubscription | PremiumSubscription,
  isPremium: boolean
): sub is PremiumSubscription => isPremium;

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscription,
  isPremium,
  creditBalance,
  subscriptionMetadata,
  onStatusChange,
  onNotificationDismiss,
  onBack,
  onEditPaymentMethodClick,
  blackbirdProductInfo,
  isFaeFreeTrial = false
}) => {
  const { translate } = useTranslation();
  const [notificationType, setNotificationType] = useState<SubscriptionNotification | null>(null);
  const [isCardAboutToExpire, setIsCardAboutToExpire] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  const isBlackbird =
    !subIsPremium(subscription, isPremium) &&
    subscription.productType === ProductType.Blackbird;

  const navigateToExperience = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (subIsPremium(subscription, isPremium) || !subscription.providerId) return;
      getExperiencePlaceId(subscription.providerId)
        .then(placeId => {
          if (placeId) {
            window.location.href = `/games/${placeId}`;
          }
        })
        .catch(() => undefined);
    },
    [subscription, isPremium]
  );

  useEffect(() => {
    setNotificationType(
      GetLowBalanceNotificationType(
        subscription.showLowBalanceNotification ?? false,
        subscription.renewal,
        subscription.expiration
      )
    );
  }, [subscription]);

  useEffect(() => {
    if (!subscription.cardInfo) {
      return;
    }
    const expirationDate = new Date(
      subscription.cardInfo.expYear,
      subscription.cardInfo.expMonth - 1
    );
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
    setIsCardAboutToExpire(expirationDate < nextMonth);
  }, [subscription]);

  const renderIcon = () => {
    if (subIsPremium(subscription, isPremium)) {
      return <span className='premium-icon' />;
    }
    if (subscription.productType === ProductType.Blackbird) {
      return <Icon className='!size-900' name='icon-regular-roblox-plus' />;
    }
    if (subscription.productType === ProductType.CurrencySubscription) {
      return <span className='premium-icon' />;
    }
    return (
      <Thumbnail2d
        targetId={subscription.iconImageAssetId ?? 0}
        type={ThumbnailTypes.assetThumbnail}
        imgClassName='detail-icon'
        containerClass='thumbnail-detail-container'
        altName={subscription.name}
      />
    );
  };

  const renderDescription = () => {
    if (subIsPremium(subscription, isPremium)) {
      return (
        <div className='detail-description'>
          <p>{translate('Description.Subscriptions.Premium')}</p>
          <span className='premium-benefit-container'>
            <span className='icon-menu-games-on' />
            <p>{translate('Description.Subscriptions.PremiumBenefits')}</p>
          </span>
          <span className='premium-benefit-container'>
            <span className='icon-robux-28x28' />
            <p>{translate('Description.Subscriptions.MoreRobux')}</p>
          </span>
          <span className='premium-benefit-container'>
            <span className='icon-menu-trade' />
            <p>{translate('Description.Subscriptions.Trade')}</p>
          </span>

          {subscription.robuxStipendAmount >= minPremiumMarketplacSell && (
            <span className='premium-benefit-container'>
              <span className='icon-menu-creations' />
              <p>{translate('Description.Subscriptions.MarketplaceSell')}</p>
            </span>
          )}
        </div>
      );
    }
    

    switch (subscription.productType) {
      case ProductType.Blackbird:
        // Render the canonical Plus benefit list from subscriptions-common when
        // we have the product info; the inner TranslationProvider is required
        // because BenefitList reads from @rbx/core-scripts/react's translation
        // context, which is separate from the outer react-utilities provider.
        if (blackbirdProductInfo) {
          return (
            <div className='detail-description content-default'>
              <TranslationProvider config={['Feature.RobloxSubscription']}>
                <BenefitList
                  featureConfig={blackbirdProductInfo.featureConfig}
                  periodType={blackbirdProductInfo.periodType}
                  currencySubscriptionBenefit={subscription.currencySubscriptionBenefit}
                />
              </TranslationProvider>
            </div>
          );
        }
        return (
          <p className='detail-description'>{translate('Description.Subscriptions.Blackbird')}</p>
        );
      case ProductType.CurrencySubscription:
        return (
          <p className='detail-description'>
              {translate('Description.Subscriptions.CurrencySubscription')}
            </p>
        );
      default:
        return (
          <p className='detail-description'>{subscription.description}</p>
        );
    }
  };

  const subscriptionPeriod = subIsPremium(subscription, isPremium)
    ? premiumPeriod(subscription)
    : subscription.subscriptionPeriod || PeriodType.MONTH;

  const resolveSubscriptionName = (): string => {
    if (subIsPremium(subscription, isPremium)) return premiumName(subscription);
    switch (subscription.productType) {
      case ProductType.Blackbird:
        if (
          subscription.currencySubscriptionBenefit &&
          subscription.currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod > 0
        ) {
          return `Plus ${subscription.currencySubscriptionBenefit.entitledAmountMicrosPerGrantingPeriod / ONE_ROBUX_IN_MICROS}`;
        }
        return translate('Label.Blackbird');
      case ProductType.CurrencySubscription:
        return translate('Label.CurrencySubscription');
      default:
        return subscription.name;
    }
  };
  const subscriptionName = resolveSubscriptionName();

  // Tell users to go to the app store cancellation help page if purchased on iOS or Android
  const showAppCancelMessage =
    subIsPremium(subscription, isPremium) &&
    (subscription.purchasePlatform === PremiumPurchasePlatform.IOS_APP ||
      subscription.purchasePlatform === PremiumPurchasePlatform.ANDROID_APP);

  return (
    <div>
      {notificationType && subscription.showLowBalanceNotification && (
        <NotificationBanner
          type={notificationType}
          onNotificationDismiss={() =>
            onNotificationDismiss(
              subIsPremium(subscription, isPremium)
                ? `PRM-${subscription.premiumFeatureId}`
                : subscription.subscriptionTargetKey
            )
          }
        />
      )}
      {!subscription.showLowBalanceNotification &&
        subscription.cardInfo &&
        subscription.paymentProvider === PaymentProvider.STRIPE &&
        isCardAboutToExpire && (
          <Banner
            title={translate('Heading.PaymentMethodAboutToExpire')}
            body={
              <span className='font-caption-header banner-body'>
                  {translate('Description.UpdatePaymentMethodToAvoidCancellation')}
                </span>
            }
            bannerType={BannerType.WARNING}
            showDismiss={false}
            onDismiss={() => setIsCardAboutToExpire(false)}
          />
        )}
      <div className='subscription-details-container'>
        <button type='button' onClick={onBack} className='details-back-button btn-generic-back-sm'>
          <span className='icon-back' />
          {translate('Action.Back')}
        </button>
        {isBlackbird && (
          <div className={isFaeFreeTrial ? 'margin-bottom-medium' : 'margin-bottom-large'} style={{ gridColumn: '1 / -1' }}>
            <RobloxPlusGiftItemUpsellBanner
              body={translate('Description.Subscriptions.BannerBody')}
              imageAssetId={PLUS_UPSELL_BANNER_ASSET_ID}
              title={translate('Description.Subscriptions.BannerTitle')}
            />
          </div>
        )}
        {isBlackbird && isFaeFreeTrial && (
          <div className='margin-bottom-large' style={{ gridColumn: '1 / -1' }}>
            <RobloxPlusFreeTrialBanner
              title={translate('Header.FreeTrialBannerTitle')}
              body={translate('Subtext.FreeTrialBanner', {
                date: (subscription as UserSubscription).expiration.toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              })}
            />
          </div>
        )}
        <div className='details-info'>
          <div
            className={classNames('detail-card-icon-container', {
              'detail-card-icon-container--blackbird': isBlackbird
            })}>
            {renderIcon()}
          </div>
          <h2 className='detail-subscription-name'>{subscriptionName}</h2>
          {!subIsPremium(subscription, isPremium) && subscription.providerId ? (
            <Link
              href={`/games/${subscription.providerId}`}
              onClick={navigateToExperience}
              underline='hover'
              className='text-description'>
              {subscription.subscriptionProviderName}
            </Link>
          ) : (
            <span className='detail-subscription-proider text-description'>
              {subscription.subscriptionProviderName}
            </span>
          )}
          {!subIsPremium(subscription, isPremium) &&
          subscription.priceInRobux != null &&
          subscription.priceInRobux > 0 ? (
            <PriceDisplayInRobux priceInRobux={subscription.priceInRobux} />
          ) : (
            subscription.price && subscription.purchasePlatform !== PurchasePlatform.INTERNAL && (
              <PriceDisplay
                price={subscription.price}
                period={subscriptionPeriod}
                periodCount={subIsPremium(subscription, isPremium) ? undefined : subscription.periodCount}
                className='subscription'
              />
            )
          )}
          <div className="subscription-billing-cycle-info">
            <CycleEndDate expiration={subscription.expiration} renewal={subscription.renewal} />
            {hasFreeTrialOffer((subscription as UserSubscription).subscriptionOffers) && (
              <Chip
                as='button'
                isChecked={false}
                size='Small'
                text={translate('Label.FreeTrial')}
                variant='Standard'
              />
            )}
          </div>          
          {!subIsPremium(subscription, isPremium) &&
            !(subscription.priceInRobux != null && subscription.priceInRobux > 0) &&
            subscription.purchasePlatform !== PurchasePlatform.INTERNAL && (
              <PaymentMethod
                purchasePlatform={subscription.purchasePlatform}
                paymentProvider={subscription.paymentProvider}
                cardInfo={subscription.cardInfo}
                creditBalance={creditBalance}
                isPaymentProfileEditingAllowed={
                  subscriptionMetadata.isSubscriptionPaymentProfileUpdatingEnabled
                }
                onEditClick={onEditPaymentMethodClick}
              />
            )}
          {subIsPremium(subscription, isPremium) && subscription.paymentProfileId && (
            <PaymentMethod
              purchasePlatform={subscription.purchasePlatform}
              paymentProvider={subscription.paymentProvider}
              cardInfo={subscription.cardInfo}
              creditBalance={creditBalance}
              isPaymentProfileEditingAllowed={
                subscriptionMetadata.isSubscriptionPaymentProfileUpdatingEnabled
              }
              onEditClick={onEditPaymentMethodClick}
            />
          )}
          {showAppCancelMessage && (
            <p
              // The data in setInnerHtml has no user input; uses a constant URL.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate('Message.Subscriptions.PremiumAppStoreCancel', {
                  aTagStartWithHref: '<a href=',
                  cancelHelpPagesLink: `"${APP_STORE_CANCEL_HELP_URL}"`,
                  hrefEnd: ' class="text-link" target="_blank">',
                  aTagEnd: '</a>'
                })
              }}
            />
          )}
        </div>
        {isExpiring(subscription.renewal, subscription.expiration) ? (
          <ResubscribeSubscription
            subscription={subscription}
            onResubscribe={() =>
              onStatusChange
                ? onStatusChange(isPremium, false, subscription.subscriptionTargetKey)
                : undefined
            }
            isPremium={isPremium}
            assumeEligible={justCancelled}
            className='resubscribe btn-cta-md'
          />
        ) : (
          <CancelSubscription
            subscription={subscription}
            onCancel={() => {
              setJustCancelled(true);
              if (onStatusChange) {
                onStatusChange(isPremium, true, subscription.subscriptionTargetKey);
              }
            }}
            isPremium={isPremium}
            className='cancel-renewal btn-control-md'
          />
        )}
        <div className='description-container'>
          <h3 className='detail-description-header'>
            {translate(
              isBlackbird
                ? 'Label.Subscriptions.SubscriptionBenefits'
                : 'Label.Subscriptions.SubscriptionDescription'
            )}
          </h3>
          {renderDescription()}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;

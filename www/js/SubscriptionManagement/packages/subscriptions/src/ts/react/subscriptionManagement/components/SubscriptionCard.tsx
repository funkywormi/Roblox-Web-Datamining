import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { ProductType } from '@rbx/client-subscriptions-api/v1';
import { Chip, Icon } from '@rbx/foundation-ui';
import type { SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';
import { PaymentProvider, PeriodType, PurchasePlatform } from '../../../core/types/subscriptionEnums';
import { Price } from '../../../core/types/price';
import PriceDisplay from './PriceDisplay';
import PriceDisplayInRobux from './PriceDisplayInRobux';
import CycleEndDate from './CycleEndDate';
import '../../../../css/subscriptionManagement/subscriptionCard.scss';
import {
  GetLowBalanceNotificationType,
  SubscriptionNotification,
  SubscriptionNotificationIconClass
} from '../../../core/types/notifications';
import { hasFreeTrialOffer } from '../utils/subscriptionUtils';

type SubscriptionCardProps = {
  subscriptionName: string;
  subscriptionProviderName: string;
  subscriptionPaymentProvider?: string;
  iconImageAssetId?: number; // Either an image ID or not specified for premium
  price: Price | null; // Can be null for certain types of premium
  priceInRobux?: number | null;
  subscriptionPeriod: PeriodType;
  periodCount?: number;
  expiration: Date;
  renewal: Date;
  isPremium?: boolean;
  productType?: string; // Product type for Blackbird/CurrencySubscription icon handling
  purchasePlatform?: PurchasePlatform;
  showLowBalanceNotification?: boolean;
  subscriptionOffers?: SubscriptionOffer[];
  onClick?: () => void;
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscriptionName,
  subscriptionProviderName,
  subscriptionPaymentProvider,
  iconImageAssetId = 0,
  price,
  priceInRobux,
  subscriptionPeriod,
  periodCount,
  expiration,
  renewal,
  isPremium = false,
  productType,
  purchasePlatform,
  showLowBalanceNotification = false,
  subscriptionOffers,
  onClick
}) => {
  const { translate } = useTranslation();
  const [notificationType, setShowNotificationType] = useState<SubscriptionNotification | null>(
    null
  );
  const [showLowBalanceIcon, setShowLowBalanceIcon] = useState<boolean>(false);
  const [lowBalanceIconClass, setLowBalanceIconClass] = useState<string>('');

  useEffect(() => {
    setShowLowBalanceIcon(
      notificationType !== null && subscriptionPaymentProvider === PaymentProvider.CREDITBALANCE
    );

    if (notificationType && subscriptionPaymentProvider === PaymentProvider.CREDITBALANCE) {
      setLowBalanceIconClass(SubscriptionNotificationIconClass[notificationType]);
    }
  }, [notificationType, subscriptionPaymentProvider]);

  useEffect(() => {
    setShowNotificationType(
      GetLowBalanceNotificationType(showLowBalanceNotification, renewal, expiration)
    );
  }, [showLowBalanceNotification, expiration, renewal]);

  const renderIcon = () => {
    if (isPremium) {
      return <span className='premium-icon' />;
    }
    if (productType === ProductType.Blackbird) {
      return <Icon className='blackbird-icon' name='icon-regular-roblox-plus' size='Large' />;
    }
    if (productType === ProductType.CurrencySubscription) {
      return <span className='premium-icon' />;
    }
    return (
      <Thumbnail2d
        targetId={iconImageAssetId}
        type={ThumbnailTypes.assetThumbnail}
        imgClassName='subcard-icon'
        containerClass='thumbnail-card-container'
        altName={subscriptionName}
      />
    );
  };

  const showPrice =
    (priceInRobux != null && priceInRobux > 0) ||
    (price != null && purchasePlatform !== PurchasePlatform.INTERNAL);

  return (
    <button className='subcard-container' onClick={onClick} type='button'>
      <div className='subcard-icon-container'>{renderIcon()}</div>
      <div className='subcard-info'>
        <div className='subcard-info-primary'>
          <span className='subscription-name font-body'>{subscriptionName}</span>
          <span className='subscription-provider text-description'>{subscriptionProviderName}</span>
        </div>
        <div className='subcard-info-secondary'>
          {priceInRobux != null && priceInRobux > 0 ? (
            <PriceDisplayInRobux priceInRobux={priceInRobux} />
          ) : price && purchasePlatform !== PurchasePlatform.INTERNAL ? (
            <PriceDisplay price={price} period={subscriptionPeriod} periodCount={periodCount} className='subscription' />
          ) : (
            <CycleEndDate expiration={expiration} renewal={renewal} />
          )}
          {showPrice && (
            <div className='subscription-billing-cycle-info'>
              <CycleEndDate expiration={expiration} renewal={renewal} />
              {hasFreeTrialOffer(subscriptionOffers) && (
                <Chip
                  as='button'
                  isChecked={false}
                  size='Small'
                  text={translate('Label.FreeTrial')}
                  variant='Standard'
                />
              )}
            </div>
          )}
          {!showPrice && hasFreeTrialOffer(subscriptionOffers) && (
            <Chip
              as='button'
              isChecked={false}
              size='Small'
              text={translate('Label.FreeTrial')}
              variant='Standard'
            />
          )}
        </div>
      </div>
      <div className='warning-icon'>
        {showLowBalanceIcon && <span className={lowBalanceIconClass} />}
      </div>
      <span className='icon-right more-details' />
    </button>
  );
};

export default SubscriptionCard;

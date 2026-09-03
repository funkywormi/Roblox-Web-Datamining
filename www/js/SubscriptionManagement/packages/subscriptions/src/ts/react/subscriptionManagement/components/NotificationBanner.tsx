/* eslint-disable react/jsx-no-literals */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-utilities';
import { SubscriptionNotification } from '../../../core/types/notifications';
import {
  GIFTCARD_REDEEM_URL,
  GIFTCARD_PURCHASE_URL
} from '../../../core/constants/websiteConstants';
import Banner, { BannerType } from '../../shared/components/Banner';

type NotificationBannerProps = {
  type: SubscriptionNotification;
  onNotificationDismiss: () => void;
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({ type, onNotificationDismiss }) => {
  const { translate } = useTranslation();
  const [bannerType, setBannerType] = useState(BannerType.WARNING);
  const [bannerTitle, setBannerTitle] = useState('');

  useEffect(() => {
    switch (type) {
      case SubscriptionNotification.LOW_BALANCE_WARNING:
        setBannerType(BannerType.WARNING);
        setBannerTitle(translate('Banner.Header.LowBalanceWarning'));
        break;
      case SubscriptionNotification.LOW_BALANCE_GRACE_PERIOD:
        setBannerType(BannerType.ERROR);
        setBannerTitle(translate('Banner.Header.InsufficientBalance'));
        break;
      default:
        break;
    }
  }, [translate, type]);

  return (
    <Banner
      title={bannerTitle}
      body={
        <span
          className='font-caption-header banner-body'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: translate('Banner.Message.LowBalance', {
              redeemUrlStartTag: `<a href=${GIFTCARD_REDEEM_URL} class="text-link" target="_blank">`,
              redeemUrlEndTag: '</a>',
              giftCardUrlStartTag: `<a href=${GIFTCARD_PURCHASE_URL} class="text-link" target="_blank">`,
              giftCardUrlEndTag: '</a>'
            })
          }}
        />
      }
      bannerType={bannerType}
      showDismiss
      onDismiss={onNotificationDismiss}
    />
  );
};

export default NotificationBanner;

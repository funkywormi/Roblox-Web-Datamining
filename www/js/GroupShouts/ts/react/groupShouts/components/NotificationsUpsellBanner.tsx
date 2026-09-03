import React, { useEffect } from 'react';
import { Button } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Group } from '../../shared/types';
import { logGroupPageExposureEvent } from '../../shared/utils/logging';
import { groupAnnouncementsConfig } from '../translation.config';
import CloseButton from './CloseButton';

export type NotificationUpsellBannerProps = {
  group: Group;
  eventContext: string;
  onNotifyClicked: () => void;
  onDismiss: () => void;
} & WithTranslationsProps;

const NotificationUpsellBanner = ({
  group,
  eventContext,
  onNotifyClicked,
  onDismiss,
  translate
}: NotificationUpsellBannerProps): JSX.Element => {
  useEffect(() => {
    logGroupPageExposureEvent({
      groupId: group.id,
      exposureType: 'notificationsUpsellBannerSeen',
      context: eventContext
    });
  }, [group.id, eventContext]);

  return (
    <div className='group-notifications-upsell-banner'>
      <span className='group-notifications-upsell-banner-icon icon-common-notification-bell' />
      <div className='group-notifications-upsell-banner-content'>
        <h3 className='group-notifications-upsell-banner-title text-label-large'>
          {translate('Heading.NotificationsUpsell')}
        </h3>
        <div className='group-notifications-upsell-banner-description text-body-medium'>
          {translate('Description.NotificationsUpsell', { groupName: group.name })}
        </div>
      </div>
      <div className='group-notifications-upsell-banner-actions'>
        <Button
          variant={Button.variants.control}
          size={Button.sizes.small}
          width={Button.widths.default}
          className='group-notifications-upsell-banner-notify'
          onClick={onNotifyClicked}>
          {translate('Action.NotifyMe')}
        </Button>
        <CloseButton className='group-notifications-upsell-banner-close' onClick={onDismiss} />
      </div>
    </div>
  );
};

export default withTranslations(NotificationUpsellBanner, groupAnnouncementsConfig);

import React, { useEffect, useState } from 'react';
import { DeviceMeta, Hybrid } from 'Roblox';
import { Button } from 'react-style-guide';
import { WithTranslationsProps } from 'react-utilities';
import {
  isPushEnabled,
  sendNotificationPreferencesEvent
} from '../services/NotificationPreferencesService';
import events from '../constants/notificationPreferencesEvents';

export type EnableNotificationPromptProps = {
  translate: WithTranslationsProps['translate'];
  displayGeneralErrorMessage: () => void;
};

const EnableNotificationsPrompt = ({
  translate,
  displayGeneralErrorMessage
}: EnableNotificationPromptProps): JSX.Element | null => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    isPushEnabled()
      .then(enabled => {
        setNotificationsEnabled(enabled);
        if (!enabled) {
          sendNotificationPreferencesEvent(events.enableNotificationsPromptShown);
        }
      })
      .catch(displayGeneralErrorMessage);
  }, []);

  const DeviceInfo = DeviceMeta();
  if (notificationsEnabled || !(DeviceInfo.isAndroidDevice || DeviceInfo.isIosDevice)) {
    return null;
  }

  const enableNotifications = () => {
    if (Hybrid?.Push?.pushPermissionTrigger) {
      sendNotificationPreferencesEvent(events.enableNotificationsPromptClicked);
      Hybrid.Push.pushPermissionTrigger('enableAuthorizationForUser');
      setNotificationsEnabled(true);
    }
  };

  return (
    <div className='enable-push-notifications-prompt'>
      <p className='text-emphasis'>
        {translate('Label.NotificationsDisabled', {
          platform: translate(DeviceInfo.isAndroidDevice ? 'Label.Android' : 'Label.IOS')
        })}
      </p>
      <p className='small text-emphasis text-format'>
        {translate('Label.NotificationDisabledWarning')}
      </p>

      {Hybrid?.Push?.pushPermissionTrigger && (
        <Button
          variant={Button.variants.growth}
          className='access-settings-button'
          onClick={enableNotifications}>
          {translate('Action.EnableNotifications')}
        </Button>
      )}
    </div>
  );
};

export default EnableNotificationsPrompt;

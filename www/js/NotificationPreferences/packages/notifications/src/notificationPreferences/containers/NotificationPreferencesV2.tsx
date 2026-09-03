import React, { useState, useEffect, useCallback } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createSystemFeedback } from 'react-style-guide';
import {
  updateUserPreferences,
  sendNotificationPreferencesEvent,
  getGroupedUserPreferences,
  getExperiencePreferences,
  getGroupShoutPreferences,
  getPushNotificationUpsellEnabled
} from '../services/NotificationPreferencesService';
import events from '../constants/notificationPreferencesEvents';
import notificationPreferencesTranslationConfig from '../translation.config';
import {
  GroupSettings,
  NotificationChannel,
  PreferenceStatus
} from '../types/NotificationPreferencesTypes';
import {
  TUpdateUserSettingValueRequest,
  UpdateUserSettingsCallback
} from '../types/UserSettingsTypes';
import GroupWrapper from '../components/GroupWrapper';
import EnableNotificationsPrompt from '../components/EnableNotificationsPrompt';
import ExperiencePreferencesProvider from '../context/GroupExperiencePreferences';
import GroupShoutPreferencesProvider from '../context/GroupShoutPreferences';
import { updateUserSettings, updateUserSettingsV2 } from '../services/UserSettingsService';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

const NotificationPreferences = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [userPreferences, setUserPreferences] = useState<GroupSettings[]>([]);
  const [experiencePreferences, setExperiencePreferences] = useState<GroupSettings>({
    groupName: '',
    localizedGroupName: ''
  } as GroupSettings);
  const [groupShoutPreferences, setGroupShoutPreferences] = useState<GroupSettings>({
    groupName: '',
    localizedGroupName: ''
  } as GroupSettings);

  const [isPushUpsellEnabled, setPushUpsellEnabled] = useState<boolean>(false);

  const displayGeneralErrorMessage = useCallback(() => {
    systemFeedbackService.warning(translate('Message.ErrorGeneral'));
  }, [translate]);

  const getUserPreferences = useCallback(async () => {
    const result = await getGroupedUserPreferences();

    if (result) {
      sendNotificationPreferencesEvent(events.pageLoaded);
      setUserPreferences(result.notificationPreferences);
    } else {
      displayGeneralErrorMessage();
    }
  }, [displayGeneralErrorMessage]);

  const isChannelAggregateSetting = useCallback(
    (userSettingName: string | null): boolean => {
      if (!userSettingName) {
        return false;
      }

      // Check userPreferences
      return userPreferences.some(
        group => group.notificationChannelAggregateSettings?.userSettingsName === userSettingName
      );
    },
    [userPreferences]
  );

  const updateNotificationPreferenceStatus = async (
    notificationType: string,
    notificationChannel: NotificationChannel,
    preferenceStatus: PreferenceStatus
  ): Promise<void> => {
    const result = await updateUserPreferences({
      updatedPreferences: [
        {
          notificationType,
          notificationChannel,
          preferenceStatus
        }
      ]
    });

    if (result !== 200) {
      displayGeneralErrorMessage();
    }
  };

  const updateUserSettingsPreference: UpdateUserSettingsCallback = async (
    setting,
    userSettingName,
    value,
    auditHeader
  ) => {
    if (setting) {
      const updateUserSettingsRequest: TUpdateUserSettingValueRequest = {
        [setting]: value
      };

      const headers: Record<string, string> = {};
      if (auditHeader) {
        headers['rbx-audit-data'] = auditHeader;
      }

      try {
        await updateUserSettings(updateUserSettingsRequest, headers);
      } catch (error) {
        displayGeneralErrorMessage();
      }
    }
  };

  const updateUserSettingsPreferenceV2: UpdateUserSettingsCallback = async (
    setting,
    userSettingName,
    value,
    auditHeader
  ) => {
    if (userSettingName) {
      const updateUserSettingsRequest: TUpdateUserSettingValueRequest = {
        [userSettingName]: value
      };

      const headers: Record<string, string> = {};
      if (auditHeader) {
        headers['rbx-audit-data'] = auditHeader;
      }

      try {
        await updateUserSettingsV2(updateUserSettingsRequest, headers);
        if (isChannelAggregateSetting(userSettingName)) {
          // Only refetch grouped preferences if channel aggregate setting was updated
          await getUserPreferences();
        }
      } catch (error) {
        displayGeneralErrorMessage();
      }
    }
  };

  useEffect(() => {
    async function getUserExperiencePreferences() {
      const result = await getExperiencePreferences();
      if (result) {
        setExperiencePreferences(result.experiencePreferences);
      } else {
        displayGeneralErrorMessage();
      }
    }

    async function getUserGroupShoutPreferences() {
      const result = await getGroupShoutPreferences();
      if (result) {
        setGroupShoutPreferences(result.groupShoutPreferences);
      } else {
        displayGeneralErrorMessage();
      }
    }

    async function getPushUpsellEnabled() {
      const result = await getPushNotificationUpsellEnabled();
      setPushUpsellEnabled(result);
    }

    // eslint-disable-next-line no-void
    void getUserPreferences();
    // eslint-disable-next-line no-void
    void getUserExperiencePreferences();
    // eslint-disable-next-line no-void
    void getUserGroupShoutPreferences();
    // eslint-disable-next-line no-void
    void getPushUpsellEnabled();
  }, [displayGeneralErrorMessage, getUserPreferences]);

  return (
    <div>
      <SystemFeedback />
      <div className='title-wrapper'>
        <h2>{translate('Heading.Notifications')}</h2>
        <p>{translate('Description.CustomizeNotificationsChannels')}</p>
        {isPushUpsellEnabled && (
          <EnableNotificationsPrompt
            translate={translate}
            displayGeneralErrorMessage={displayGeneralErrorMessage}
          />
        )}
      </div>
      {userPreferences.map((groupData, index) => [
        index !== 0 && !groupData.restrictedAccess && <div className='group-divider' />,
        !groupData.restrictedAccess && (
          <GroupWrapper
            key={groupData.localizedGroupName}
            groupSettings={groupData}
            translate={translate}
            updatePreferenceStatus={updateNotificationPreferenceStatus}
            updateUserSettings={updateUserSettingsPreference}
            updateUserSettingsV2={updateUserSettingsPreferenceV2}
          />
        )
      ])}
      {!experiencePreferences.restrictedAccess && (
        <ExperiencePreferencesProvider>
          {userPreferences.length > 0 && <div className='group-divider' />}
          <GroupWrapper
            key={experiencePreferences.localizedGroupName}
            groupSettings={experiencePreferences}
            translate={translate}
            updatePreferenceStatus={updateNotificationPreferenceStatus}
            updateUserSettings={updateUserSettingsPreference}
            updateUserSettingsV2={updateUserSettingsPreferenceV2}
          />
        </ExperiencePreferencesProvider>
      )}
      {!groupShoutPreferences.restrictedAccess && (
        <GroupShoutPreferencesProvider>
          <div className='group-divider' />
          <GroupWrapper
            key={groupShoutPreferences.localizedGroupName}
            groupSettings={groupShoutPreferences}
            translate={translate}
            updatePreferenceStatus={updateNotificationPreferenceStatus}
            updateUserSettings={updateUserSettingsPreference}
            updateUserSettingsV2={updateUserSettingsPreferenceV2}
          />
        </GroupShoutPreferencesProvider>
      )}
    </div>
  );
};

export default withTranslations(NotificationPreferences, notificationPreferencesTranslationConfig);

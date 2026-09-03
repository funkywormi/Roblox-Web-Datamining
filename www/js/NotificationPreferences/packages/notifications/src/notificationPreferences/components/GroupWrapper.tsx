import React, { useState, useEffect } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { Icon } from '@rbx/foundation-ui';
import {
  GroupSettings,
  ExperiencePreferenceData,
  NotificationChannel,
  PreferenceStatus,
  UpdatePreferenceStatusCallback
} from '../types/NotificationPreferencesTypes';
import GroupLockedPill from './GroupLockedPill';
import PreferenceSelector from './PreferenceSelector';
import ExperiencePreferencesList from './ExperiencePreferencesList';
import GroupShoutPreferencesList from './GroupShoutPreferencesList';
import { sendNotificationPreferencesEvent } from '../services/NotificationPreferencesService';
import events from '../constants/notificationPreferencesEvents';
import { useGroupExperiencePreferencesContext } from '../context/GroupExperiencePreferences';
import { useGroupShoutPreferencesContext } from '../context/GroupShoutPreferences';
import NotificationConstants, {
  NotificationGroupTypes
} from '../constants/notificationPreferencesConstants';
import DoNotDisturbWrapper from './DoNotDisturbWrapper';
import {
  EnabledStatusValue,
  UpdateUserSettingsCallback,
  UserSetting,
  TDoNotDisturbTimeWindow,
  TChannelSettingsValue
} from '../types/UserSettingsTypes';

export type GroupWrapperProps = {
  groupSettings: GroupSettings;
  experienceDataList?: Array<ExperiencePreferenceData>;
  translate: WithTranslationsProps['translate'];
  updatePreferenceStatus: UpdatePreferenceStatusCallback;
  updateUserSettings: UpdateUserSettingsCallback;
  updateUserSettingsV2: UpdateUserSettingsCallback;
};

const GroupWrapper = ({
  groupSettings,
  translate,
  updatePreferenceStatus,
  updateUserSettings,
  updateUserSettingsV2
}: GroupWrapperProps): JSX.Element => {
  const [groupPreferences, setGroupPreferences] = useState(
    groupSettings.notificationTypePreferences
  );

  const [groupDndPreferences, setGroupDndPreferences] = useState(
    groupSettings.notificationDndPreferences
  );
  const [groupChannelAggregatePreferences, setGroupChannelAggregatePreferences] = useState(
    groupSettings.notificationChannelAggregateSettings
  );

  const { initGroupExperiencePreferencesList } = useGroupExperiencePreferencesContext();
  const { initGroupShoutPreferencesList } = useGroupShoutPreferencesContext();
  const [groupType, setGroupType] = useState<NotificationGroupTypes>(
    NotificationGroupTypes.default
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (groupSettings.notificationsEnabledExperiences) {
      setGroupType(NotificationGroupTypes.experience);
    } else if (groupSettings.notificationsEnabledGroups) {
      setGroupType(NotificationGroupTypes.groupShout);
    }
  }, []);

  useEffect(() => {
    if (groupType === NotificationGroupTypes.experience) {
      initGroupExperiencePreferencesList(groupSettings);
    } else if (groupType === NotificationGroupTypes.groupShout) {
      initGroupShoutPreferencesList(groupSettings);
    }
  }, [groupType]);

  // Update local state when groupSettings prop changes (e.g., after refetch)
  // Only update if values have actually changed to preserve optimistic updates and prevent UI delay
  useEffect(() => {
    if (groupSettings.notificationTypePreferences !== groupPreferences) {
      setGroupPreferences(groupSettings.notificationTypePreferences);
    }
    if (groupSettings.notificationDndPreferences !== groupDndPreferences) {
      setGroupDndPreferences(groupSettings.notificationDndPreferences);
    }
    // For channel aggregate preferences, only update if the enabled state actually changed
    // This preserves the optimistic update and prevents UI delay/flicker
    const newChannelAggregate = groupSettings.notificationChannelAggregateSettings;
    const currentEnabledState = groupChannelAggregatePreferences?.isChannelAggregateSettingEnabled;
    const newEnabledState = newChannelAggregate?.isChannelAggregateSettingEnabled;

    // Only update if the enabled state is different (preserves optimistic update when values match)
    // or if we're initializing (one is null and the other isn't)
    if (newChannelAggregate !== groupChannelAggregatePreferences) {
      if (
        newEnabledState !== currentEnabledState ||
        newChannelAggregate === null ||
        groupChannelAggregatePreferences === null
      ) {
        setGroupChannelAggregatePreferences(newChannelAggregate);
      }
    }
  }, [groupSettings, groupPreferences, groupDndPreferences, groupChannelAggregatePreferences]);

  const preserveChangedPreference = (
    notificationType: string,
    notificationChannel: NotificationChannel,
    preferenceStatus: PreferenceStatus
  ) => {
    if (!groupPreferences) {
      return;
    }
    // Preserve changed settings when closing/reopening the group wrapper
    const notificationSettingToUpdate = groupPreferences.find(
      currentNotificationSetting =>
        currentNotificationSetting.notificationTypeName === notificationType
    );
    const channelSettingToUpdate = notificationSettingToUpdate?.notificationChannelPreferences.find(
      currentChannelSetting => currentChannelSetting.notificationChannel === notificationChannel
    );

    if (channelSettingToUpdate) {
      channelSettingToUpdate.preferenceStatus = preferenceStatus;
      setGroupPreferences([...groupPreferences]);
    }
  };

  const preserveDndPreferences = (selection?: boolean, startTime?: number, endTime?: number) => {
    if (!groupDndPreferences) {
      return;
    }

    if (selection !== undefined) {
      groupDndPreferences.isNotificationDndSettingEnabled = selection;
    }

    if (startTime !== undefined) {
      groupDndPreferences.notificationDndStartTimeMinutes = startTime;
    }

    if (endTime !== undefined) {
      groupDndPreferences.notificationDndEndTimeMinutes = endTime;
    }

    setGroupDndPreferences({ ...groupDndPreferences });
  };

  const updateUserSettingsCallback: UpdateUserSettingsCallback = (
    userSetting,
    userSettingName,
    value,
    auditHeader
  ) => {
    switch (userSetting) {
      case UserSetting.doNotDisturb:
        preserveDndPreferences(value === EnabledStatusValue.Enabled);
        break;
      case UserSetting.doNotDisturbTimeWindow:
        preserveDndPreferences(
          undefined,
          (value as TDoNotDisturbTimeWindow).startTimeMinutes,
          (value as TDoNotDisturbTimeWindow).endTimeMinutes
        );
        break;
      default:
        break;
    }

    // if UserSettingName is provided, then we should use the v2 endpoints
    if (userSettingName) {
      updateUserSettingsV2(null, userSettingName, value, auditHeader);
    } else {
      updateUserSettings(userSetting, null, value, auditHeader);
    }
  };

  const updatePreferenceStatusCallback: UpdatePreferenceStatusCallback = (
    notificationType,
    notificationChannel,
    preferenceStatus
  ) => {
    // Preserve changed settings when closing/reopening the group wrapper
    preserveChangedPreference(notificationType, notificationChannel, preferenceStatus);

    let preferenceChangeEvent;
    switch (preferenceStatus) {
      case PreferenceStatus.All:
        preferenceChangeEvent = events.sendAll;
        break;
      case PreferenceStatus.None:
        preferenceChangeEvent = events.sendNone;
        break;
      default:
    }

    if (preferenceChangeEvent) {
      sendNotificationPreferencesEvent(preferenceChangeEvent, notificationType);
    }

    updatePreferenceStatus(notificationType, notificationChannel, preferenceStatus);
  };

  const renderExperiencePreferencesList = () => {
    return (
      <ExperiencePreferencesList
        translate={translate}
        localizedDescription={
          groupSettings.parentalControlsEnabled
            ? groupSettings.parentalControlsMessage
            : groupSettings.localizedGroupDescription
        }
        parentalControlsEnabled={groupSettings.parentalControlsEnabled}
      />
    );
  };
  const renderGroupShoutPreferencesList = () => {
    return (
      <GroupShoutPreferencesList
        translate={translate}
        localizedDescription={
          groupSettings.parentalControlsEnabled
            ? groupSettings.parentalControlsMessage
            : groupSettings.localizedGroupDescription
        }
        parentalControlsEnabled={groupSettings.parentalControlsEnabled}
      />
    );
  };

  const renderDefaultPreferencesList = () => {
    return (
      <React.Fragment>
        <div className='notification-descriptor small text text-content'>
          {groupSettings.parentalControlsEnabled
            ? groupSettings.parentalControlsMessage
            : groupSettings.localizedGroupDescription}
        </div>
        <div className='notification-aggregate-settings'>
          {groupChannelAggregatePreferences != null && (
            <PreferenceSelector
              userSettingName={groupChannelAggregatePreferences.userSettingsName}
              localizedDescription={
                groupChannelAggregatePreferences.localizedChannelAggregateSettingDescription
              }
              localizedTypeName={
                groupChannelAggregatePreferences.localizedChannelAggregateSettingName
              }
              onTogglePreference={(newSelection: boolean, userSetting, userSettingName) => {
                // preserve changed preference for aggregate setting
                setGroupChannelAggregatePreferences({
                  ...groupChannelAggregatePreferences,
                  isChannelAggregateSettingEnabled: newSelection
                });
                const newSettingValue = newSelection
                  ? EnabledStatusValue.Enabled
                  : EnabledStatusValue.Disabled;

                if (userSettingName) {
                  updateUserSettingsV2(null, userSettingName, newSettingValue);
                }
              }}
              selectionDisabled={groupSettings.parentalControlsEnabled}
              selection={groupChannelAggregatePreferences.isChannelAggregateSettingEnabled}
            />
          )}
        </div>
        {groupDndPreferences != null && (
          <DoNotDisturbWrapper
            localizedHeading={groupDndPreferences.notificationDndTitleName}
            localizedDescription={groupDndPreferences.notificationDndDescription}
            selection={groupDndPreferences.isNotificationDndSettingEnabled}
            selectionDisabled={
              groupSettings.parentalControlsEnabled ||
              groupDndPreferences.isDndParentalControlEnabled
            }
            startTimeMinutes={groupDndPreferences.notificationDndStartTimeMinutes}
            endTimeMinutes={groupDndPreferences.notificationDndEndTimeMinutes}
            dndEnabledByParentalControls={groupDndPreferences.isDndParentalControlEnabled}
            translate={translate}
            updateUserSettings={updateUserSettingsCallback}
            userSettingName={groupDndPreferences.userSettingsName ?? null}
          />
        )}
        {groupPreferences?.map((notificationSettings, index) => {
          const onTogglePreference = (
            newSelection: boolean,
            userSetting: UserSetting | null | undefined,
            userSettingName: string | null | undefined
          ) => {
            const notificationChannelPreference =
              notificationSettings.notificationChannelPreferences[0];
            const newPreferenceStatus = newSelection ? PreferenceStatus.All : PreferenceStatus.None;
            const shouldUpdateUserSettings =
              notificationSettings.enableUserSettingsUpdateEndpointCutover ||
              notificationSettings.enableUserSettingsDualWrite ||
              notificationChannelPreference?.enableUserSettingsDualWrite ||
              notificationChannelPreference?.enableUserSettingsUpdateEndpointCutover;
            const shouldUpdateNotificationsPreferences =
              !notificationSettings.enableUserSettingsUpdateEndpointCutover &&
              !notificationChannelPreference?.enableUserSettingsUpdateEndpointCutover;

            if (shouldUpdateUserSettings) {
              preserveChangedPreference(
                notificationSettings.notificationTypeName,
                notificationChannelPreference!.notificationChannel,
                newPreferenceStatus
              );

              const newSettingValue = newSelection
                ? EnabledStatusValue.Enabled
                : EnabledStatusValue.Disabled;

              if (userSettingName) {
                // if userSetting is not null, then this setting is still a v1 setting. we should update
                // using the v2 endpoint, but we still need to pass the v1 value.
                if (userSetting) {
                  updateUserSettingsCallback(
                    null,
                    userSettingName,
                    newSettingValue,
                    notificationSettings.auditDataHeader ?? ''
                  );
                } else {
                  const channelSettingsValue: TChannelSettingsValue = {
                    channelSettings: [
                      {
                        channelName:
                          notificationSettings.notificationChannelPreferences[0]!
                            .notificationChannel,
                        setting: newSettingValue
                      }
                    ]
                  };

                  updateUserSettingsCallback(
                    null,
                    userSettingName,
                    channelSettingsValue,
                    notificationSettings.auditDataHeader ?? ''
                  );
                }
              } else if (userSetting) {
                updateUserSettingsCallback(
                  userSetting,
                  null,
                  newSettingValue,
                  notificationSettings.auditDataHeader ?? ''
                );
              }
            }

            if (shouldUpdateNotificationsPreferences) {
              updatePreferenceStatusCallback(
                notificationSettings.notificationTypeName,
                notificationSettings.notificationChannelPreferences[0]!.notificationChannel,
                newPreferenceStatus
              );
            }
          };

          // Selection should be disabled if parental controls are enabled or if the channel
          // aggregate setting exists and is disabled
          const selectionDisabled =
            groupSettings.parentalControlsEnabled ||
            (groupChannelAggregatePreferences != null &&
              !groupChannelAggregatePreferences.isChannelAggregateSettingEnabled);

          const preferenceStatus = selectionDisabled
            ? false
            : notificationSettings.notificationChannelPreferences[0]!.preferenceStatus ===
                PreferenceStatus.All ||
              notificationSettings.notificationChannelPreferences[0]!.preferenceStatus ===
                PreferenceStatus.Best;

          const channel =
            notificationSettings.notificationChannelPreferences[0]!.notificationChannel;

          if (!channel || channel === NotificationChannel.Invalid) {
            return null;
          }

          return (
            <PreferenceSelector
              userSetting={
                notificationSettings.userSettingsName
                  ? NotificationConstants.UserSettingNameToUserSetting[
                      notificationSettings.userSettingsName
                    ]
                  : undefined
              }
              userSettingName={notificationSettings.userSettingsName}
              localizedDescription={notificationSettings.localizedNotificationTypeDescriptor}
              localizedTypeName={notificationSettings.localizedNotificationTypeName}
              key={notificationSettings.notificationTypeName}
              onTogglePreference={onTogglePreference}
              hasBorder={
                index === 0 &&
                (groupDndPreferences != null || groupChannelAggregatePreferences != null)
              }
              selectionDisabled={selectionDisabled}
              selection={preferenceStatus}
            />
          );
        })}
      </React.Fragment>
    );
  };

  const renderList = () => {
    if (groupType === NotificationGroupTypes.experience) {
      return renderExperiencePreferencesList();
    }
    if (groupType === NotificationGroupTypes.groupShout) {
      return renderGroupShoutPreferencesList();
    }
    return renderDefaultPreferencesList();
  };

  return (
    <div className={isOpen ? 'group-wrapper group-open' : 'group-wrapper'}>
      <button
        type='button'
        className={`toggle-button ${isOpen ? '' : 'toggle-button-closed'}`}
        aria-label='toggle-section'
        onClick={() => {
          sendNotificationPreferencesEvent(events.categoryToggle, groupSettings.groupName);
          setIsOpen(oldState => !oldState);
        }}>
        {groupSettings.groupIcon && (
          <div className='flex shrink-0'>
            <Icon
              size='Large'
              name={
                `${
                  NotificationConstants.GroupToIconMap[groupSettings.groupIcon]
                }` as React.ComponentProps<typeof Icon>['name']
              }
            />
          </div>
        )}
        <span className='group-name heading text-emphasis'>{groupSettings.localizedGroupName}</span>
        {groupSettings.parentalControlsEnabled && <GroupLockedPill />}
        <span className={isOpen ? 'icon-up' : 'icon-down'} />
      </button>
      {isOpen && <div className='selector-list'>{renderList()}</div>}
    </div>
  );
};

export default GroupWrapper;

import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading, Button } from 'react-style-guide';
import notificationPreferencesTranslationConfig from '../translation.config';
import ThumbnailPreferenceSelector from './ThumbnailPreferenceSelector';
import {
  GroupShoutPreferenceData,
  CommunityNotificationPreferenceType
} from '../types/NotificationPreferencesTypes';
import { useGroupShoutPreferencesContext } from '../context/GroupShoutPreferences';
import { NotificationGroupTypes } from '../constants/notificationPreferencesConstants';
import PreferenceSelector, { PreferenceSelectorProps } from './PreferenceSelector';

export type GroupShoutPreferencesListProps = {
  translate: WithTranslationsProps['translate'];
  localizedDescription?: string;
  parentalControlsEnabled?: boolean;
};

const GroupShoutPreferencesList = ({
  translate,
  localizedDescription,
  parentalControlsEnabled
}: GroupShoutPreferencesListProps): JSX.Element => {
  const {
    updateGroupShoutPreferences,
    canShowMore,
    showMore,
    isFetchingGroupsInfo,
    groupShoutDataList
  } = useGroupShoutPreferencesContext();

  const updatePreferenceCallback = async (
    groupShoutData: GroupShoutPreferenceData,
    newSelection: boolean,
    type: CommunityNotificationPreferenceType
  ) => updateGroupShoutPreferences(groupShoutData, newSelection, type);

  const buttons = groupShoutDataList.map((data, index) => {
    return (
      <React.Fragment>
        <ThumbnailPreferenceSelector
          key={data.groupId}
          hasBorder={index !== 0}
          entityId={data.groupId}
          entityName={data.groupName}
          truncatedEntityName={data.truncatedGroupName}
          entityCreatorName={translate('Label.CreatedBy', { creator: data.creatorName })}
          hasToggle={false}
          unsubscribeCallback={() => Promise.resolve(false)}
          initToggle={false}
          translate={translate}
          entityType={NotificationGroupTypes.groupShout}
          selectionDisabled={parentalControlsEnabled}
        />
        {data.notificationPreferences?.map(preferenceData => (
          <PreferenceSelector
            localizedTypeName={preferenceData.name}
            localizedDescription={preferenceData.description}
            selection={preferenceData.enabled}
            onTogglePreference={async (selection: boolean) =>
              updatePreferenceCallback(data, selection, preferenceData.type)
            }
            selectionDisabled={parentalControlsEnabled}
          />
        ))}
      </React.Fragment>
    );
  });

  return (
    <div className='preference-selector'>
      <div className='notification-type-info'>
        <div className='notification-descriptor small text text-content'>
          {localizedDescription}
        </div>
      </div>
      <div>{buttons}</div>
      <div>
        {isFetchingGroupsInfo ? <Loading /> : null}
        {canShowMore && (
          <Button className='load-more-button btn-secondary-md' onClick={showMore}>
            {translate('Action.ShowMore')}
          </Button>
        )}
      </div>
    </div>
  );
};
export default withTranslations(
  GroupShoutPreferencesList,
  notificationPreferencesTranslationConfig
);

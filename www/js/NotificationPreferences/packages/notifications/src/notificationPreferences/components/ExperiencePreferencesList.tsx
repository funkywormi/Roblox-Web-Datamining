import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Loading, Button } from 'react-style-guide';
import notificationPreferencesTranslationConfig from '../translation.config';
import { ExperiencePreferenceData } from '../types/NotificationPreferencesTypes';
import ThumbnailPreferenceSelector from './ThumbnailPreferenceSelector';
import { useGroupExperiencePreferencesContext } from '../context/GroupExperiencePreferences';
import { NotificationGroupTypes } from '../constants/notificationPreferencesConstants';

export type ExperiencePreferencesListProps = {
  translate: WithTranslationsProps['translate'];
  localizedDescription?: string;
  parentalControlsEnabled?: boolean;
};

const ExperiencePreferencesList = ({
  translate,
  localizedDescription,
  parentalControlsEnabled
}: ExperiencePreferencesListProps): JSX.Element => {
  const {
    updateExperiencePreferences,
    canShowMore,
    showMore,
    isFetchingGamesInfo,
    experienceDataList
  } = useGroupExperiencePreferencesContext();

  const updatePreferenceCallback = async (
    experienceData: ExperiencePreferenceData,
    newSelection: boolean
  ) => updateExperiencePreferences(experienceData, newSelection);

  const buttons = experienceDataList.map((data, index) => (
    <ThumbnailPreferenceSelector
      key={data.id}
      hasBorder={index !== 0}
      entityId={data.id}
      entityName={data.experienceName}
      truncatedEntityName={data.truncatedExperienceName}
      entityCreatorName={translate('Label.CreatedBy', { creator: data.experienceCreator })}
      unsubscribeCallback={async (selection: boolean) => updatePreferenceCallback(data, selection)}
      initToggle={data.enabled}
      translate={translate}
      entityType={NotificationGroupTypes.experience}
      selectionDisabled={parentalControlsEnabled}
    />
  ));
  return (
    <div className='preference-selector'>
      <div className='notification-type-info'>
        <div className='notification-descriptor small text text-content'>
          {localizedDescription}
        </div>
      </div>
      <div>{buttons}</div>
      <div>
        {isFetchingGamesInfo ? <Loading /> : null}
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
  ExperiencePreferencesList,
  notificationPreferencesTranslationConfig
);

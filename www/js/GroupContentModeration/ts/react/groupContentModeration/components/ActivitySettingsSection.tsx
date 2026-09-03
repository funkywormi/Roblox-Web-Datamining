/* eslint-disable react/jsx-no-literals */
import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import Configuration from '../constants/groupContentModerationConstants';
import SlowModeSection from './SlowModeSection';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import '../../../../css/groupFeatureSettings/groupFeatureSettings.scss';
import { groupsConfig } from '../../shared/translation.config';
import { GroupPermissions } from '../../shared/types';

export type ActivitySettingsSectionProps = {
  groupId: number;
  permissions: GroupPermissions;
} & WithTranslationsProps;

const ActivitySettingsSection = ({
  groupId,
  translate,
  permissions
}: ActivitySettingsSectionProps): JSX.Element | null => {
  const { isLoading, data: configureGroupUi } = useGuacConfig('configure-group-ui');

  const { manageKeywordBlockList, viewKeywordBlockList } =
    permissions?.groupContentModerationPermissions ?? {};

  if (!manageKeywordBlockList && !viewKeywordBlockList) {
    return null;
  }

  return (
    <div className='activity-settings-section'>
      <h2>{translate(Configuration.slowModeConfig.translationKeys.headings.activitySettings)}</h2>
      {!isLoading && configureGroupUi?.displaySlowmodeConfiguration && (
        <SlowModeSection
          groupId={groupId}
          readonlyMode={viewKeywordBlockList && !manageKeywordBlockList}
        />
      )}
    </div>
  );
};

export default withTranslations(ActivitySettingsSection, groupsConfig);

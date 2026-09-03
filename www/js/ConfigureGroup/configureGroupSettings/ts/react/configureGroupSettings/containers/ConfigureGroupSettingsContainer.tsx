import React, { useCallback } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import ConfigureGroupSettingsSection from '../components/ConfigureGroupSettingsSection';
import useGroupSettings from '../hooks/useGroupSettings';
import { GroupConfigurationMetadata } from '../services/groupSettingsService';
import { Group } from '../../shared/types';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export interface ConfigureGroupSettingsContainerProps {
  group: Group;
  metadata: GroupConfigurationMetadata;
}

const ConfigureGroupSettingsContainer: React.FC<ConfigureGroupSettingsContainerProps> = ({
  group,
  metadata
}) => {
  const handleSuccess = useCallback((message: string) => {
    systemFeedbackService.success(message);
  }, []);

  const handleError = useCallback((message: string) => {
    systemFeedbackService.warning(message);
  }, []);

  const {
    settings,
    guacPolicies,
    layout,
    isLoading,
    canManageRelationships,
    updateSetting
  } = useGroupSettings({
    group,
    metadata,
    onSuccess: handleSuccess,
    onError: handleError
  });

  const handleSettingChange = useCallback(
    (settingName: string, value: string | boolean) => {
      updateSetting(settingName, value).catch(() => {
        // Errors are surfaced through onError callback inside the hook.
      });
    },
    [updateSetting]
  );

  return (
    <React.Fragment>
      <SystemFeedback />
      {settings && guacPolicies && layout ? (
        <ConfigureGroupSettingsSection
          settings={settings}
          policies={guacPolicies}
          layout={layout}
          isLoading={isLoading}
          onSettingChange={handleSettingChange}
          canManageRelationships={canManageRelationships}
        />
      ) : null}
    </React.Fragment>
  );
};

export default ConfigureGroupSettingsContainer;

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSystemFeedback } from 'react-style-guide';
import Configuration, { SlowModeLevel } from '../constants/groupContentModerationConstants';
import { ActivitySettings } from '../types';
import groupFeatureSettingService from '../services/contentModerationService';
import { SelectionOption } from '../../shared/components/SingleSelection';

export type UseSlowModeSettingsProps = {
  groupId: number;
  translate: (key: string) => string;
};

export type UseSlowModeSettingsReturn = {
  // State
  slowModeLevel: SlowModeLevel | undefined;
  isLoading: boolean;

  // Actions
  handleSlowModeChange: (newLevel: SlowModeLevel) => void;

  // Configuration
  slowModeOptions: SelectionOption[];
};

export const useSlowModeSettings = ({
  groupId,
  translate
}: UseSlowModeSettingsProps): UseSlowModeSettingsReturn => {
  const { systemFeedbackService } = useSystemFeedback();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: activitySettings } = useQuery({
    queryKey: [Configuration.queryKeys.activitySettings, groupId],
    queryFn: () => groupFeatureSettingService.getGroupActivitySettings(groupId),
    enabled: !!groupId,
    refetchOnWindowFocus: true
  });

  const [slowModeLevel, setSlowModeLevel] = useState<SlowModeLevel | undefined>(undefined);

  // Update local state when data loads
  React.useEffect(() => {
    if (activitySettings && activitySettings.slowmode !== undefined) {
      setSlowModeLevel(activitySettings.slowmode);
    }
  }, [activitySettings]);

  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: (settings: ActivitySettings) =>
      groupFeatureSettingService.updateGroupFeatureSettings(groupId, settings),
    onSuccess: () => {
      systemFeedbackService.success(
        translate(Configuration.slowModeConfig.translationKeys.messages.settingsSaved)
      );
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries([Configuration.queryKeys.activitySettings, groupId]);
    },
    onError: () => {
      systemFeedbackService.warning(
        translate(Configuration.slowModeConfig.translationKeys.messages.settingsSaveFailed)
      );
    }
  });

  const handleSlowModeChange = useCallback(
    (newSlowModeLevel: SlowModeLevel) => {
      setSlowModeLevel(newSlowModeLevel);
      // Auto-save on change
      saveSettings.mutate({ slowmode: newSlowModeLevel });
    },
    [saveSettings]
  );

  // Memoized configuration objects
  const slowModeOptions = useMemo(
    () =>
      Configuration.slowModeConfig.options.map(level => ({
        label: translate(Configuration.slowModeConfig.translationKeys.labels[level]),
        value: `${level}`,
        description: translate(Configuration.slowModeConfig.translationKeys.descriptions[level])
      })),
    [translate]
  );

  return {
    slowModeLevel,
    isLoading: saveSettings.isLoading,
    handleSlowModeChange,
    slowModeOptions
  };
};

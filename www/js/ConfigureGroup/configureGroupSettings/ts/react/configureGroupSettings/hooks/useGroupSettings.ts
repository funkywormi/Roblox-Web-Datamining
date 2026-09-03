import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-utilities';
import { CurrentUser } from 'Roblox';
import groupSettingsService, {
  GroupSettings,
  GroupConfigurationMetadata,
  GroupConfigurationLayout
} from '../services/groupSettingsService';
import { eventConstants } from '../constants/groupSettingsConstants';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { Group } from '../../shared/types';
import guacService, { ConfigureGroupUiResponse } from '../../shared/services/guacService';

interface UseGroupSettingsResult {
  settings: GroupSettings | undefined;
  guacPolicies: ConfigureGroupUiResponse | undefined;
  layout: GroupConfigurationLayout | undefined;
  isLoading: boolean;
  canManageRelationships: boolean;
  updateSetting: (settingName: string, value: string | boolean) => Promise<void>;
}

interface UseGroupSettingsParams {
  group: Group;
  metadata: GroupConfigurationMetadata;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const useGroupSettings = ({
  group,
  metadata,
  onSuccess,
  onError
}: UseGroupSettingsParams): UseGroupSettingsResult => {
  const { translate } = useTranslation();
  const [settings, setSettings] = useState<GroupSettings>();
  const [guacPolicies, setGuacPolicies] = useState<ConfigureGroupUiResponse>();
  const [layout, setLayout] = useState<{
    settingsError?: string;
    isOwner: boolean;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [canManageRelationships, setCanManageRelationships] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        setSettings(await groupSettingsService.getGroupSettings(group.id));

        setGuacPolicies(await guacService.getConfigureGroupUiGuac());

        // CurrentUser.userId is a string; coerce for the numeric comparison.
        const isOwner =
          group.owner?.userId !== undefined && group.owner.userId === Number(CurrentUser.userId);
        setLayout({
          isOwner
        });

        setCanManageRelationships(
          group.permissions?.groupManagementPermissions?.manageRelationships ?? false
        );
      } catch (error) {
        const errorMessage = translate('Message.LoadSettingsFail');
        setLayout({
          settingsError: errorMessage,
          isOwner: false
        });
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData().catch(() => {
      // Swallow promise rejections; loadData already handles errors internally.
    });
  }, [group, metadata, onSuccess, onError, translate]);

  const logSettingChange = useCallback(
    (settingName: string, value: string | boolean) => {
      if (!group?.id) {
        return;
      }

      const settingToClickTargetMap: Record<string, string> = {
        verificationLevel: eventConstants.ConfigureSettingsClickTargetType.VerificationLevel,
        accountTenureRequirement:
          eventConstants.ConfigureSettingsClickTargetType.AccountTenureRequirement,
        isApprovalRequired: eventConstants.ConfigureSettingsClickTargetType.ManualApproval,
        areGroupFundsVisible: eventConstants.ConfigureSettingsClickTargetType.GroupFundsVisible,
        areGroupGamesVisible: eventConstants.ConfigureSettingsClickTargetType.GroupGamesVisible,
        areEnemiesAllowed: eventConstants.ConfigureSettingsClickTargetType.EnemiesAllowed
      };

      const clickTargetType = settingToClickTargetMap[settingName];
      if (clickTargetType) {
        const clickTargetId = value !== null && value !== undefined ? String(value) : undefined;

        logGroupPageClickEvent({
          context: eventConstants.EventContext.ConfigureGroup,
          groupId: group.id,
          clickTargetType,
          clickTargetId
        });
      }
    },
    [group]
  );

  const updateSetting = useCallback(
    async (settingName: string, value: string | boolean) => {
      if (!settings) {
        return;
      }

      const previousValue = settings[settingName as keyof GroupSettings];

      try {
        setSettings({
          ...settings,
          [settingName]: value
        });

        await groupSettingsService.updateGroupSetting(group.id, settingName, value);

        logSettingChange(settingName, value);

        if (onSuccess) {
          onSuccess(translate('Message.SettingUpdated'));
        }
      } catch (error) {
        setSettings({
          ...settings,
          [settingName]: previousValue
        });

        if (onError) {
          onError(translate('Message.SettingFail'));
        }
      }
    },
    [settings, group, logSettingChange, translate, onSuccess, onError]
  );

  return {
    settings,
    guacPolicies,
    layout,
    isLoading,
    canManageRelationships,
    updateSetting
  };
};

export default useGroupSettings;

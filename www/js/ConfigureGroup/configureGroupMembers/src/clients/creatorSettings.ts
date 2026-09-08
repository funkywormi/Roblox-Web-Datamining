import type {
  GetGenericCreatorSettingsByUserIdAndSettingTypeResponse,
  UpdateOrCreateGenericCreatorSettingsByUserIdAndSettingTypeResponse,
} from '@rbx/client-creator-settings/v1';
import { CreatorSettingsAPIApi, GenericCreatorSettingType } from '@rbx/client-creator-settings/v1';
import { createClientConfiguration } from './utils';

const configuration = createClientConfiguration('creator-settings', 'bedev2');
const creatorSettingsApi = new CreatorSettingsAPIApi(configuration);

export const GROUP_UNIFIED_ACKNOWLEDGEMENT_SETTING_TYPE =
  GenericCreatorSettingType.GroupUnifiedAcknowledgement;

interface CreatorSettingsClient {
  getGroupUnifiedAcknowledgements(
    userId: number,
  ): Promise<GetGenericCreatorSettingsByUserIdAndSettingTypeResponse>;
  updateGroupUnifiedAcknowledgements(
    userId: number,
    groupIds: number[],
  ): Promise<UpdateOrCreateGenericCreatorSettingsByUserIdAndSettingTypeResponse>;
}

const creatorSettingsClient: CreatorSettingsClient = {
  getGroupUnifiedAcknowledgements(userId) {
    return creatorSettingsApi.v2SettingsUserUserIdSettingSettingTypeGet({
      userId,
      settingType: GROUP_UNIFIED_ACKNOWLEDGEMENT_SETTING_TYPE,
    });
  },
  updateGroupUnifiedAcknowledgements(userId, groupIds) {
    return creatorSettingsApi.v2SettingsUserUserIdSettingSettingTypePatch({
      userId,
      settingType: GROUP_UNIFIED_ACKNOWLEDGEMENT_SETTING_TYPE,
      updateOrCreateGenericCreatorSettingsByUserIdAndSettingTypeRequest: {
        settingValue: JSON.stringify(groupIds),
      },
    });
  },
};

export default creatorSettingsClient;

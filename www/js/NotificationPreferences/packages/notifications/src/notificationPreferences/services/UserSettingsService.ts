import { httpService } from 'core-utilities';
import urlConfigs from '../constants/urlConstants';
import { TUpdateUserSettingValueRequest } from '../types/UserSettingsTypes';

export const updateUserSettings = async (
  request: TUpdateUserSettingValueRequest,
  headers: Record<string, string>
): Promise<number> => {
  const urlConfig = {
    ...urlConfigs.updateUserSetting,
    headers
  };

  const result = await httpService.post(urlConfig, request);
  return result.status;
};

export const updateUserSettingsV2 = async (
  request: TUpdateUserSettingValueRequest,
  headers: Record<string, string>
): Promise<number> => {
  const urlConfig = {
    ...urlConfigs.updateUserSettingV2,
    headers
  };

  const result = await httpService.post(urlConfig, request);
  return result.status;
};

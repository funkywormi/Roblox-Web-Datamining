import { EnvironmentUrls } from 'Roblox';

const { userSettingsApi } = EnvironmentUrls;

export default {
  setGlobalPrivacyControlConfig: () => {
    return {
      withCredentials: true,
      url: `${userSettingsApi}/v1/user-settings/gpc`
    };
  }
};

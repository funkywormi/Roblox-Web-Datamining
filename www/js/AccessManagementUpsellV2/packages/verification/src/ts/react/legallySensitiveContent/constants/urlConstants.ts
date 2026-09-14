import { EnvironmentUrls } from '@rbx/environment-urls';

const { userSettingsApi } = EnvironmentUrls;

type UrlConfig = {
  retryable: boolean;
  withCredentials: boolean;
  url: string;
};

const getUserSettingsUrlConfig = (): UrlConfig => ({
  retryable: true,
  withCredentials: true,
  url: `${userSettingsApi}/v1/user-settings`
});

export default {
  getUserSettingsUrlConfig
};

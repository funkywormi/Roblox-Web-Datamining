import type { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const setGlobalPrivacyControlConfig = (): UrlConfig => {
  return {
    withCredentials: true,
    url: `${environmentUrls.userSettingsApi}/v1/user-settings/gpc`,
  };
};

const getUserSettingsConfig = (): UrlConfig => {
  return {
    retryable: true,
    withCredentials: true,
    url: `${environmentUrls.userSettingsApi}/v1/user-settings`,
  };
};

const getAmpUpsellUrlConfig = (featureName: string, namespace: string): UrlConfig => {
  const baseUrl = `${environmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access`;
  const params = new URLSearchParams({
    featureName,
    namespace,
  });
  const url = `${baseUrl}?${params.toString()}`;
  return {
    retryable: true,
    withCredentials: true,
    url,
  };
};

export { setGlobalPrivacyControlConfig, getUserSettingsConfig, getAmpUpsellUrlConfig };

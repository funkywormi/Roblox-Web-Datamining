import { EnvironmentUrls } from '@rbx/environment-urls';

const { apiGatewayUrl } = EnvironmentUrls;

const getAmpFeatureCheckUrlConfig = (featureName: string) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/v1/feature-access`
});

const getAmpUpsellUrlConfig = (featureName: string) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}`
});

const getAmpUpsellWithParametersUrlConfig = (
  featureName: string,
  extraParameters?: string,
  recourses?: string,
  namespace?: string
) => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}${
    extraParameters ? `&extraParameters=${extraParameters}` : ``
  }${recourses ? `&successfulActions=${recourses}` : ``}${
    namespace ? `&namespace=${encodeURIComponent(namespace)}` : ``
  }`
});

const LearnMoreAboutAge13Link = 'https://help.roblox.com/hc/articles/30428367965460';

export {
  getAmpFeatureCheckUrlConfig,
  getAmpUpsellUrlConfig,
  getAmpUpsellWithParametersUrlConfig,
  LearnMoreAboutAge13Link
};

import { EnvironmentUrls } from '@rbx/environment-urls';
import * as httpService from '@rbx/core-scripts/http';

export default function ampFeatureService() {
  const DMCCALegalTextFeature = 'ShouldUseDMCCALegalDisclosure';
  const { apiGatewayUrl } = EnvironmentUrls;
  const getAmpUpsellUrlConfig = (featureName: string) => ({
    retryable: true,
    withCredentials: true,
    url: `${apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}`
  });

  return {
    getDmccaLegalTextFeature: () => {
      return httpService.get(getAmpUpsellUrlConfig(DMCCALegalTextFeature)).then(({ data }) => {
        return (data as { access: string }).access === 'Granted';
      });
    }
  };
}

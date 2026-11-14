import environmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const { apiGatewayUrl } = environmentUrls;

const urlConfigs = {
  getSpotlightData: (): UrlConfig => ({
    url: `${apiGatewayUrl}/landing-page-api/spotlight`,
    withCredentials: true,
  }),
  getPreAuthLandingPage: (): UrlConfig => ({
    url: `${apiGatewayUrl}/landing-page-api/pre-auth-landing`,
    withCredentials: true,
  }),
};

export default urlConfigs;

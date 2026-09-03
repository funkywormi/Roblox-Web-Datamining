import environmentUrls from "@rbx/environment-urls";
import { getUrlWithLocale } from "@rbx/core-scripts/util/url";

const { apiGatewayUrl } = environmentUrls;

export default {
  getAssetTextFilterSettingsUrl: (universeId: string): string =>
    `${apiGatewayUrl}/asset-text-filter-settings/public/universe/${universeId}`,
  experienceGuidelinesPolicyPageUrl: (locale: string): string =>
    getUrlWithLocale("/info/age-recommendations-policy", locale),
  indonesianContentMaturityUrl:
    "https://en.help.roblox.com/hc/id/articles/8862768451604-Label-Kedewasaan-Konten",
};

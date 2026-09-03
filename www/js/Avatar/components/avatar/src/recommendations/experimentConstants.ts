import environmentUrls from "@rbx/environment-urls";

// Local URL-config shape (avoids a `@rbx/core-scripts/http` type import so this
// module stays free of core-scripts on the Next.js path).
type UrlConfig = { url: string; withCredentials?: boolean };

// Trim trailing slash: the Next.js `@rbx/environment-urls` shim returns hosts with a
// trailing slash (`Url.toString()`); concatenating with a leading-slash path would
// double up. No-op on .NET.
const apiGatewayUrl = environmentUrls.apiGatewayUrl.replace(/\/$/, "");

const url = {
  getExperimentationValues: (
    projectId: number,
    layerName: string,
    values: string[],
  ): UrlConfig => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ",",
    )}`,
    withCredentials: true,
  }),
};

const layerNames = {
  avatarShopPage: "AvatarMarketplace.UI",
  avatarShopRecommendationsAndSearchWeb: "AvatarMarketplace.RecommendationsAndSearch.Web",
  avatarMarketplaceRelevanceRecommendations: "AvatarMarketplace.RelevanceRecommendations",
  avatarMarketplaceEditor: "AvatarMarketplace.Editor",
};

const parameterNames = {
  recommendationNumRows: ["recommendationNumRows", "recommendationPageName"],
  complimentaryItemRecommendationsEnabled: [
    "complimentaryItemRecommendationsEnabled",
    "displayPurchaseButtonLeft",
  ],
  avatarMarketplaceRelevanceRecommendations: ["recommendationNumRows"],
  avatarMarketplaceEditor: ["recommendationNumRows"],
};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId,
};

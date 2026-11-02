import environmentUrls from "@rbx/environment-urls";

const { gamesApi } = environmentUrls;
type TUrl = { url: string; withCredentials: boolean };

const url = {
  getGameRecommendations: (universeId: string): TUrl => ({
    url: `${gamesApi}/v1/games/recommendations/game/${universeId}`,
    withCredentials: true,
  }),
  getUniverseVoiceStatus: (universeId: string): TUrl => ({
    withCredentials: true,
    url: `${environmentUrls.voiceApi}/v1/settings/universe/${universeId}`,
  }),
  getVoiceOptInStatus: {
    withCredentials: true,
    url: `${environmentUrls.voiceApi}/v1/settings/user-opt-in`,
  },
  getAssetDataFromAssetId: (assetId: string): TUrl => {
    return {
      url: `${environmentUrls.assetDeliveryApi}/v2/assetId/${assetId}`,
      withCredentials: true,
    };
  },
};

const defaultCacheCriteria = {
  refreshCache: false,
  expirationWindowMS: 30000,
  useCache: true,
};

export default {
  url,
  defaultCacheCriteria,
};

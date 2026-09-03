import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl, getUrlWithQueries, getUrlWithLocale } from "@rbx/core-scripts/util/url";

const { gamesApi, apiGatewayUrl, matchmakingApi, economyApi } = environmentUrls;

const urlConstants = {
  getUserProfileUrl: (userId: number) => getAbsoluteUrl(`/users/${userId}/profile`),
  getGameServersUrl: (placeId: number, serverType: string) =>
    getAbsoluteUrl(`${gamesApi}/v1/games/${placeId}/servers/${serverType}`),
  getPrivateGameServersUrl: (placeId: number) =>
    getAbsoluteUrl(`${gamesApi}/v1/games/${placeId}/private-servers`),
  getShutdownGameInstanceUrl: () => getAbsoluteUrl(`${matchmakingApi}/v1/game-instances/shutdown`),
  getPrivateServerConfigUrl: (privateServerId: number, serverListId?: number) =>
    getUrlWithQueries(`/private-server/configure`, { privateServerId, serverListId }),
  getVipServerUrl: (vipServerId: number) => `${gamesApi}/v1/vip-servers/${vipServerId}`,
  createVipServerUrl: (universeId: number) => `${gamesApi}/v1/games/vip-servers/${universeId}`,
  updateVipServerSubscriptionUrl: (vipServerId: number) =>
    `${gamesApi}/v1/vip-servers/${vipServerId}/subscription`,
  createPrivateServerUrl: (universeId: number) => `${gamesApi}/v1/games/vip-servers/${universeId}`,
  privateServerHelpUrl: (locale: string) => getUrlWithLocale("/info/vip-server", locale),
  getUserSettingsApiUrl: () => `${apiGatewayUrl}/user-settings-api/v1/user-settings`,
  accountsSettingsPageUrl: () => getAbsoluteUrl("/my/account#!/privacy"),
  getPublicGameServersV2Url: (placeId: number) =>
    getAbsoluteUrl(`${gamesApi}/v2/games/${placeId}/servers/Public`),
  getCurrentUserBalance: (userId: number) => `${economyApi}/v1/users/${userId}/currency`,
} as const;

export default urlConstants;

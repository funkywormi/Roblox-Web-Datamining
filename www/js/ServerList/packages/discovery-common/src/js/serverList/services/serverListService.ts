import { callBehaviour } from "@rbx/core-scripts/guac";
import * as http from "@rbx/core-scripts/http";
import urlConstant from "../constants/urlConstants";
import serverListConstants from "../constants/serverListConstants";

const { serverListTypes } = serverListConstants;

export type GameInstanceQueryParams = Record<string, string | number | boolean | undefined>;

/** @see games-api: Roblox.Games.Api.GameServerPlayerResponse (extends SkinnyUserResponse) */
export type GameServerPlayerResponse = {
  id: number;
  name: string;
  displayName: string;
  playerToken: string;
};

/** @see games-api: Roblox.Games.Api.Models.Response.VerifiedBadgeUserResponse */
export type GameServerOwnerResponse = {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
};

/** @see games-api: Roblox.Web.Responses.Games.GameServerResponse */
export type GameServerResponse = {
  id?: string;
  maxPlayers?: number;
  playing?: number;
  playerTokens?: string[];
  players?: GameServerPlayerResponse[];
  fps?: number;
  ping?: number;
  name?: string;
  vipServerId?: number;
  accessCode?: string;
  owner?: GameServerOwnerResponse;
};

/** @see private-servers-api: PrivateServersApi.Models.Responses.GetPrivateServerListResponse */
export type GameServerListResponse = {
  data: GameServerResponse[];
  nextPageCursor: string;
  gameJoinRestricted?: boolean;
};

/** @see games-api: Roblox.Games.Api.VipServerSubscriptionResponse */
export type VipServerSubscriptionResponse = {
  active: boolean;
  expired: boolean;
  expirationDate: string;
  price?: number;
  canRenew: boolean;
  hasInsufficientFunds: boolean;
  hasRecurringProfile: boolean;
  hasPriceChanged: boolean;
};

/** @see games-api: Roblox.Games.Api.VipServerPermissionsResponse */
export type VipServerPermissionsResponse = {
  clanAllowed: boolean;
  enemyClanId: number | null;
  friendsAllowed: boolean;
  users: Array<{ id: number; name: string; displayName: string }>;
};

/** @see games-api: Roblox.Games.Api.VipServerResponse */
export type VipServerResponse = {
  id: number;
  name: string;
  joinCode: string;
  active: boolean;
  subscription: VipServerSubscriptionResponse;
  permissions: VipServerPermissionsResponse;
  link: string;
};

/** @see user-settings-api: UserSettingsModels.Response.GetUserSettingsResponse */
export type UserSettingsResponse = {
  privateServerPrivacy?: string;
  privateServerInvitePrivacy?: string;
};

/** @see economy-api: Roblox.Web.Responses.Economy.CurrencyResponse */
export type UserCurrencyResponse = {
  robux: number;
};

type AccountSettingsGuacPolicy = {
  isPrivateServerPrivacyV2Enabled?: boolean;
};

const {
  getGameServersUrl,
  getPublicGameServersV2Url,
  getPrivateGameServersUrl,
  getShutdownGameInstanceUrl,
  getVipServerUrl,
  createVipServerUrl,
  createPrivateServerUrl,
  updateVipServerSubscriptionUrl,
  getUserSettingsApiUrl,
  getCurrentUserBalance,
} = urlConstant;

export default {
  getPublicGameInstancesV2: (
    placeId: number,
    cursor: string,
    paramsArg: GameInstanceQueryParams = {},
  ) => {
    const urlConfig = {
      url: getPublicGameServersV2Url(placeId),
      retryable: true,
      withCredentials: true,
    };

    // This fixes the bug where setting params.cursor would make the cursor key
    // permanent, even on server list refresh. structuredClone is probably a
    // better option for copying an object, but it's very new and not well supported.
    const params = { cursor, ...paramsArg };
    return http.get<GameServerListResponse>(urlConfig, params);
  },
  getFriendsGameInstances: (
    placeId: number,
    cursor: string,
    paramsArg: GameInstanceQueryParams = {},
  ) => {
    const urlConfig = {
      url: getGameServersUrl(placeId, serverListTypes.friend.value),
      retryable: false,
      withCredentials: true,
    };

    const params = { cursor, ...paramsArg };
    return http.get<GameServerListResponse>(urlConfig, params);
  },
  getVipGameInstances: (
    placeId: number,
    cursor: string,
    paramsArg: GameInstanceQueryParams = {},
  ) => {
    const urlConfig = {
      url: getPrivateGameServersUrl(placeId),
      retryable: false,
      withCredentials: true,
    };

    const params = { cursor, ...paramsArg };
    return http.get<GameServerListResponse>(urlConfig, params);
  },

  shutdownGameInstance: (placeId: number, gameId: string, privateServerId?: number) => {
    const requestVerificationToken = document.querySelector<HTMLInputElement>(
      "input[name='__RequestVerificationToken']",
    )?.value;

    const urlConfig = {
      url: getShutdownGameInstanceUrl(),
      retryable: true,
      withCredentials: true,
    };

    const data = {
      __RequestVerificationToken: requestVerificationToken,
      placeId,
      gameId,
      ...(privateServerId ? { privateServerId } : {}),
    };

    return http.post(urlConfig, data);
  },
  createPrivateServer: (
    universeId: number,
    name: string,
    expectedPrice: number,
    idempotencyKey: string,
  ) => {
    const urlConfig = {
      url: createPrivateServerUrl(universeId),
      retryable: true,
      withCredentials: true,
    };

    const params = {
      name,
      expectedPrice,
      idempotencyKey,
    };

    return http.post(urlConfig, params);
  },
  getVipServer: (vipServerId: number) => {
    const urlConfig = {
      url: getVipServerUrl(vipServerId),
      retryable: true,
      withCredentials: true,
    };
    return http.get<VipServerResponse>(urlConfig);
  },
  createVipServer: (universeId: number, name: string, expectedPrice: number) => {
    const urlConfig = {
      url: createVipServerUrl(universeId),
      retryable: true,
      withCredentials: true,
    };
    return http.post(urlConfig, { name, expectedPrice });
  },
  updateVipServerSubscription: (vipServerId: number, active: boolean, price: number) => {
    const urlConfig = {
      url: updateVipServerSubscriptionUrl(vipServerId),
      retryable: true,
      withCredentials: true,
    };
    return http.patch(urlConfig, { active, price });
  },
  getUserSettings: (): Promise<UserSettingsResponse | null> => {
    const urlConfig = {
      retryable: true,
      withCredentials: true,
      url: getUserSettingsApiUrl(),
    };
    return http.get<UserSettingsResponse>(urlConfig).then(
      response => response.data,
      () => {
        return null;
      },
    );
  },
  getAccountSettingsGuacPolicy: (): Promise<AccountSettingsGuacPolicy | null> => {
    return callBehaviour<AccountSettingsGuacPolicy>("account-settings-ui").catch(() => null);
  },
  getCurrentUserBalance: (userId: number) => {
    const urlConfig = {
      url: getCurrentUserBalance(userId),
      retryable: true,
      withCredentials: true,
    };
    return http.get<UserCurrencyResponse>(urlConfig).then(response => response.data);
  },
};

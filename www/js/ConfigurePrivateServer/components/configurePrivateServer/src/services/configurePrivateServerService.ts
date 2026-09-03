import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import environmentUrls from "@rbx/environment-urls";
import { configurePrivateServerConstants } from "../constants/configurePrivateServerConstants";
import type {
  PrivateServer,
  PrivateServerCanInviteResponse,
  PrivateServerPermissions,
  PrivateServerSubscription,
  ThumbnailResponse,
  UserCurrencyResponse,
  UserSearchResponse,
  UserSettingsResponse,
} from "../types/configurePrivateServerTypes";

const { apiEndpoints } = configurePrivateServerConstants;

export const configurePrivateServerService = {
  async getServer(privateServerId: string): Promise<PrivateServer> {
    const response = await httpService.get<PrivateServer>({
      url: `${apiEndpoints.apiMainPath}${privateServerId}`,
      withCredentials: true,
    });
    return response.data;
  },

  async updateServer(
    privateServerId: string,
    param: Record<string, unknown>,
  ): Promise<PrivateServer> {
    const response = await httpService.patch<PrivateServer>(
      { url: `${apiEndpoints.apiMainPath}${privateServerId}`, withCredentials: true },
      param,
    );
    return response.data;
  },

  async updatePermissions(
    privateServerId: string,
    param: Record<string, unknown>,
  ): Promise<PrivateServerPermissions> {
    const response = await httpService.patch<PrivateServerPermissions>(
      { url: `${apiEndpoints.apiMainPath}${privateServerId}/permissions`, withCredentials: true },
      param,
    );
    return response.data;
  },

  async updateSubscription(
    privateServerId: string,
    param: Record<string, unknown>,
  ): Promise<PrivateServerSubscription> {
    const response = await httpService.patch<PrivateServerSubscription>(
      { url: `${apiEndpoints.apiMainPath}${privateServerId}/subscription`, withCredentials: true },
      param,
    );
    return response.data;
  },

  async canInviteUser(userId: number): Promise<PrivateServerCanInviteResponse> {
    const response = await httpService.get<PrivateServerCanInviteResponse>({
      url: `${apiEndpoints.apiVIPServerCanInvitePath}${userId}`,
      withCredentials: true,
    });
    return response.data;
  },

  async searchUsers(keyword: string): Promise<UserSearchResponse> {
    const response = await httpService.get<UserSearchResponse>({
      url: `${apiEndpoints.apiUsersSearchPath}?keyword=${encodeURIComponent(keyword)}&limit=10`,
      withCredentials: true,
    });
    return response.data;
  },

  async getUserSettings(): Promise<UserSettingsResponse | null> {
    try {
      const response = await httpService.get<UserSettingsResponse>({
        url: apiEndpoints.apiUserSettingsGetPath,
        retryable: true,
        withCredentials: true,
      });
      return response.data;
    } catch {
      return null;
    }
  },

  async getUserCurrency(userId: string): Promise<UserCurrencyResponse> {
    const response = await httpService.get<UserCurrencyResponse>({
      url: apiEndpoints.apiUserCurrencyPath.replace("{userId}", userId),
      withCredentials: true,
    });
    return response.data;
  },

  async getPlaceThumbnail(placeId: number): Promise<string | null> {
    try {
      const response = await httpService.get<ThumbnailResponse>({
        url: `${environmentUrls.thumbnailsApi}/v1/places/gameicons?placeIds=${placeId}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`,
        withCredentials: true,
      });
      return response.data.data[0]?.imageUrl ?? null;
    } catch {
      return null;
    }
  },

  async getUserHeadshots(userIds: number[]): Promise<Record<number, string>> {
    if (userIds.length === 0) {
      return {};
    }
    try {
      const response = await httpService.get<ThumbnailResponse>({
        url: `${environmentUrls.thumbnailsApi}/v1/users/avatar-headshot?userIds=${userIds.join(",")}&size=48x48&format=Png&isCircular=true`,
        withCredentials: true,
      });
      return response.data.data.reduce<Record<number, string>>(
        (acc, entry) =>
          entry.imageUrl
            ? {
                ...acc,
                [entry.targetId]: entry.imageUrl,
              }
            : acc,
        {},
      );
    } catch {
      return {};
    }
  },

  async getAccountSettingsGuacPolicy(): Promise<{
    isPrivateServerPrivacyV2Enabled?: boolean;
  } | null> {
    try {
      const guac = (
        window as typeof window & { Guac?: { callBehaviour: (name: string) => Promise<unknown> } }
      ).Guac;
      if (!guac) {
        return null;
      }
      const policy = await guac.callBehaviour("account-settings-ui");
      if (
        typeof policy === "object" &&
        policy !== null &&
        "isPrivateServerPrivacyV2Enabled" in policy
      ) {
        const policyValue = (policy as Record<string, unknown>).isPrivateServerPrivacyV2Enabled;
        return { isPrivateServerPrivacyV2Enabled: Boolean(policyValue) };
      }
      return {};
    } catch {
      return null;
    }
  },
};

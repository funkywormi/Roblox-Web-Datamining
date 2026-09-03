import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import type { UrlConfig } from "@rbx/core-scripts/http";
import type {
  TrustedConnectionStatusEnum,
  TrustedFriendActionEnum,
} from "../constants/trustedFriendsModal";

const friendsTrustedBase = (): string => `${environmentUrls.friendsApi}/v1`;

const trustedUrlConfig = (): Pick<UrlConfig, "retryable" | "withCredentials"> => ({
  retryable: true,
  withCredentials: true,
});

export type TrustedFriendStatusResponse = {
  status?: TrustedConnectionStatusEnum;
};

export {
  TrustedConnectionStatus,
  type TrustedConnectionStatusEnum,
} from "../constants/trustedFriendsModal";

export async function getTrustedFriendStatus(userId: number): Promise<TrustedFriendStatusResponse> {
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/my/trusted-friends/${userId}/status`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.get<TrustedFriendStatusResponse>(urlConfig);
  return data;
}

export async function acceptTrustedFriendRequest(userId: number): Promise<unknown> {
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/users/${userId}/accept-trusted-friend-request`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.post<unknown>(urlConfig, {});
  return data;
}

export async function sendTrustedFriendRequest(userId: number, source?: string): Promise<unknown> {
  const query = source ? `?source=${encodeURIComponent(source)}` : "";
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/users/${userId}/send-trusted-friend-request${query}`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.post<unknown>(urlConfig, {});
  return data;
}

export async function validateTrustedFriendLink(
  senderUserId: number,
  tokens: number[],
): Promise<unknown> {
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/users/${senderUserId}/validate-trusted-friend-link`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.post<unknown>(urlConfig, { Tokens: tokens });
  return data;
}

export async function addTrustedFriendFromLink(
  senderUserId: number,
  tokens: number[],
): Promise<unknown> {
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/users/${senderUserId}/add-trusted-friend-from-link`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.post<unknown>(urlConfig, { Tokens: tokens });
  return data;
}

export type CreateTrustedFriendLinkResponse = {
  link: string;
};

export async function createTrustedFriendLink(
  userId: number,
): Promise<CreateTrustedFriendLinkResponse> {
  const urlConfig: UrlConfig = {
    url: `${friendsTrustedBase()}/users/${userId}/create-trusted-friend-link`,
    ...trustedUrlConfig(),
  };
  const { data } = await http.post<CreateTrustedFriendLinkResponse>(urlConfig, {});
  return data;
}

export type GetTrustedFriendActionParams = {
  friendRequestToken?: number[];
};

type GetTrustedFriendActionResponse = {
  components?: {
    TrustedFriendActions?: {
      action?: TrustedFriendActionEnum;
    };
  };
};

export async function getTrustedFriendAction(
  userId: number,
  params?: GetTrustedFriendActionParams,
): Promise<TrustedFriendActionEnum | undefined> {
  const friendRequestToken =
    params?.friendRequestToken && Array.isArray(params.friendRequestToken)
      ? params.friendRequestToken.join(",")
      : undefined;

  const urlConfig: UrlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/profile-platform-api/v1/profiles/get`,
    ...trustedUrlConfig(),
  };

  const { data } = await http.post<GetTrustedFriendActionResponse>(urlConfig, {
    profileType: "User",
    profileId: userId,
    components: [
      {
        component: "TrustedFriendActions",
        context: friendRequestToken,
      },
    ],
  });

  return data.components?.TrustedFriendActions?.action;
}

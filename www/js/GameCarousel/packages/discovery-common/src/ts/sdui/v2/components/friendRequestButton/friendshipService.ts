import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { isFriendshipStatus, type FriendshipStatus } from "./friendshipStatus";

type FriendshipStatusResponseItem = {
  id?: number | string;
  status?: unknown;
};

type FriendshipStatusesResponse = {
  data?: FriendshipStatusResponseItem[];
};

type FriendRequestResponse = {
  success: boolean;
  message?: string;
};

export const DEFAULT_FRIENDSHIP_ORIGIN_SOURCE = "PlayerSearch";

export type FriendRequestResult = "already-friends" | "success";

export type FriendRequestStart = {
  requestCompletion: Promise<FriendRequestResult>;
  didStart: boolean;
};

const inFlightFriendRequestsByTargetUserId = new Map<string, Promise<FriendRequestResult>>();

function normalizeResponseUserId(userId: number | string | undefined): string | undefined {
  if (typeof userId === "number" && Number.isSafeInteger(userId) && userId > 0) {
    return String(userId);
  }
  if (typeof userId === "string" && /^\d+$/.test(userId)) {
    return userId;
  }
  return undefined;
}

export async function fetchFriendshipStatuses(
  viewerUserId: string,
  targetUserIds: readonly string[],
): Promise<Map<string, FriendshipStatus>> {
  const uniqueTargetUserIds = [...new Set(targetUserIds)];
  if (uniqueTargetUserIds.length === 0) {
    return new Map();
  }

  const response = await http.get<FriendshipStatusesResponse>(
    {
      retryable: true,
      url: `${environmentUrls.friendsApi}/v1/users/${viewerUserId}/friends/statuses`,
      withCredentials: true,
    },
    {
      userIds: uniqueTargetUserIds.join(","),
    },
  );

  const friendshipStatusByUserId = new Map<string, FriendshipStatus>();
  for (const item of response.data.data ?? []) {
    const userId = normalizeResponseUserId(item.id);
    if (userId != null && isFriendshipStatus(item.status)) {
      friendshipStatusByUserId.set(userId, item.status);
    }
  }
  return friendshipStatusByUserId;
}

export async function sendFriendRequest(
  targetUserId: string,
  friendshipOriginSource: string | undefined,
): Promise<FriendRequestResult> {
  const trimmedSource = friendshipOriginSource?.trim();
  const normalizedSource =
    trimmedSource == null || trimmedSource === ""
      ? DEFAULT_FRIENDSHIP_ORIGIN_SOURCE
      : trimmedSource;
  try {
    const response = await http.post<FriendRequestResponse>(
      {
        url: `${environmentUrls.friendsApi}/v1/users/${targetUserId}/request-friendship`,
        withCredentials: true,
      },
      {
        friendshipOriginSourceType: normalizedSource,
      },
    );
    if (response.data.success !== true) {
      // Defensive for unexpected errors. Errors like 4xx are handled by the catch block.
      throw new Error(response.data.message ?? "Unable to send friend request.");
    }
    return "success";
  } catch (error) {
    // https://github.rbx.com/Roblox/friends/blob/c53061a17ca9609776e27f82fae3fb5b0f2e6c58/services/friends-api/Roblox.Friends.Api/Helpers/ApiErrorHelper.cs#L41
    if (error != null && http.parseErrorCode(error) === 5) {
      return "already-friends";
    }
    throw error;
  }
}

export function startFriendRequest(
  targetUserId: string,
  friendshipOriginSource: string | undefined,
): FriendRequestStart {
  const inFlightRequest = inFlightFriendRequestsByTargetUserId.get(targetUserId);
  if (inFlightRequest != null) {
    return {
      requestCompletion: inFlightRequest,
      didStart: false,
    };
  }

  const requestCompletion = sendFriendRequest(targetUserId, friendshipOriginSource).finally(() => {
    if (inFlightFriendRequestsByTargetUserId.get(targetUserId) === requestCompletion) {
      inFlightFriendRequestsByTargetUserId.delete(targetUserId);
    }
  });
  inFlightFriendRequestsByTargetUserId.set(targetUserId, requestCompletion);
  return {
    requestCompletion,
    didStart: true,
  };
}

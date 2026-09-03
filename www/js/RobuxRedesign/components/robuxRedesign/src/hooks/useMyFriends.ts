/* eslint-disable no-void */
import { useEffect, useState } from "react";
import { captureException } from "@rbx/payments/error";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import * as friendsService from "@rbx/friends-common/services/friends";
import { TFriend } from "@rbx/friends-common/types/friendsCarousel";
import { trackCounter } from "../observability";

export type UseMyFriendsResult = {
  friends: TFriend[];
  isLoading: boolean;
  error: Error | null;
  isLoggedIn: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosLikeError(err: any): err is { response?: { status?: number }; status?: number } {
  return typeof err === "object" && err !== null && ("response" in err || "status" in err);
}

export function useMyFriends(): UseMyFriendsResult {
  const [friends, setFriends] = useState<TFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userId = CurrentUser?.userId;
  const isLoggedIn = userId != null && Number(userId) > 0;

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }
    const state = { cancelled: false };
    void (async () => {
      trackCounter("GetMyFriends_API", { status: "Throughput" });
      try {
        const result = await friendsService.getFriends(Number(userId), true);
        trackCounter("GetMyFriends_API", { status: "200" });
        if (!state.cancelled) setFriends(result);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        captureException(err);
        if (isAxiosLikeError(e)) {
          trackCounter("GetMyFriends_API", {
            status: (e.response?.status ?? e.status)?.toString() ?? "UnknownError",
          });
        } else {
          trackCounter("GetMyFriends_API", { status: "UnknownError" });
        }
        if (!state.cancelled) setError(err);
      } finally {
        if (!state.cancelled) setIsLoading(false);
      }
    })();
    return () => {
      state.cancelled = true;
    };
  }, [isLoggedIn, userId]);

  return { friends, isLoading, error, isLoggedIn };
}

import { useCallback } from "react";
import type { ActionHookResult } from "../../types/actionHookTypes";

const usePendingFriendRequest = (): ActionHookResult => {
  const handler = useCallback(() => {
    console.error("PendingFriendRequest is not actionable");
  }, []);

  return { handler };
};

export default usePendingFriendRequest;

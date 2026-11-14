"use client";

import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";

type RenameFriendsPolicyResponse = {
  connectionsToFriendsRenameEnabled?: boolean;
};

export function useRenameFriendsPolicy(): boolean {
  const renameFriendsPolicyQuery = useQuery({
    queryKey: ["discovery-common/rename-friends-policy"],
    queryFn: async () => {
      const response = await callBehaviour<RenameFriendsPolicyResponse>("web-rename-friends");
      return !(response.connectionsToFriendsRenameEnabled ?? false);
    },
    staleTime: Infinity,
  });

  return renameFriendsPolicyQuery.data ?? false;
}

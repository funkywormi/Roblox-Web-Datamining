import { getGuac } from "./robloxGlobals";

export type RenamePolicyResult = {
  renameFriendsToConnections: boolean;
};

const hasRenameFlag = (
  value: unknown,
): value is {
  connectionsToFriendsRenameEnabled?: boolean;
} => {
  return typeof value === "object" && value !== null;
};

export const getWebFriendsRenamePolicies = async (): Promise<RenamePolicyResult> => {
  const guac = getGuac();

  if (!guac?.callBehaviour) {
    return { renameFriendsToConnections: false };
  }

  try {
    const response = await guac.callBehaviour("web-rename-friends");

    return {
      renameFriendsToConnections: !(hasRenameFlag(response)
        ? (response.connectionsToFriendsRenameEnabled ?? false)
        : false),
    };
  } catch {
    return { renameFriendsToConnections: false };
  }
};

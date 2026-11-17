import type { FriendshipStatus } from "../friendRequestButton/friendshipStatus";

type UserSearchTileCtaState = {
  friendshipStatus: FriendshipStatus | undefined;
  isBlocked: boolean;
};

export function getShouldDisplayUserSearchTileCta(
  state: UserSearchTileCtaState,
): state is UserSearchTileCtaState & { friendshipStatus: FriendshipStatus } {
  return state.friendshipStatus != null && !state.isBlocked;
}

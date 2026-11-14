import Presence from "@rbx/presence";
import type { AnalyticsContext } from "@rbx/sdui-core";
import { SduiFriendRequestButton } from "../../friendRequestButton";
import {
  friendshipStatuses,
  type FriendshipStatus,
} from "../../friendRequestButton/friendshipStatus";
import { IN_GAME_PRESENCE_TYPE } from "../userSearchTileConstants";
import { JoinFriendButton } from "./JoinFriendButton";

type PresenceData = ReturnType<typeof Presence.usePresence>;

export interface UserSearchTileActionProps {
  analyticsContext: AnalyticsContext | undefined;
  friendshipStatus: FriendshipStatus;
  presence: PresenceData;
  source?: string;
  targetUserId: string;
}

export function UserSearchTileAction({
  analyticsContext,
  friendshipStatus,
  presence,
  source,
  targetUserId,
}: UserSearchTileActionProps): React.JSX.Element {
  const universeId =
    typeof presence.universeId === "number" && presence.universeId > 0
      ? presence.universeId
      : undefined;
  const isInGame =
    presence.userPresenceType === IN_GAME_PRESENCE_TYPE &&
    presence.gameId != null &&
    universeId != null;

  return friendshipStatus === friendshipStatuses.friends && isInGame ? (
    <JoinFriendButton targetUserId={targetUserId} universeId={universeId} />
  ) : (
    <SduiFriendRequestButton
      analyticsContext={analyticsContext}
      size="Small"
      source={source}
      userId={targetUserId}
    />
  );
}

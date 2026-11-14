"use client";

import Presence from "@rbx/presence";
import type { AnalyticsContext, SduiResolvedAction } from "@rbx/sdui-core";
import { useSduiTranslateWithFallback } from "@rbx/sdui-core/client";
import { useFriendshipStatus } from "../../friendRequestButton/useFriendshipStatus";
import { getContextText } from "../getContextText";
import { useFollowingStatus } from "../hooks/useFollowingStatus";
import { useRenameFriendsPolicy } from "../hooks/useRenameFriendsPolicy";
import { useUserSearchProfileInsights } from "../hooks/useUserSearchProfileInsights";
import { selectUserSearchContext } from "../userSearchContext";
import { IN_GAME_PRESENCE_TYPE, ONLINE_PRESENCE_TYPES } from "../userSearchTileConstants";
import { BaseUserSearchTile } from "./BaseUserSearchTile";
import { UserSearchTileAction } from "./UserSearchTileAction";

export interface AuthenticatedUserSearchTileProps {
  analyticsContext?: AnalyticsContext;
  displayName?: string;
  image?: string;
  isPreviousUsernameMatch?: boolean;
  name?: string;
  onActivated?: SduiResolvedAction;
  source?: string;
  targetUserId: string;
}

export function AuthenticatedUserSearchTile({
  analyticsContext,
  displayName,
  image,
  isPreviousUsernameMatch = false,
  name,
  onActivated,
  source,
  targetUserId,
}: AuthenticatedUserSearchTileProps): React.JSX.Element {
  const translate = useSduiTranslateWithFallback();
  const targetUserIdNumber = Number(targetUserId);
  const presence = Presence.usePresence(targetUserIdNumber, undefined);
  const { friendshipStatus } = useFriendshipStatus(targetUserId);
  const isFollowing = useFollowingStatus(targetUserIdNumber);
  const profileInsights = useUserSearchProfileInsights(targetUserIdNumber);
  const renameFriendsToConnections = useRenameFriendsPolicy();
  const isInGame = presence.userPresenceType === IN_GAME_PRESENCE_TYPE;
  const userSearchContext = selectUserSearchContext({
    friendshipStatus,
    isFollowing,
    isInGame,
    isPreviousUsernameMatch,
    isSelf: false,
    lastLocation: presence.lastLocation,
    profileInsights,
    renameFriendsToConnections,
  });

  return (
    <BaseUserSearchTile
      analyticsContext={analyticsContext}
      contextText={getContextText(translate, userSearchContext)}
      displayName={displayName}
      image={image}
      isOnline={ONLINE_PRESENCE_TYPES.has(presence.userPresenceType)}
      name={name}
      onActivated={onActivated}
      actionComponent={
        <UserSearchTileAction
          analyticsContext={analyticsContext}
          friendshipStatus={friendshipStatus}
          presence={presence}
          source={source}
          targetUserId={targetUserId}
        />
      }
    />
  );
}

"use client";

import { useCallback, type MouseEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { IconButton } from "@rbx/foundation-ui";
import { followFriendIntoGame } from "@rbx/friends-common/utils";
import { PlayabilityStatus, usePlayabilityStatus } from "@rbx/game-play-button";
import { useSduiTranslateWithFallback } from "@rbx/sdui-core/client";
import { withJoinAttemptId } from "@rbx/www-common/game-launch";

export interface JoinFriendButtonProps {
  targetUserId: string;
  universeId: number;
}

export function JoinFriendButton({
  targetUserId,
  universeId,
}: JoinFriendButtonProps): React.JSX.Element | null {
  const translate = useSduiTranslateWithFallback();
  const { playabilityStatus } = usePlayabilityStatus(String(universeId));
  const { isPending: isJoiningFriend, mutate: joinFriendIntoGame } = useMutation({
    mutationFn: followFriendIntoGame,
  });
  const joinFriend = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const { joinAttemptId } = withJoinAttemptId({ userId: targetUserId }, undefined, "JoinUser");
      joinFriendIntoGame({ friendUserId: targetUserId, joinAttemptId });
    },
    [joinFriendIntoGame, targetUserId],
  );

  console.log("test");
  if (playabilityStatus !== PlayabilityStatus.Playable) {
    return null;
  }

  return (
    <IconButton
      as="button"
      ariaLabel={translate("Action.JoinGame", "Join game")}
      className="bg-system-success"
      icon="icon-regular-play-large"
      isCircular
      // TODO: Replace isDisabled with isLoading once Foundation IconButton supports it.
      isDisabled={isJoiningFriend}
      onClick={joinFriend}
      size="Small"
      variant="Emphasis"
    />
  );
}

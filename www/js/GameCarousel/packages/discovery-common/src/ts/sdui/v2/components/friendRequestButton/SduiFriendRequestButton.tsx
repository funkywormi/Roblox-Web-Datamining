"use client";

import { useCallback, type MouseEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconButton, type TIconButtonSize } from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps } from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import { publishFriendRequestResult } from "./friendRequestResultEvents";
import { startFriendRequest } from "./friendshipService";
import { friendshipStatuses, type FriendshipStatus } from "./friendshipStatus";
import { friendshipStatusQueryKey, useFriendshipStatus } from "./useFriendshipStatus";
import { reportPlayerFriendAdd } from "./reportPlayerFriendAdd";

const ADD_FRIEND_TRANSLATION_KEY = "Action.AddFriend";
const ADD_FRIEND_FALLBACK_TEXT = "Add friend";
const DEFAULT_BUTTON_SIZE: TIconButtonSize = "Small";

function normalizeButtonSize(size: string | undefined): TIconButtonSize {
  return size === "Medium" || size === "Large" ? size : DEFAULT_BUTTON_SIZE;
}

export interface SduiFriendRequestButtonProps extends SduiRendererInjectedProps {
  size?: string;
  source?: string;
  userId?: string;
}

export function SduiFriendRequestButton({
  analyticsContext,
  size,
  source,
  userId,
}: SduiFriendRequestButtonProps) {
  const services = useSduiServices();
  const queryClient = useQueryClient();
  const { friendshipStatus, isFriendshipStatusLoading, isSelf, targetUserId, viewerUserId } =
    useFriendshipStatus(userId);

  const isPendingFriendship =
    friendshipStatus === friendshipStatuses.requestSent ||
    friendshipStatus === friendshipStatuses.requestReceived;
  const isButtonDisabled = isPendingFriendship;
  const handleFriendRequest = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (
        targetUserId == null ||
        viewerUserId == null ||
        friendshipStatus !== friendshipStatuses.notFriends ||
        isButtonDisabled
      ) {
        return;
      }

      const friendRequestStart = startFriendRequest(targetUserId, source);
      if (!friendRequestStart.didStart) {
        return;
      }

      const requestFriendshipStatusQueryKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      queryClient.setQueryData(requestFriendshipStatusQueryKey, friendshipStatuses.requestSent);
      reportPlayerFriendAdd({
        analyticsContext,
        analyticsReporter: services.analyticsReporter,
        pageContext: services.pageContext,
        targetUserId,
      });

      // The service owns cross-component deduplication; completion only updates its exact cache entry.
      // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation
      void friendRequestStart.requestCompletion.then(
        status => {
          if (status === "already-friends") {
            queryClient.setQueryData(requestFriendshipStatusQueryKey, friendshipStatuses.friends);
            return;
          }
          publishFriendRequestResult("success");
        },
        () => {
          queryClient.setQueryData<FriendshipStatus | undefined>(
            requestFriendshipStatusQueryKey,
            currentFriendshipStatus =>
              currentFriendshipStatus === friendshipStatuses.requestSent
                ? friendshipStatus
                : currentFriendshipStatus,
          );
          publishFriendRequestResult("failure");
        },
      );
    },
    [
      analyticsContext,
      friendshipStatus,
      isButtonDisabled,
      queryClient,
      services.analyticsReporter,
      services.pageContext,
      source,
      targetUserId,
      viewerUserId,
    ],
  );
  const stopTileActivation = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  if (
    targetUserId == null ||
    isSelf ||
    isFriendshipStatusLoading ||
    friendshipStatus == null ||
    friendshipStatus === friendshipStatuses.friends
  ) {
    return null;
  }

  const translatedLabel = services.translate?.(ADD_FRIEND_TRANSLATION_KEY);
  const accessibleLabel =
    translatedLabel == null || translatedLabel.length === 0
      ? ADD_FRIEND_FALLBACK_TEXT
      : translatedLabel;

  return (
    <div
      className="relative inline-flex pointer-events-auto"
      data-testid="sdui-friend-request-button"
    >
      <IconButton
        as="button"
        icon="icon-regular-plus-large"
        ariaLabel={accessibleLabel}
        variant="OverMedia"
        size={normalizeButtonSize(size)}
        isCircular
        isDisabled={isButtonDisabled}
        onClick={handleFriendRequest}
      />
      {isButtonDisabled ? (
        <button
          type="button"
          aria-hidden="true"
          className="absolute inset-[0px] [border:0] [background:transparent] [padding:0]"
          data-testid="sdui-friend-request-click-sink"
          tabIndex={-1}
          onClick={stopTileActivation}
        />
      ) : null}
    </div>
  );
}

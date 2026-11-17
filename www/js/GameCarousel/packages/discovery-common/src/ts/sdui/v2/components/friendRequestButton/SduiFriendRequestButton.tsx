"use client";

import { useCallback, type MouseEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconButton, type TIconButtonSize } from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps } from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import type { UserId } from "@rbx/www-common/user";
import { publishFriendRequestResult } from "./friendRequestResultEvents";
import {
  startAcceptFriendRequest,
  startFriendRequest,
  type FriendRequestResult,
} from "./friendshipService";
import { friendshipStatuses, type FriendshipStatus } from "./friendshipStatus";
import { friendshipStatusQueryKey, useFriendshipStatus } from "./useFriendshipStatus";
import { reportPlayerFriendAccept, reportPlayerFriendAdd } from "./reportPlayerFriendAdd";

const ADD_FRIEND_TRANSLATION_KEY = "Action.AddFriend";
const ADD_FRIEND_FALLBACK_TEXT = "Add friend";
const ACCEPT_FRIEND_TRANSLATION_KEY = "Action.AcceptRequest";
const ACCEPT_FRIEND_FALLBACK_TEXT = "Accept friend request";
const DEFAULT_BUTTON_SIZE: TIconButtonSize = "Small";

function normalizeButtonSize(size: string | undefined): TIconButtonSize {
  return size === "Medium" || size === "Large" ? size : DEFAULT_BUTTON_SIZE;
}

export interface SduiFriendRequestButtonProps extends SduiRendererInjectedProps {
  size?: string;
  source?: string;
  userId?: string;
}

type FriendRequestAcceptanceMutation = {
  requestCompletion: Promise<FriendRequestResult>;
  targetUserId: UserId;
  viewerUserId: UserId;
};

export function SduiFriendRequestButton({
  analyticsContext,
  size,
  source,
  userId,
}: SduiFriendRequestButtonProps) {
  const services = useSduiServices();
  const queryClient = useQueryClient();
  const { mutate: trackFriendRequestAcceptance } = useMutation({
    mutationFn: ({ requestCompletion }: FriendRequestAcceptanceMutation) => requestCompletion,
    onSuccess: () => {
      publishFriendRequestResult({
        result: "success",
        type: "friend-request-accepted",
      });
    },
    onError: (_error, { targetUserId, viewerUserId }: FriendRequestAcceptanceMutation) => {
      const friendshipStatusCacheKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      queryClient.setQueryData<FriendshipStatus | undefined>(
        friendshipStatusCacheKey,
        currentFriendshipStatus =>
          currentFriendshipStatus === friendshipStatuses.friends
            ? friendshipStatuses.requestReceived
            : currentFriendshipStatus,
      );
      publishFriendRequestResult({
        result: "failure",
        type: "friend-request-accepted",
      });
      return queryClient.invalidateQueries({ queryKey: friendshipStatusCacheKey });
    },
  });
  const { friendshipStatus, isFriendshipStatusLoading, isSelf, targetUserId, viewerUserId } =
    useFriendshipStatus(userId);

  const isFriendRequestReceived = friendshipStatus === friendshipStatuses.requestReceived;
  const isButtonDisabled = friendshipStatus === friendshipStatuses.requestSent;
  const handleFriendRequest = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (targetUserId == null || viewerUserId == null || isButtonDisabled) {
        return;
      }

      const friendshipStatusCacheKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      if (friendshipStatus === friendshipStatuses.requestReceived) {
        const friendRequestAcceptance = startAcceptFriendRequest(targetUserId);
        if (!friendRequestAcceptance.didStart) {
          return;
        }

        queryClient.setQueryData(friendshipStatusCacheKey, friendshipStatuses.friends);
        reportPlayerFriendAccept({
          analyticsContext,
          analyticsReporter: services.analyticsReporter,
          pageContext: services.pageContext,
          targetUserId,
        });
        trackFriendRequestAcceptance({
          requestCompletion: friendRequestAcceptance.requestCompletion,
          targetUserId,
          viewerUserId,
        });
        return;
      }

      if (friendshipStatus !== friendshipStatuses.notFriends) {
        return;
      }

      const friendRequestStart = startFriendRequest(targetUserId, source);
      if (!friendRequestStart.didStart) {
        return;
      }

      queryClient.setQueryData(friendshipStatusCacheKey, friendshipStatuses.requestSent);
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
            queryClient.setQueryData(friendshipStatusCacheKey, friendshipStatuses.friends);
            return;
          }
          publishFriendRequestResult({
            result: "success",
            type: "friend-request-sent",
          });
        },
        () => {
          queryClient.setQueryData<FriendshipStatus | undefined>(
            friendshipStatusCacheKey,
            currentFriendshipStatus =>
              currentFriendshipStatus === friendshipStatuses.requestSent
                ? friendshipStatus
                : currentFriendshipStatus,
          );
          publishFriendRequestResult({
            result: "failure",
            type: "friend-request-sent",
          });
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
      trackFriendRequestAcceptance,
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

  const translationKey = isFriendRequestReceived
    ? ACCEPT_FRIEND_TRANSLATION_KEY
    : ADD_FRIEND_TRANSLATION_KEY;
  const fallbackText = isFriendRequestReceived
    ? ACCEPT_FRIEND_FALLBACK_TEXT
    : ADD_FRIEND_FALLBACK_TEXT;
  const translatedLabel = services.translate?.(translationKey);
  const accessibleLabel =
    translatedLabel == null || translatedLabel.length === 0 ? fallbackText : translatedLabel;

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

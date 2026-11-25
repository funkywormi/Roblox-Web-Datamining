"use client";

import { useCallback, type MouseEvent } from "react";
import { onlineManager, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconButton, type TIconButtonSize } from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps } from "@rbx/sdui-core";
import { useSduiServices } from "@rbx/sdui-core/client";
import type { UserId } from "@rbx/www-common/user";
import { publishFriendRequestResult } from "./friendRequestResultEvents";
import { startAcceptFriendRequest, startFriendRequest } from "./friendshipService";
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

class OfflineFriendRequestError extends Error {}

type FriendRequestMutation = {
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
    onMutate: async ({ targetUserId, viewerUserId }: FriendRequestMutation) => {
      if (!onlineManager.isOnline()) {
        throw new OfflineFriendRequestError("Cannot accept a friend request while offline.");
      }
      const queryKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      await queryClient.cancelQueries({ queryKey });
      const previousStatus = queryClient.getQueryData<FriendshipStatus>(queryKey);
      queryClient.setQueryData(queryKey, friendshipStatuses.friends);
      return { previousStatus };
    },
    mutationFn: ({ targetUserId }: FriendRequestMutation) => {
      const request = startAcceptFriendRequest(targetUserId);
      if (request.didStart) {
        reportPlayerFriendAccept({
          analyticsContext,
          analyticsReporter: services.analyticsReporter,
          pageContext: services.pageContext,
          targetUserId,
        });
      }
      return request.requestCompletion;
    },
    onSuccess: () => {
      publishFriendRequestResult({
        result: "success",
        type: "friend-request-accepted",
      });
    },
    onError: (error, { targetUserId, viewerUserId }: FriendRequestMutation, context) => {
      const friendshipStatusCacheKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      queryClient.setQueryData<FriendshipStatus | undefined>(
        friendshipStatusCacheKey,
        currentFriendshipStatus =>
          context != null && currentFriendshipStatus === friendshipStatuses.friends
            ? context.previousStatus
            : currentFriendshipStatus,
      );
      publishFriendRequestResult({
        result: "failure",
        ...(error instanceof OfflineFriendRequestError && {
          reason: "offline",
        }),
        type: "friend-request-accepted",
      });
      return queryClient.invalidateQueries({ queryKey: friendshipStatusCacheKey });
    },
  });
  const { mutate: trackFriendRequestSent } = useMutation({
    onMutate: async ({ targetUserId, viewerUserId }: FriendRequestMutation) => {
      if (!onlineManager.isOnline()) {
        throw new OfflineFriendRequestError("Cannot send a friend request while offline.");
      }
      const queryKey = friendshipStatusQueryKey(viewerUserId, targetUserId);
      await queryClient.cancelQueries({ queryKey });
      const previousStatus = queryClient.getQueryData<FriendshipStatus>(queryKey);
      queryClient.setQueryData(queryKey, friendshipStatuses.requestSent);
      return { previousStatus };
    },
    mutationFn: ({ targetUserId }: FriendRequestMutation) => {
      const request = startFriendRequest(targetUserId, source);
      if (request.didStart) {
        reportPlayerFriendAdd({
          analyticsContext,
          analyticsReporter: services.analyticsReporter,
          pageContext: services.pageContext,
          targetUserId,
        });
      }
      return request.requestCompletion;
    },
    onSuccess: (status, { targetUserId, viewerUserId }: FriendRequestMutation) => {
      if (status === "already-friends") {
        queryClient.setQueryData(
          friendshipStatusQueryKey(viewerUserId, targetUserId),
          friendshipStatuses.friends,
        );
        return;
      }
      publishFriendRequestResult({
        result: "success",
        type: "friend-request-sent",
      });
    },
    onError: (error, { targetUserId, viewerUserId }: FriendRequestMutation, context) => {
      queryClient.setQueryData<FriendshipStatus | undefined>(
        friendshipStatusQueryKey(viewerUserId, targetUserId),
        currentFriendshipStatus =>
          context != null && currentFriendshipStatus === friendshipStatuses.requestSent
            ? context.previousStatus
            : currentFriendshipStatus,
      );
      publishFriendRequestResult({
        result: "failure",
        ...(error instanceof OfflineFriendRequestError && {
          reason: "offline",
        }),
        type: "friend-request-sent",
      });
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

      if (friendshipStatus === friendshipStatuses.requestReceived) {
        trackFriendRequestAcceptance({
          targetUserId,
          viewerUserId,
        });
        return;
      }

      if (friendshipStatus !== friendshipStatuses.notFriends) {
        return;
      }

      trackFriendRequestSent({
        targetUserId,
        viewerUserId,
      });
    },
    [
      friendshipStatus,
      isButtonDisabled,
      targetUserId,
      trackFriendRequestSent,
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

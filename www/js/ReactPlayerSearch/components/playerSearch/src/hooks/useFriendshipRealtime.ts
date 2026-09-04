import { useEffect } from "react";
import { friendshipStatuses, type FriendshipStatus } from "../constants/friendshipStatus";
import { getCurrentUser, getRealTimeClient } from "../services/robloxGlobals";

const friendshipNotificationType = "FriendshipNotifications";

const friendshipEventTypes = {
  requested: "FriendshipRequested",
  created: "FriendshipCreated",
  destroyed: "FriendshipDestroyed",
} as const;

type FriendshipEvent = {
  type: string;
  userId1: number;
  userId2: number;
};

const parseFriendshipEvent = (payload: unknown): FriendshipEvent | null => {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const type: unknown = Reflect.get(payload, "Type");
  const eventArgs: unknown = Reflect.get(payload, "EventArgs");

  if (typeof type !== "string" || typeof eventArgs !== "object" || eventArgs === null) {
    return null;
  }

  const userId1: unknown = Reflect.get(eventArgs, "UserId1");
  const userId2: unknown = Reflect.get(eventArgs, "UserId2");

  if (typeof userId1 !== "number" || typeof userId2 !== "number") {
    return null;
  }

  return { type, userId1, userId2 };
};

const getNextFriendshipStatus = (
  eventType: string,
  isIncoming: boolean,
): FriendshipStatus | null => {
  switch (eventType) {
    case friendshipEventTypes.requested:
      return isIncoming ? friendshipStatuses.requestReceived : friendshipStatuses.requestSent;
    case friendshipEventTypes.created:
      return friendshipStatuses.friends;
    case friendshipEventTypes.destroyed:
      return friendshipStatuses.notFriends;
    default:
      return null;
  }
};

type TransitionFriendshipState = (
  targetId: number,
  initiatorId: number,
  nextState: FriendshipStatus,
) => void;

export const useFriendshipRealtime = (transitionFriendshipState: TransitionFriendshipState) => {
  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser.isAuthenticated) {
      return;
    }

    const realTimeClient = getRealTimeClient();

    if (!realTimeClient?.Subscribe) {
      console.error("playerSearch: no realtime client, friendship cards will not update live");

      return;
    }

    const currentUserId = Number(currentUser.userId);

    const handleNotification = (payload: unknown) => {
      const event = parseFriendshipEvent(payload);

      if (!event) {
        console.error("playerSearch: unrecognised FriendshipNotifications payload", payload);

        return;
      }

      const { userId1: fromUserId, userId2: toUserId } = event;

      if (fromUserId !== currentUserId && toUserId !== currentUserId) {
        return;
      }

      const otherUserId = fromUserId === currentUserId ? toUserId : fromUserId;
      const nextState = getNextFriendshipStatus(event.type, toUserId === currentUserId);

      if (!nextState) {
        console.error(
          "playerSearch: FriendshipNotifications type maps to no card state, ignoring it",
          event.type,
        );

        return;
      }

      transitionFriendshipState(currentUserId, otherUserId, nextState);
    };

    realTimeClient.Subscribe(friendshipNotificationType, handleNotification);

    return () => {
      realTimeClient.Unsubscribe?.(friendshipNotificationType, handleNotification);
    };
  }, [transitionFriendshipState]);
};

export const friendshipStatuses = {
  notFriends: "NotFriends",
  friends: "Friends",
  requestSent: "RequestSent",
  requestReceived: "RequestReceived",
} as const;

export type FriendshipStatus = (typeof friendshipStatuses)[keyof typeof friendshipStatuses];

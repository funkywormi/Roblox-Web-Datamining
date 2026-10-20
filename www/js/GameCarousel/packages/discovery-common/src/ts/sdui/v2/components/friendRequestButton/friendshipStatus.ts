export const friendshipStatuses = {
  friends: "Friends",
  notFriends: "NotFriends",
  requestReceived: "RequestReceived",
  requestSent: "RequestSent",
} as const;

export type FriendshipStatus = (typeof friendshipStatuses)[keyof typeof friendshipStatuses];

export function isFriendshipStatus(value: unknown): value is FriendshipStatus {
  return Object.values(friendshipStatuses).some(status => status === value);
}

import { Action } from "@rbx/profile-platform";

export enum FriendStatus {
  Self = "self",
  NotFriends = "nonfriend",
  Friends = "friend",
  RequestSent = "requestSent",
  RequestReceived = "requestReceived",
  Ineligible = "ineligible",
  Unknown = "unknown",
}

const getFriendStatusFromPrimaryAction = (
  primaryAction: Action | undefined,
  isSelf: boolean,
): FriendStatus => {
  if (isSelf) {
    return FriendStatus.Self;
  }
  if (!primaryAction) {
    return FriendStatus.Unknown;
  }
  if ([Action.Chat, Action.JoinExperience, Action.EditAlias].includes(primaryAction)) {
    return FriendStatus.Friends;
  }
  if (primaryAction === Action.PendingFriendRequest) {
    return FriendStatus.RequestSent;
  }
  if (primaryAction === Action.AcceptFriendRequest) {
    return FriendStatus.RequestReceived;
  }
  if (primaryAction === Action.Unfriend) {
    return FriendStatus.Ineligible;
  }
  return FriendStatus.NotFriends;
};

export default getFriendStatusFromPrimaryAction;

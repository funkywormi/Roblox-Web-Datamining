export enum FindFriendsUserSort {
  FriendScore = "FriendScore",
  Created = "Created",
}

export enum FindFriendsTypes {
  Friends = "FindFriends",
  TrustedFriends = "FindTrustedFriends",
}

export enum FriendFilterType {
  All = "all",
  Trusted = "trusted",
}

export type TFindFriendsRequest = {
  userId: number;
  userSort: FindFriendsUserSort;
  cursor?: string;
  limit?: number;
  findFriendsType: FindFriendsTypes;
};

export type TFriendResponse = {
  id: number;
  hasVerifiedBadge: boolean;
};

export type TFindFriendsResponse = {
  PreviousCursor?: string;
  PageItems: TFriendResponse[];
  NextCursor?: string;
  HasMore?: boolean;
};

export type TFriendsCountResponse = {
  count: number;
};

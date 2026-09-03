export enum ContextType {
  None = 'None',
  AccountDeleted = 'AccountDeleted',
  Presence = 'Presence',
  IsYourself = 'IsYourself',
  PreviousUsername = 'PreviousUsername',
  YouAreFollowing = 'YouAreFollowing',
  FollowsYou = 'FollowsYou',
  MutualFriends = 'MutualFriends',
  PlayedTogether = 'PlayedTogether',
  OffNetworkFriendRequest = 'OffNetworkFriendRequest',
  SentFromQrCode = 'SentFromQrCode',
  SentFromExperience = 'SentFromExperience'
}

export enum FriendshipStatus {
  Invalid = 'Invalid',
  None = 'None',
  RequestSent = 'RequestSent',
  RequestReceived = 'RequestReceived',
  Friends = 'Friends',
  Self = 'Self'
}

export enum TrustedFriendStatus {
  Invalid = 'Invalid',
  Self = 'Self',
  TrustedFriends = 'TrustedFriends',
  RequestSent = 'RequestSent',
  RequestReceived = 'RequestReceived',
  NotEligible = 'NotEligible',
  Eligible = 'Eligible'
}

export enum EditNameField {
  Alias = 'Alias',
  DisplayName = 'DisplayName'
}

export interface Counts {
  friendsCount: number;
  followersCount: number;
  followingsCount: number;
  isFriendsCountEnabled: boolean;
  isFollowersCountEnabled: boolean;
  isFollowingsCountEnabled: boolean;
}

export interface Names {
  primaryName: string;
  username: string;
  displayName: string;
}

export interface MutualFriendsContext {
  mutualFriends: number[];
  mutualFriendsCount: number;
}

export interface SentFromExperienceContext {
  sourceUniverseId: number;
}

export interface ContextDetails {
  MutualFriends?: MutualFriendsContext;
  SentFromExperience?: SentFromExperienceContext;
}

export interface ContextualInformation {
  context: ContextType;
  contextDetails?: ContextDetails;
}

export interface EditName {
  field: EditNameField;
  value: string;
  isEdited: boolean;
}

export interface UserProfileSettings {
  isInExperienceNameEnabled: boolean;
  inExperienceName?: string | null;
  inExperienceNameExpirationTime?: number | null;
}

export interface ViewerRelationship {
  friendshipStatus: FriendshipStatus;
  trustedFriendStatus: TrustedFriendStatus;
}
export interface UserProfileHeader {
  userId: number;
  isPremium: boolean;
  isRobloxPlus?: boolean;
  isVerified: boolean;
  counts: Counts;
  names: Names;
  contextualInformation: ContextualInformation;
  editName: EditName;
  userProfileSettings?: UserProfileSettings;
  isRobloxAdmin: boolean;
  viewerRelationship: ViewerRelationship;
}

import { SeamlessVoiceStatus } from "../index";

export type TVoiceSettingsBody = {
  isVerifiedForVoice: boolean;
  isUserOptIn: boolean;
  isVoiceChatEnabled: boolean;
  isOptInDisabled: boolean;
  isAvatarVideoOptIn: boolean;
  isAvatarVideoEnabled: boolean;
  isAvatarVideoOptInDisabled: boolean;
  isAvatarVideoEligible: boolean;
  isBanned: boolean;
  seamlessVoiceStatus: SeamlessVoiceStatus;
  allowVoiceDataUsage: boolean;
};

export enum BlockedUserFilterType {
  All = "all",
  Child = "child",
  Parent = "parent",
}

export type TBlockedUsersResponse = {
  data: TBlockedUsersBody;
  error: string;
};

export enum TBlockManagerType {
  Parent = "Parent",
  Blocker = "Blocker",
  Unspecified = "Unspecified",
}

export type TUnblockUserRequest = {
  blockedUser: TBlockedUser;
  ignoreBlockManagerType: boolean;
};

export type TBlockedUser = {
  blockedUserId: number;
  blockManagerType: TBlockManagerType;
};

export type TBlockedUsersBody = {
  cursor: string;
  blockedUsers: TBlockedUser[];
};

export type TBlockedUsersProps = {
  cursor?: string;
  childUserId?: number;
  count?: number;
  managerTypeFilter?: TBlockManagerType;
};

export type TGetBlockedExperiencesRequest = {
  limit?: number;
  offset?: number;
  targetUserId: number;
};

export type TBlockedExperience = {
  universeId: number;
  actorType: TBlockManagerType;
};

export type TBlockedExperiencesResponse = {
  blockedExperiences: TBlockedExperience[];
};

export type TApprovedExperience = {
  universeId: number;
};

export type TApprovedExperiencesResponse = {
  approvedExperiences: TApprovedExperience[];
};

export type TGetApprovedExperiencesRequest = {
  limit?: number;
  offset?: number;
  targetUserId: number;
};

export type BlockedUsersQueryParams = {
  cursor: string;
  count: number;
  childUserId?: number;
  managerTypeFilter?: TBlockManagerType;
};

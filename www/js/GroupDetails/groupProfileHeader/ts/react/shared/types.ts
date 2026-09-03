import { Document } from '@rbx/richtext';

interface User {
  hasVerifiedBadge: boolean;
  userId: number;
  username: string;
  displayName: string;
}

interface UserData {
  id: number;
  hasVerifiedBadge: boolean;
  displayName: string;
  name: string;
}

interface UserResponse {
  data: UserData[];
}

const RoleColorValues = {
  Invalid: 0,
  Blue: 1,
  Green: 2,
  Purple: 3,
  Yellow: 4,
  Orange: 5,
  Red: 6,
  Magenta: 7,
  Teal: 8,
  Turquoise: 9,
  Rust: 10,
  Pistachio: 11,
  Midnight: 12,
  Lavender: 13,
  Pink: 14,
  Crimson: 15,
  Plum: 16
} as const;

export type RoleColors = typeof RoleColorValues[keyof typeof RoleColorValues];

interface Role {
  id: number;
  name: string;
  rank: number;
  memberCount?: number;
  description?: string;
  isBase?: boolean;
  color?: RoleColors;
  isPrivate?: boolean;
}

interface Member {
  user: User;
  role: Role;
}

interface GroupPermissions {
  groupPostsPermissions: {
    viewWall: boolean;
    postToWall: boolean;
    deleteFromWall: boolean;
    viewStatus: boolean;
    postToStatus: boolean;
  };
  groupMembershipPermissions: {
    changeRank: boolean;
    inviteMembers: boolean;
    removeMembers: boolean;
    banMembers: boolean;
  };
  groupManagementPermissions: {
    manageRelationships: boolean;
    manageClan: boolean;
    viewAuditLogs: boolean;
  };
  groupEconomyPermissions: {
    spendGroupFunds: boolean;
    advertiseGroup: boolean;
    createItems: boolean;
    manageItems: boolean;
    addGroupPlaces: boolean;
    manageGroupGames: boolean;
    viewGroupPayouts: boolean;
    viewAnalytics: boolean;
  };
  groupOpenCloudPermissions: {
    useCloudAuthentication: boolean;
    administerCloudAuthentication: boolean;
  };
  groupForumsPermissions: {
    manageCategories: boolean;
    createPosts: boolean;
    removePosts: boolean;
    lockPosts: boolean;
    pinPosts: boolean;
    createComments: boolean;
    removeComments: boolean;
    createBugReports?: boolean;
  };
  groupContentModerationPermissions: {
    manageKeywordBlockList: boolean;
    viewKeywordBlockList: boolean;
  };
}

interface GroupChannelPermissions {
  channelId: string;
  groupForumsPermissions: {
    manageCategories: boolean;
    createPosts: boolean;
    removePosts: boolean;
    lockPosts: boolean;
    pinPosts: boolean;
    createComments: boolean;
    removeComments: boolean;
    createBugReports?: boolean;
  };
}

interface Group {
  permissions?: GroupPermissions;
  id: number;
  name: string;
  publicEntryAllowed?: boolean;
  owner?: User;
  role?: Role;
  description?: string;
  memberCount?: number;
  previousName?: string;
  hasVerifiedBadge?: boolean;
}

interface GroupMembership {
  groupId: number;
  isPrimary: boolean;
  isPendingJoin: boolean;
  userRole: {
    user: {
      hasVerifiedBadge: boolean;
      userId: number;
      username: string;
      displayName: string;
    };
    role: {
      id: number;
      name: string;
      rank: number;
    };
  };
  permissions: GroupPermissions;
  areGroupGamesVisible: boolean;
  areGroupFundsVisible: boolean;
  areEnemiesAllowed: boolean;
  canViewMemberList?: boolean;
  isNotificationsEnabled: boolean | undefined;
}

interface GroupJoinRequest {
  requester: User;
  created: string;
}

interface Emote {
  id: string;
  name: string;
}

interface EmoteSet {
  id: string;
  name: string;
  emotes: Emote[];
}

interface EmoteDisplay {
  id: string;
  name: string;
  url: string;
}

interface EmoteContextState {
  isLoading: boolean;
  errorLoading: boolean;
  emoteList: EmoteDisplay[];
  getEmoteById: (emoteId: string) => EmoteDisplay | undefined;
}

interface Reaction {
  emoteId: string;
  reactionCount: number;
  hasUserAppliedReaction: boolean;
  areReactionCountsVisible: boolean;
}

interface GroupMetadata {
  canEnableGroupNotifications: boolean;
}

interface GroupConfiguration {
  emblemId: number;
  coverPhotoId?: number;
}

export interface ConfigureGroupPolicies {
  displayForumCategoryPermissionsConfiguration?: boolean;
}

interface GroupConfigurationMetadata {
  roleConfiguration: {
    cost: number;
    descriptionMaxLength: number;
    limit: number;
    maxRank: number;
    minRank: number;
    nameMaxLength: number;
  };
  groupConfiguration: {
    nameMaxLength: number;
    descriptionMaxLength: number;
    iconMaxFileSizeMb: number;
    coverPhotoMaxFileSizeMb: number;
    validCoverPhotoDimensions: string;
    cost: number;
  };
  groupNameChangeConfiguration: {
    cost: number;
    cooldownInDays: number;
    ownershipCooldownInDays: number;
  };
}

interface PermissionConfigurationState {
  isEnabled: boolean;
  canEdit: boolean;
}

interface GroupRolePermissions {
  groupId: number;
  role: Role;
  permissions: GroupPermissions;
}

export type AssignedRole = {
  id: number;
  name: string;
  priority?: number;
  isBase?: boolean;
  color?: RoleColors;
  isPrivate?: boolean;
};

export type UserAndRoles = {
  user: User;
  roles: Array<AssignedRole>;
};

export type GetUsersInGroupResponse = {
  data: Array<UserAndRoles>;
  nextPageCursor?: string;
  previousPageCursor?: string;
};

export type SearchUsersInGroupResponse = {
  data: Array<UserAndRoles>;
  nextPageCursor: string | null;
  totalResults?: number;
};

export interface GroupBasicResponse {
  id: number;
  name: string;
  memberCount: number;
  hasVerifiedBadge: boolean;
}

export interface GroupRoleBasicResponse {
  id: number;
  name: string;
  rank: number;
}

export interface GroupMembershipDetailResponse {
  group: GroupBasicResponse;
  role: GroupRoleBasicResponse;
}

export interface GroupMembershipResponse {
  data: GroupMembershipDetailResponse[];
}

interface ModerateUserPermissionsState {
  canDeleteAllPosts: boolean;
  canKickUser: (authorId: number) => boolean;
  canBanUser: (authorId: number) => boolean;
  canBlockUser: (authorId: number) => boolean;
}

export interface ModerateDialogState {
  groupId?: number;
  userId?: number;
  categoryId?: string;
  postId?: string;
  threadId?: string;
  commentId?: string;
  type?: 'ban' | 'kick' | 'block' | 'hidePost' | 'hideComment' | 'deletePost' | 'deleteComment';
  isReply?: boolean;
  showPreventSimilar?: boolean;
  onDeletePosts?: () => Promise<void> | void;
  onModerationSuccess?: () => Promise<void> | void;
  onHideSuccess?: () => Promise<void> | void;
  onConfirmDelete?: (preventSimilar: boolean) => Promise<void> | void;
}

export interface ModerateDialogContextValue {
  dialogState: ModerateDialogState;
  openBanDialog: ({
    groupId,
    userId,
    onDeletePosts,
    onModerationSuccess
  }: {
    groupId: number;
    userId: number;
    onDeletePosts?: () => Promise<void> | void;
    onModerationSuccess?: () => Promise<void> | void;
  }) => void;
  openKickDialog: ({
    groupId,
    userId,
    onDeletePosts,
    onModerationSuccess
  }: {
    groupId: number;
    userId: number;
    onDeletePosts?: () => Promise<void> | void;
    onModerationSuccess?: () => Promise<void> | void;
  }) => void;
  openBlockDialog: (userId: number) => void;
  openHidePostDialog: ({
    groupId,
    categoryId,
    postId,
    threadId,
    commentId,
    onHideSuccess
  }: {
    groupId: number;
    categoryId: string;
    postId: string;
    threadId: string;
    commentId: string;
    onHideSuccess?: () => Promise<void> | void;
  }) => void;
  openHideCommentDialog: ({
    groupId,
    categoryId,
    postId,
    threadId,
    commentId,
    onHideSuccess
  }: {
    groupId: number;
    categoryId: string;
    postId: string;
    threadId: string;
    commentId: string;
    onHideSuccess?: () => Promise<void> | void;
  }) => void;
  openDeletePostDialog: ({
    showPreventSimilar,
    onConfirmDelete
  }: {
    showPreventSimilar: boolean;
    onConfirmDelete: (preventSimilar: boolean) => Promise<void> | void;
  }) => void;
  openDeleteCommentDialog: ({
    isReply,
    showPreventSimilar,
    onConfirmDelete
  }: {
    isReply: boolean;
    showPreventSimilar: boolean;
    onConfirmDelete: (preventSimilar: boolean) => Promise<void> | void;
  }) => void;
  closeBanDialog: () => void;
  closeKickDialog: () => void;
  closeBlockDialog: () => void;
  closeHideDialog: () => void;
  closeDeleteDialog: () => void;
}
interface MessageContent {
  plainText?: string;
  slate?: Document;
}

interface ServiceError {
  code: number;
  message: string;
  userFacingMessage: string;
}

interface ServiceErrorResponse {
  data?: {
    errors?: Array<ServiceError>;
  };
}
interface CommunityProductFeatures {
  ForumsAgeCheck: boolean;
  ForumsRestrictedCategories: boolean;
  ForumsSearch: boolean;
  RealtimeMessaging: boolean;
  AnnouncementPolls: boolean;
  AnnouncementAnalytics: boolean;
  AnnouncementsRichTextRead: boolean;
  AnnouncementsRichTextWrite: boolean;
  IsOwnerRolesetDeprecated: boolean;
  ForumsAttachmentsCreate: boolean;
  ForumsAttachmentsView: boolean;
  IsUnifiedUIEnabled: boolean;
  /** Gates the Community Tier tab on the configure community page. */
  CommunityTiers: boolean;
  CommunityTiersDisclosureBanner: boolean;
  CommunityCompletionCarousel: boolean;
  ForumConcealment: boolean;
  ForumPreventSimilar: boolean;
}

enum CommunityFeatureFreezeName {
  ForumsRead = 'ForumsRead',
  ForumsWrite = 'ForumsWrite'
}

interface CommunityFeatureFreeze {
  feature: CommunityFeatureFreezeName;
  isDisabled: boolean;
  canReenable?: boolean;
}

interface CommunityFeatureFreezesResponse {
  features: CommunityFeatureFreeze[];
}

export {
  Group,
  GroupMembership,
  GroupJoinRequest,
  User,
  UserData,
  UserResponse,
  Role,
  Member,
  GroupPermissions,
  GroupChannelPermissions,
  Emote,
  EmoteDisplay,
  EmoteSet,
  EmoteContextState,
  Reaction,
  GroupMetadata,
  GroupConfiguration,
  GroupConfigurationMetadata,
  GroupRolePermissions,
  PermissionConfigurationState,
  ModerateUserPermissionsState,
  MessageContent,
  ServiceError,
  ServiceErrorResponse,
  CommunityProductFeatures,
  CommunityFeatureFreezeName,
  CommunityFeatureFreeze,
  CommunityFeatureFreezesResponse,
  RoleColorValues
};

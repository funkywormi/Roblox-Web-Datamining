import type { InfiniteData } from '@tanstack/react-query';
import type {
  RobloxGroupsApiResolvedPermissionsForEntityResponse,
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiModelsResponseResolvedPermissionsForEntityPageItemResponse,
  RobloxGroupsApiRolePermissionsForEntityResponse
} from '@rbx/client-groups/v2';
import { MessageContent, GroupRolePermissions, Reaction, Role } from '../shared/types';
import type { SupportTicketAttachment } from './types/supportTicket';

export type { Reaction };

// Moderation mode for a forum category, mirroring the community-channels
// ChannelModerationType proto enum. Unrestricted means posts/comments bypass TextFilter.
export enum ChannelModerationType {
  Invalid = 0,
  Default = 1,
  Unrestricted = 2
}

type PostCommentsKeyTuple = [
  key: string,
  groupId: number,
  categoryId: string,
  postId: string,
  firstCommentId?: string
];

interface Channel {
  id: string;
  groupId: number;
  name: string;
  description: string | null;
  channelType: string;
  parentChannelId?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
  archivedBy: number | null;
  shortId: string;
  rank: number | null;
}
interface ForumCategory extends Channel {
  description: string;
  isRestricted?: boolean;
  moderationType?: ChannelModerationType;
}
interface CommentCreatorInfo {
  displayName: string;
  hasVerifiedBadge: boolean;
  groupRoleName: string;
}

interface ToggleReactionMetadata {
  categoryId: string;
  postId: string;
  isPostComment: boolean;
}

interface ForumComment {
  id: string;
  parentId: string;
  content: MessageContent;
  createdBy: number;
  createdAt: string;
  creatorInfo: CommentCreatorInfo;
  updatedAt: string;
  deletedAt: string | null;
  threadId: string | null;
  reactions: Reaction[];
  replies: ForumComment[];
  notificationPreference?: NotificationPreferenceType;
  threadComments: ForumThreadCommentsResponse | null;
  threadCommentCount: number | null;
  isConcealed?: boolean;
}
interface ForumPost extends Channel {
  categoryId: string;
  name: string;
  isLocked: boolean;
  lockedBy: number | null;
  isPinned: boolean;
  isUnread: boolean;
  lastComment: ForumComment;
  firstComment: ForumComment;
  commentCount: number;
  notificationPreference?: NotificationPreferenceType;
  // Present only when the post carries a bug-report attachment AND the community has the
  // `ForumsAttachmentsView` feature (groups-api strips it otherwise). Drives the status pill.
  supportTicket?: SupportTicketAttachment;
}

interface ForumsResponse<T> {
  data: T[];
  nextPageCursor: string;
  previousPageCursor: string;
}

interface ForumAncestry {
  channelId: string;
  commentId?: string;
  channel: Channel;
  comment?: ForumComment;
}

type ForumPostsResponse = ForumsResponse<ForumPost>;
type ForumCommentsResponse = ForumsResponse<ForumComment>;
type ForumCategoriesResponse = ForumsResponse<ForumCategory>;
type ForumAncestryResponse = ForumsResponse<ForumAncestry>;
type ForumCategoryRolePermissionsResponse = ForumsResponse<GroupRolePermissions>;
type ForumCategoryRolesResponse = ForumsResponse<Role>;
type ResolvedForumCategoryPermissionsResponse = RobloxGroupsApiResolvedPermissionsForEntityResponse;
type ResolvedGroupRolePermissionsPageResponse = RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiModelsResponseResolvedPermissionsForEntityPageItemResponse;
type ForumCategoryRolePermissionResponse = RobloxGroupsApiRolePermissionsForEntityResponse;
interface ForumThreadCommentsResponse {
  comments: ForumComment[];
  nextPageCursor: string;
  previousPageCursor: string;
  hasMore: boolean;
}

interface PostState {
  postCommentsQueryKey: PostCommentsKeyTuple;
  post: ForumPost | null;
  isLoadingPost: boolean;
  loadingPostError: boolean;
  fetchPost: () => Promise<unknown>;
  handleCreateComment: (args: {
    content: MessageContent;
    parentCommentId?: string;
    mentioningReplyId?: string;
  }) => Promise<void>;
  handleEditComment: (args: {
    content: MessageContent;
    parentCommentId?: string;
    commentId: string;
  }) => Promise<void>;
  isLoadingComments: boolean;
  hasNextComments: boolean;
  hasPreviousComments: boolean;
  refetchComments: () => Promise<any>;
  isFetchingNextCommentsPage: boolean;
  isFetchingPreviousCommentsPage: boolean;
  fetchNextCommentsPage: () => void;
  fetchPreviousCommentsPage: () => void;
  fetchPostNotificationPreference: () => void;
  fetchCommentNotificationPreference: (commentId: string) => void;
  togglePostNotifications: () => void;
  toggleCommentNotifications: (commentId: string) => void;
  errorLoadingComments: boolean;
  commentsInfiniteData: InfiniteData<ForumCommentsResponse> | undefined;
  comments: ForumComment[];
  getComment: (commentId: string, parentCommentId?: string) => ForumComment | null;
  handleDeleteComment: (
    commentId: string,
    parentCommentId?: string,
    preventSimilar?: boolean
  ) => Promise<boolean>;
  removeComment: (commentId: string) => void;
}

interface ForumPermissionsState {
  canCreatePost: boolean;
  canCreatePostInCategory: (categoryId: string) => boolean;
  canAttachSupportTicketInCategory: (categoryId: string) => boolean;
  canCreateComment: boolean;
  canPinPost: boolean;
  canLockPost: (post: ForumPost) => boolean;
  canEditPost: (authorId: number) => boolean;
  canEditComment: (authorId: number) => boolean;
  canDeletePost: (authorId: number) => boolean;
  canDeleteComment: (authorId: number) => boolean;
  canPreventSimilarPost: boolean;
  canPreventSimilarComment: boolean;
  canReact: boolean;
  canSubscribe: (authorId: number) => boolean;
  isGroupMember: boolean;
  canViewMembers: boolean;
}

enum NotificationPreferenceType {
  Invalid = 0,
  None = 1,
  All = 2,
  Personalized = 3,
  StrictPersonalized = 4
}

interface NotificationPreference {
  preference: NotificationPreferenceType;
}

interface ForumNotificationsExperimentConfig {
  isReceived: boolean;
  throttleTimeMs: number;
}

interface ForumExperimentsState {
  subscriberNotificationsExperimentConfig: ForumNotificationsExperimentConfig | null;
  fetchSubscriberExperimentValues: () => void;
}

interface ForumsError {
  code: number;
  message: string;
  userFacingMessage: string;
}

interface ForumsErrorResponse {
  data: {
    errors: Array<ForumsError>;
  };
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  retryAfterSeconds?: number;
}

export {
  PostCommentsKeyTuple,
  ForumCategory,
  ForumCategoriesResponse,
  ForumPostsResponse,
  ForumAncestryResponse,
  ForumPost,
  ToggleReactionMetadata,
  ForumAncestry,
  ForumComment,
  CommentCreatorInfo,
  ForumCommentsResponse,
  ForumThreadCommentsResponse,
  PostState,
  ForumPermissionsState,
  NotificationPreference,
  NotificationPreferenceType,
  ForumNotificationsExperimentConfig,
  ForumExperimentsState,
  ForumsError,
  ForumsErrorResponse,
  ForumCategoryRolePermissionsResponse,
  ForumCategoryRolesResponse,
  ResolvedForumCategoryPermissionsResponse,
  ResolvedGroupRolePermissionsPageResponse,
  ForumCategoryRolePermissionResponse
};

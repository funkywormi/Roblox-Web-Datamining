import { PostCommentsKeyTuple } from '../types';

type CommentReplyKeyTuple = [key: string, groupId: number, categoryId: string, threadId: string];
export const getCommentRepliesKey = (
  groupId: number,
  categoryId: string,
  threadId: string
): CommentReplyKeyTuple => ['commentReplies', groupId, categoryId, threadId];

type CategoryKeyTuple = [key: string, groupId: number];

export const getResolvedGroupRolePermissionsKey = (groupId: number): CategoryKeyTuple => [
  'getResolvedGroupRolePermissions',
  groupId
];

export const getCategoriesKey = (groupId: number): CategoryKeyTuple => [
  'getCategoryPosts',
  groupId
];

export const getPostCommentsKey = (
  groupId: number,
  categoryId: string,
  postId: string,
  firstCommentId?: string
): PostCommentsKeyTuple => ['comments', groupId, categoryId, postId, firstCommentId];

type PostsKeyTuple = [key: string, groupId: number, categoryId: string];
export const getCategoryPinnedPostsKey = (groupId: number, categoryId: string): PostsKeyTuple => [
  'getCategoryPinnedPosts',
  groupId,
  categoryId
];

export const getCategoryPostsKey = (groupId: number, categoryId: string): PostsKeyTuple => [
  'getCategoryPosts',
  groupId,
  categoryId
];

type PostKeyTuple = [key: string, groupId: number, categoryId: string, postId: string];
export const getPostKey = (groupId: number, categoryId: string, postId: string): PostKeyTuple => [
  'post',
  groupId,
  categoryId,
  postId
];

export const getCategoryRolesPermissionsKey = (
  groupId: number,
  categoryId: string
): PostsKeyTuple => ['getCategoryRolesPermissions', groupId, categoryId];

export const getCategoryRolesKey = (groupId: number, categoryId: string): PostsKeyTuple => [
  'getCategoryRoles',
  groupId,
  categoryId
];

type ForumSearchKeyTuple = [
  key: string,
  groupId: number,
  search: string,
  searchType: string,
  timeRange: string,
  // The resolved lower bound of the window; `timeRange` alone is only a relative label.
  fromTime: string | undefined,
  searchCategoryId: string | undefined,
  searchAuthorIds: string | undefined
];
export const getForumSearchKey = (
  groupId: number,
  search: string,
  searchType: string,
  timeRange: string,
  fromTime?: string,
  searchCategoryId?: string,
  searchAuthorIds?: string
): ForumSearchKeyTuple => [
  'forumSearch',
  groupId,
  search,
  searchType,
  timeRange,
  fromTime,
  searchCategoryId,
  searchAuthorIds
];

export const getResolvedCategoryPermissionsKey = (
  groupId: number,
  categoryId: string
): PostsKeyTuple => ['getResolvedCategoryPermissions', groupId, categoryId];

type CategoryRoleKeyTuple = [key: string, groupId: number, categoryId: string, roleId: number];
export const getCategoryRolePermissionsKey = (
  groupId: number,
  categoryId: string,
  roleId: number
): CategoryRoleKeyTuple => ['getCategoryRolePermissions', groupId, categoryId, roleId];

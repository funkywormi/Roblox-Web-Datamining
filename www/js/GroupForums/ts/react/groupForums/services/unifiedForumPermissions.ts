import type { GroupPermissions, PermissionConfigurationState } from '../../shared/types';
import type {
  ForumCategoryRolePermissionResponse,
  ResolvedForumCategoryPermissionsResponse
} from '../types';

type ForumPermissions = GroupPermissions['groupForumsPermissions'];
export type ForumPermissionName = keyof ForumPermissions;

const resolvedPermissionNames: Record<string, ForumPermissionName> = {
  canManageCategory: 'manageCategories',
  canCreatePosts: 'createPosts',
  canRemovePosts: 'removePosts',
  canLockPosts: 'lockPosts',
  canPinPosts: 'pinPosts',
  canCreateComments: 'createComments',
  canRemoveComments: 'removeComments',
  canCreateBugReports: 'createBugReports'
};

const rolePermissionNames: Record<string, ForumPermissionName> = {
  'Forum.CategoryManager': 'manageCategories',
  'Forum.PostCreator': 'createPosts',
  'Forum.PostRemover': 'removePosts',
  'Forum.PostLocker': 'lockPosts',
  'Forum.PostPinner': 'pinPosts',
  'Forum.CommentCreator': 'createComments',
  'Forum.CommentRemover': 'removeComments',
  'Forum.BugReporter': 'createBugReports'
};

const unifiedPermissionNameByForumPermission = Object.entries(rolePermissionNames).reduce(
  (result, [unifiedName, forumPermissionName]) => ({
    ...result,
    [forumPermissionName]: unifiedName
  }),
  {} as Record<ForumPermissionName, string>
);

export const mapResolvedForumCategoryPermissions = (
  response: ResolvedForumCategoryPermissionsResponse
): ForumPermissions => {
  const permissions = response.permissions ?? {};

  return Object.entries(resolvedPermissionNames).reduce<ForumPermissions>(
    (result, [resolvedName, forumPermissionName]) => ({
      ...result,
      [forumPermissionName]: permissions[resolvedName] ?? false
    }),
    {} as ForumPermissions
  );
};

export const mapForumCategoryRolePermissions = (
  response: ForumCategoryRolePermissionResponse
): Record<ForumPermissionName, PermissionConfigurationState> =>
  Object.entries(rolePermissionNames).reduce((result, [unifiedName, forumPermissionName]) => {
    const metadata = response.permissions?.[unifiedName];
    return {
      ...result,
      [forumPermissionName]: {
        isEnabled: metadata?.isGranted ?? false,
        canEdit: metadata?.canEdit ?? false
      }
    };
  }, {} as Record<ForumPermissionName, PermissionConfigurationState>);

export const getUnifiedForumPermissionName = (forumPermissionName: string): string | undefined =>
  unifiedPermissionNameByForumPermission[forumPermissionName as ForumPermissionName];

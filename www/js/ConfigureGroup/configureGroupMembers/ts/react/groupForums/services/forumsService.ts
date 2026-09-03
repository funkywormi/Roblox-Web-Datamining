import { httpService, UrlConfig } from 'core-utilities';
import groupForumsConstants from '../constants/groupForumsConstants';
import {
  ForumAncestryResponse,
  ForumCategoriesResponse,
  ForumCategory,
  ForumComment,
  ForumCommentsResponse,
  ForumPost,
  ForumPostsResponse,
  NotificationPreference,
  ForumsErrorResponse,
  ForumCategoryRolePermissionsResponse,
  ForumCategoryRolesResponse,
  ToggleReactionMetadata,
  ResolvedForumCategoryPermissionsResponse,
  ResolvedGroupRolePermissionsPageResponse,
  ForumCategoryRolePermissionResponse
} from '../types';
import { MessageContent } from '../../shared/types';
import { createMessageContentFragment } from '../../shared/utils/messageContentUtils';
import { CreateSupportTicketRequest } from '../types/supportTicket';
import { ForumSearchRequest, ForumSearchResponse } from '../types/search';

// Extract and attach retry-after seconds to a 429 error and return the same error
const enrichRateLimitInfo = (error: Error): Error => {
  const typed = (error as unknown) as ForumsErrorResponse | undefined;
  if (typed?.status === 429 && typed.headers) {
    const retryAfter = typed.headers['retry-after'];
    if (retryAfter) {
      // Mutate to include parsed seconds for downstream handling
      typed.retryAfterSeconds = parseInt(retryAfter, 10);
    }
  }
  return error;
};

export default {
  getGroupForumCategories: async (
    groupId: number,
    archived: boolean
  ): Promise<ForumCategoriesResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoriesEndpoint(groupId, archived),
      withCredentials: true
    };

    const response = await httpService.get<ForumCategoriesResponse>(urlConfig);

    const { data: categoriesResponse } = response;

    if (categoriesResponse.data.some(category => category.rank !== null)) {
      categoriesResponse.data.sort(
        (a, b) =>
          // Categories with null rank get placed at end
          (a.rank ?? categoriesResponse.data.length) - (b.rank ?? categoriesResponse.data.length)
      );
    } else {
      categoriesResponse.data.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
    }

    return categoriesResponse;
  },
  createGroupForumCategory: async (
    groupId: number,
    name: string,
    isRestricted?: boolean
  ): Promise<ForumCategory> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoriesEndpoint(groupId, false),
      withCredentials: true
    };

    const data: { name: string; isRestricted?: boolean } = {
      name
    };
    if (isRestricted !== undefined) {
      data.isRestricted = isRestricted;
    }

    const response = await httpService.post<ForumCategory>(urlConfig, data);
    return response.data;
  },
  deleteGroupForumCategory: async (
    groupId: number,
    forumCategoryId: string,
    archived: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryEndpoint(groupId, forumCategoryId, archived),
      withCredentials: true
    };

    await httpService.delete(urlConfig);
  },
  updateGroupForumCategory: async (
    groupId: number,
    forumCategoryId: string,
    name: string
  ): Promise<ForumCategory> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryEndpoint(groupId, forumCategoryId),
      withCredentials: true
    };

    const data = {
      name
    };

    const response = await httpService.patch<ForumCategory>(urlConfig, data);
    return response.data;
  },
  orderGroupForumCategories: async (groupId: number, categoryIds: string[]): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.orderForumCategoriesEndpoint(groupId),
      withCredentials: true
    };

    const data = {
      categoryIds
    };

    await httpService.post(urlConfig, data);
  },
  getGroupForumPostsByIds: async (
    groupId: number,
    categoryId: string,
    postIds: string[]
  ): Promise<ForumPostsResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumPostsByIdsEndpoint(groupId, categoryId, postIds),
      withCredentials: true
    };

    const response = await httpService.get<ForumPostsResponse>(urlConfig);
    return response.data;
  },
  getGroupForumPosts: async (
    groupId: number,
    categoryId: string,
    limit: number,
    cursor?: string
  ): Promise<ForumPostsResponse> => {
    const urlParams = new URLSearchParams();
    urlParams.append('limit', limit.toString());
    if (cursor) {
      urlParams.append('cursor', cursor);
    }
    const urlConfig = {
      url: `${groupForumsConstants.urls.getForumPostsEndpoint(
        groupId,
        categoryId,
        true
      )}&${urlParams.toString()}`,
      withCredentials: true
    };

    const response = await httpService.get<ForumPostsResponse>(urlConfig);
    return response.data;
  },
  getGroupForumComments: async (
    groupId: number,
    categoryId: string,
    postId: string,
    limit: number,
    cursor: string | null,
    commentId?: string
  ): Promise<ForumCommentsResponse> => {
    const urlParams = new URLSearchParams();
    urlParams.append('limit', limit.toString());
    if (cursor) {
      urlParams.append('cursor', cursor);
    }
    if (commentId) {
      urlParams.append('commentId', commentId);
    }
    const urlConfig = {
      url: `${groupForumsConstants.urls.getForumCommentsEndpoint(
        groupId,
        categoryId,
        postId
      )}?${urlParams.toString()}`,
      withCredentials: true
    };

    const response = await httpService.get<ForumCommentsResponse>(urlConfig);
    return response.data;
  },
  archiveGroupForumCategory: async (
    groupId: number,
    forumCategoryId: string,
    isArchived: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getArchiveForumCategoryEndpoint(groupId, forumCategoryId),
      withCredentials: true
    };

    const data = {
      isArchived
    };

    await httpService.patch(urlConfig, data);
  },
  toggleRestrictedGroupForumCategory: async (
    groupId: number,
    forumCategoryId: string,
    isRestricted: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getRestrictForumCategoryEndpoint(groupId, forumCategoryId),
      withCredentials: true
    };

    const data = {
      isRestricted
    };

    await httpService.patch(urlConfig, data);
  },
  getGroupForumPinnedPosts: async (
    groupId: number,
    categoryId: string
  ): Promise<ForumPostsResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumPinnedPostsEndpoint(groupId, categoryId, true),
      withCredentials: true
    };

    const response = await httpService.get<ForumPostsResponse>(urlConfig);
    return response.data;
  },
  createGroupForumPost: async (
    groupId: number,
    categoryId: string,
    title: string,
    content: MessageContent,
    supportTicket?: CreateSupportTicketRequest
  ): Promise<ForumPost> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumPostsEndpoint(groupId, categoryId, false),
      withCredentials: true
    };

    const data = {
      title,
      ...createMessageContentFragment(content),
      ...(supportTicket && { supportTicket })
    };

    try {
      const response = await httpService.post<ForumPost>(urlConfig, data);
      return response.data;
    } catch (error) {
      throw enrichRateLimitInfo(error as Error);
    }
  },
  updateGroupForumComment: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string,
    content: MessageContent
  ): Promise<ForumComment> => {
    const urlConfig = {
      url: groupForumsConstants.urls.forumCommentEndpoint(groupId, categoryId, postId, commentId),
      withCredentials: true
    };

    const data = createMessageContentFragment(content);

    try {
      const response = await httpService.patch<ForumComment>(urlConfig, data);
      return response.data;
    } catch (error) {
      throw enrichRateLimitInfo(error as Error);
    }
  },
  toggleGroupForumPostPin: async (
    groupId: number,
    categoryId: string,
    postId: string,
    isPinned: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.toggleForumPostPinEndpoint(groupId, categoryId, postId),
      withCredentials: true
    };

    const data = {
      isPinned
    };

    await httpService.patch(urlConfig, data);
  },
  toggleGroupForumPostLock: async (
    groupId: number,
    categoryId: string,
    postId: string,
    isLocked: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.toggleForumPostLockEndpoint(groupId, categoryId, postId),
      withCredentials: true
    };

    const data = {
      isLocked
    };

    await httpService.patch(urlConfig, data);
  },
  deleteGroupForumPost: async (
    groupId: number,
    categoryId: string,
    postId: string,
    preventSimilar = false
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.deleteForumPostEndpoint(groupId, categoryId, postId),
      withCredentials: true
    };

    await httpService.delete(urlConfig, preventSimilar ? { preventSimilar: true } : undefined);
  },
  createGroupForumComment: async (
    groupId: number,
    categoryId: string,
    postId: string,
    content: MessageContent,
    repliesToPostCommentId?: string
  ): Promise<ForumComment> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCommentsEndpoint(groupId, categoryId, postId),
      withCredentials: true
    };

    const data = {
      repliesToPostCommentId,
      ...createMessageContentFragment(content)
    };

    try {
      const response = await httpService.post<ForumComment>(urlConfig, data);
      return response.data;
    } catch (error) {
      throw enrichRateLimitInfo(error as Error);
    }
  },
  deleteGroupForumComment: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string,
    preventSimilar = false
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.forumCommentEndpoint(groupId, categoryId, postId, commentId),
      withCredentials: true
    };

    await httpService.delete(urlConfig, preventSimilar ? { preventSimilar: true } : undefined);
  },
  toggleGroupForumReaction: async (
    groupId: number,
    channelId: string,
    commentId: string,
    emoteId: string,
    togglingOn: boolean,
    metadata: ToggleReactionMetadata
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCommentReactionsEndpoint(
        groupId,
        channelId,
        commentId,
        emoteId,
        metadata
      ),
      withCredentials: true
    };
    if (togglingOn) {
      await httpService.post(urlConfig);
    } else {
      await httpService.delete(urlConfig);
    }
  },
  markGroupForumPostAsRead: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.markForumPostAsReadEndpoint(
        groupId,
        categoryId,
        postId,
        commentId
      ),
      withCredentials: true
    };

    const data = {
      isRead: true
    };

    await httpService.patch(urlConfig, data);
  },
  getPostNotificationPreference: async (
    groupId: number,
    categoryId: string,
    postId: string
  ): Promise<NotificationPreference> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getPostNotificationPreferenceEndpoint(
        groupId,
        categoryId,
        postId
      ),
      withCredentials: true
    };

    const response = await httpService.get<NotificationPreference>(urlConfig);
    return response.data;
  },
  getCommentNotificationPreference: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string
  ): Promise<NotificationPreference> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getCommentNotificationPreferenceEndpoint(
        groupId,
        categoryId,
        postId,
        commentId
      ),
      withCredentials: true
    };

    const response = await httpService.get<NotificationPreference>(urlConfig);
    return response.data;
  },
  togglePostNotificationSubscription: async (
    groupId: number,
    categoryId: string,
    postId: string,
    isSubscribed: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getPostNotificationPreferenceEndpoint(
        groupId,
        categoryId,
        postId
      ),
      withCredentials: true
    };

    const data = {
      isSubscribed
    };

    await httpService.patch(urlConfig, data);
  },
  toggleCommentNotificationSubscription: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string,
    isSubscribed: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getCommentNotificationPreferenceEndpoint(
        groupId,
        categoryId,
        postId,
        commentId
      ),
      withCredentials: true
    };

    const data = {
      isSubscribed
    };

    await httpService.patch(urlConfig, data);
  },
  getForumAncestry: async (
    groupId: number,
    categoryId: string,
    channelId: string,
    commentId: string
  ): Promise<ForumAncestryResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumAncestryEndpoint(
        groupId,
        categoryId,
        channelId,
        commentId
      ),
      withCredentials: true
    };

    const response = await httpService.get<ForumAncestryResponse>(urlConfig);
    return response.data;
  },
  getGroupForumUpdates: async (groupId: number, limit: number): Promise<ForumPostsResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumUpdatesEndpoint(groupId, limit),
      withCredentials: true
    };

    const response = await httpService.get<ForumPostsResponse>(urlConfig);
    return response.data;
  },
  getGroupForumCategoryRoles: async (
    groupId: number,
    categoryId: string
  ): Promise<ForumCategoryRolesResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryRolesEndpoint(groupId, categoryId),
      withCredentials: true
    };
    const response = await httpService.get<ForumCategoryRolesResponse>(urlConfig);
    return response.data;
  },
  getGroupForumCategoryRolesPermissions: async (
    groupId: number,
    categoryId: string
  ): Promise<ForumCategoryRolePermissionsResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryRolesPermissionsEndpoint(groupId, categoryId),
      withCredentials: true
    };
    const response = await httpService.get<ForumCategoryRolePermissionsResponse>(urlConfig);
    return response.data;
  },
  getResolvedGroupForumCategoryPermissions: async (
    groupId: number,
    categoryId: string
  ): Promise<ResolvedForumCategoryPermissionsResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getResolvedForumCategoryPermissionsEndpoint(
        groupId,
        categoryId
      ),
      withCredentials: true
    };
    const response = await httpService.get<ResolvedForumCategoryPermissionsResponse>(urlConfig);
    return response.data;
  },
  getResolvedGroupRolePermissions: async (
    groupId: number
  ): Promise<Record<string, Record<string, boolean>>> => {
    const resolvedRolePermissions: Record<string, Record<string, boolean>> = {};
    const requestedCursors = new Set<string>();
    const loadPage = async (cursor?: string): Promise<void> => {
      if (cursor) {
        if (requestedCursors.has(cursor)) {
          throw new Error('Resolved role permissions returned a repeated page cursor');
        }
        requestedCursors.add(cursor);
      }
      const urlConfig = {
        url: groupForumsConstants.urls.getResolvedGroupRolePermissionsEndpoint(groupId),
        withCredentials: true
      };
      const response = await httpService.get<ResolvedGroupRolePermissionsPageResponse>(urlConfig, {
        limit: 100,
        ...(cursor ? { cursor } : {})
      });
      response.data.data?.forEach(rolePermissions => {
        if (rolePermissions.entityId && rolePermissions.permissions) {
          resolvedRolePermissions[rolePermissions.entityId] = rolePermissions.permissions;
        }
      });
      if (response.data.nextPageCursor) {
        await loadPage(response.data.nextPageCursor);
      }
    };

    await loadPage();
    return resolvedRolePermissions;
  },
  getUnifiedGroupForumCategoryRolePermissions: async (
    groupId: number,
    categoryId: string,
    roleId: number
  ): Promise<ForumCategoryRolePermissionResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getUnifiedForumCategoryRolePermissionsEndpoint(
        groupId,
        categoryId,
        roleId
      ),
      withCredentials: true
    };
    const response = await httpService.get<ForumCategoryRolePermissionResponse>(urlConfig);
    return response.data;
  },
  updateUnifiedGroupForumCategoryRolePermissions: async (
    groupId: number,
    categoryId: string,
    roleId: number,
    permissions: Record<string, 'granted' | 'denied'>
  ): Promise<ForumCategoryRolePermissionResponse> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getUnifiedForumCategoryRolePermissionsEndpoint(
        groupId,
        categoryId,
        roleId
      ),
      withCredentials: true
    };
    const response = await httpService.patch<ForumCategoryRolePermissionResponse>(urlConfig, {
      permissions
    });
    return response.data;
  },
  addGroupForumCategoryRolesPermissions: async (
    groupId: number,
    categoryId: string,
    roleId: number
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryRolesPermissionsForRoleEndpoint(
        groupId,
        categoryId,
        roleId
      ),
      withCredentials: true
    };
    await httpService.post<void>(urlConfig);
  },
  updateGroupForumCategoryRolesPermissions: async (
    groupId: number,
    categoryId: string,
    roleId: number,
    permissions: Record<string, boolean>
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryRolesPermissionsForRoleEndpoint(
        groupId,
        categoryId,
        roleId
      ),
      withCredentials: true
    };
    await httpService.patch<void>(urlConfig, { permissions });
  },
  deleteGroupForumCategoryRolesPermissions: async (
    groupId: number,
    categoryId: string,
    roleId: number
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.getForumCategoryRolesPermissionsForRoleEndpoint(
        groupId,
        categoryId,
        roleId
      ),
      withCredentials: true
    };
    // we delete by passing null in as permissions to update route
    await httpService.patch<void>(urlConfig, { permissions: null });
  },
  hideForumComment: async (
    groupId: number,
    categoryId: string,
    postId: string,
    threadId: string,
    commentId: string
  ): Promise<void> => {
    const urlConfig: UrlConfig = {
      url: groupForumsConstants.urls.hideForumCommentEndpoint(
        groupId,
        categoryId,
        postId,
        commentId
      ),
      withCredentials: true
    };
    const data = {
      threadId
    };
    await httpService.post(urlConfig, data);
  },
  unhideForumComment: async (
    groupId: number,
    categoryId: string,
    postId: string,
    commentId: string
  ): Promise<void> => {
    const urlConfig = {
      url: groupForumsConstants.urls.unhideForumCommentEndpoint(
        groupId,
        categoryId,
        postId,
        commentId
      ),
      withCredentials: true
    };
    await httpService.post(urlConfig);
  }
};

export const deleteAllForumPostsForUser = async (
  groupId: number,
  userId: number
): Promise<void> => {
  const urlConfig = {
    url: groupForumsConstants.urls.deleteAllForumPostsForUserEndpoint(groupId, userId),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

export const searchForumContent = async (
  groupId: number,
  params: ForumSearchRequest
): Promise<ForumSearchResponse> => {
  const urlConfig = {
    url: groupForumsConstants.urls.getForumSearchEndpoint(groupId),
    withCredentials: true
  };

  const response = await httpService.post<ForumSearchResponse>(urlConfig, params).catch(e => {
    throw enrichRateLimitInfo(e);
  });

  return response.data;
};

import { Endpoints, EnvironmentUrls } from 'Roblox';
import { ToggleReactionMetadata } from '../types';

export const isUUID = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const { groupsApi } = EnvironmentUrls;

const forumsUrlPrefix = `${groupsApi}/v1/groups`;
const unifiedGroupsUrlPrefix = `${groupsApi}/v2/groups`;
const routerBase = '/forums';

const MAX_SLUG_TEXT = 30;
const DEFAULT_CATEGORY_SLUG_NAME = 'category';

const deepLinkBaseUrl = (groupId: number): string =>
  `${EnvironmentUrls.websiteUrl}/communities/${groupId}#!/forums`;

export const toSlug = (str: string | undefined): string => {
  if (str) {
    if (isUUID(str)) {
      return str;
    }

    const slug = str
      .toLowerCase()
      .replace(/[!#$&'()*+,/\\^:;=?@[\]%]/g, '') // remove reserved URL characters
      .replace(/[\s]+/g, '-') // replace all remaining spaces with dashes
      .replace(/^-+|-+$/g, '') // remove extra dashes from beginning/end of slug
      .replace(/--+/g, '-') // replace double (or more) dashes with a single dash
      .slice(0, MAX_SLUG_TEXT);
    if (slug.length > 0) {
      return slug;
    }
    // An empty string as the slug causes things to break, so if there are no valid characters for the slug then we default to 'category'
    // We also tried URL encoding but characters like '%' also break things if they are in the slug
    return DEFAULT_CATEGORY_SLUG_NAME;
  }
  return DEFAULT_CATEGORY_SLUG_NAME;
};

export const toVanity = (name: string, id: string): string => `${toSlug(name)}-${id}`;

export const isRouteNameMatch = (actualName: string, routeName: string): boolean => {
  const expectedSlug = toSlug(actualName);
  return expectedSlug === routeName;
};

export enum CommentVariants {
  Post = 'post',
  Comment = 'comment',
  Reply = 'reply'
}

export default {
  urls: {
    reportAbuseRevamp({
      targetId,
      submitterId,
      abuseVector,
      custom
    }: {
      targetId: string;
      submitterId: string;
      abuseVector: string;
      custom: Record<string, string>;
    }): string {
      const params = new URLSearchParams({
        targetId,
        submitterId,
        abuseVector,
        custom: JSON.stringify(custom)
      });
      return `/report-abuse/?${params.toString()}`;
    },
    reportAbuse(
      groupId: number,
      postId: string,
      channelId: string,
      commentId: string,
      addRedirectUrl: boolean
    ): string {
      return Endpoints.getAbsoluteUrl(
        `/abuseReport/groupforumcomment?id=${groupId}&stringId=${commentId}&conversationId=${channelId}&forumPostId=${postId}${
          addRedirectUrl ? `&RedirectUrl=${encodeURIComponent(window.location.href)}` : ''
        }`
      );
    },
    getForumsPageUrl: deepLinkBaseUrl,
    getForumCategoriesEndpoint(groupId: number, archived: boolean): string {
      return `${forumsUrlPrefix}/${groupId}/forums${archived ? '?archived=true' : ''}`;
    },
    getForumCategoryEndpoint(groupId: number, forumCategoryId: string, archived = false): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${forumCategoryId}${
        archived ? '?archived=true' : ''
      }`;
    },
    getForumPostsByIdsEndpoint(groupId: number, categoryId: string, postIds: string[]): string {
      const params = new URLSearchParams();
      params.append('postIds', postIds.join(','));
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts?${params.toString()}`;
    },
    getForumPostsEndpoint(
      groupId: number,
      categoryId: string,
      includeCommentCount: boolean
    ): string {
      const params = new URLSearchParams();
      if (includeCommentCount) {
        params.append('includeCommentCount', 'true');
      }
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts?${params.toString()}`;
    },
    getForumCommentsEndpoint(groupId: number, categoryId: string, postId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments`;
    },
    getForumCommentReactionsEndpoint(
      groupId: number,
      channelId: string,
      commentId: string,
      emoteId: string,
      metadata: ToggleReactionMetadata
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/channels/${channelId}/comments/${commentId}/reactions/${emoteId}?categoryId=${
        metadata.categoryId
      }&postId=${metadata.postId}&isPostComment=${metadata.isPostComment.toString()}`;
    },
    getArchiveForumCategoryEndpoint(groupId: number, forumCategoryId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${forumCategoryId}/archive`;
    },
    getRestrictForumCategoryEndpoint(groupId: number, forumCategoryId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${forumCategoryId}/restrict`;
    },
    getConfigureGroupForumsSectionUrl(groupId: number): string {
      return `${EnvironmentUrls.websiteUrl}/communities/configure?id=${groupId}#!/forums`;
    },
    // Optionally carries the originating forum post (as `sourceId`) so the support center can
    // offer a link back to it.
    getSupportCenterTicketUrl(
      universeId: number,
      ticketId: string,
      forumPostSourceId?: string
    ): string {
      const ticketUrl = `${EnvironmentUrls.websiteUrl}/support-center#!/tickets/${universeId}/${ticketId}`;
      if (!forumPostSourceId) {
        return ticketUrl;
      }
      const params = new URLSearchParams({
        sourceType: 'forumPost',
        sourceId: forumPostSourceId
      });
      return `${ticketUrl}?${params.toString()}`;
    },
    getForumPinnedPostsEndpoint(
      groupId: number,
      categoryId: string,
      includeCommentCount: boolean
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/pinned${
        includeCommentCount ? '?includeCommentCount=true' : ''
      }`;
    },
    toggleForumPostPinEndpoint(groupId: number, categoryId: string, postId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/pin`;
    },
    toggleForumPostLockEndpoint(groupId: number, categoryId: string, postId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/lock`;
    },
    deleteForumPostEndpoint(groupId: number, categoryId: string, postId: string): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}`;
    },
    forumCommentEndpoint(
      groupId: number,
      categoryId: string,
      postId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments/${commentId}`;
    },
    markForumPostAsReadEndpoint(
      groupId: number,
      categoryId: string,
      postId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments/${commentId}/read`;
    },
    getPostNotificationPreferenceEndpoint(
      groupId: number,
      categoryId: string,
      postId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/notifications`;
    },
    getCommentNotificationPreferenceEndpoint(
      groupId: number,
      categoryId: string,
      postId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments/${commentId}/notifications`;
    },
    getForumAncestryEndpoint(
      groupId: number,
      categoryId: string,
      channelId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/channels/${channelId}/comments/${commentId}/ancestry`;
    },
    getForumUpdatesEndpoint(groupId: number, limit: number): string {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      return `${forumsUrlPrefix}/${groupId}/forums/updates?${params.toString()}`;
    },
    deleteAllForumPostsForUserEndpoint(groupId: number, userId: number): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${userId}/posts`;
    },
    getForumCategoryRolesEndpoint(groupId: number, categoryId: string): string {
      return `${forumsUrlPrefix}/${groupId}/channels/${categoryId}/roles`;
    },
    getForumCategoryRolesPermissionsEndpoint(groupId: number, categoryId: string): string {
      return `${forumsUrlPrefix}/${groupId}/channels/${categoryId}/roles/permissions`;
    },
    getForumCategoryRolesPermissionsForRoleEndpoint(
      groupId: number,
      categoryId: string,
      roleId: number
    ): string {
      return `${forumsUrlPrefix}/${groupId}/channels/${categoryId}/roles/${roleId}/permissions`;
    },
    getResolvedForumCategoryPermissionsEndpoint(groupId: number, categoryId: string): string {
      return `${unifiedGroupsUrlPrefix}/${groupId}/categories/${categoryId}/permissions/resolved`;
    },
    getResolvedGroupRolePermissionsEndpoint(groupId: number): string {
      return `${unifiedGroupsUrlPrefix}/${groupId}/roles/permissions/resolved`;
    },
    getUnifiedForumCategoryRolePermissionsEndpoint(
      groupId: number,
      categoryId: string,
      roleId: number
    ): string {
      return `${unifiedGroupsUrlPrefix}/${groupId}/roles/${roleId}/permissions/categories/${categoryId}`;
    },
    orderForumCategoriesEndpoint(groupId: number): string {
      return `${forumsUrlPrefix}/${groupId}/forums/categories/order`;
    },
    hideForumCommentEndpoint(
      groupId: number,
      categoryId: string,
      postId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments/${commentId}/hide`;
    },
    unhideForumCommentEndpoint(
      groupId: number,
      categoryId: string,
      postId: string,
      commentId: string
    ): string {
      return `${forumsUrlPrefix}/${groupId}/forums/${categoryId}/posts/${postId}/comments/${commentId}/unhide`;
    },
    getForumSearchEndpoint(groupId: number): string {
      return `${forumsUrlPrefix}/${groupId}/forums/search`;
    }
  },
  limits: {
    categoryNameMinLength: 1,
    categoryNameMaxLength: 25,
    categoryDescriptionMinLength: 1,
    categoryDescriptionMaxLength: 130,
    maxNumberOfCategories: 10,
    postTitleMaxLength: 100,
    postTitleMinLength: 3,
    postContentMaxLength: 1000,
    postContentMinLength: 3,
    commentContentMaxLength: 1000,
    commentContentMinLength: 3
  },
  pageCounts: {
    postsPerPage: 10,
    commentsPerPage: 10
  },
  errorCodes: {
    contentModerated: 14,
    supportTicketAgeIneligible: 20,
    supportTicketOpenLimitReached: 23,
    supportTicketIneligible: 24,
    supportTicketDetailsTooLong: 30
  },
  router: {
    // main routes
    defaultRoute: routerBase,
    categoryRoute: `${routerBase}/:categoryName-:categoryShortId`,
    postRoute: `${routerBase}/:categoryName-:categoryShortId/post/:postName-:postShortId`,
    postCommentRoute: `${routerBase}/:categoryName-:categoryShortId/post/:postName-:postShortId/comment/:commentId`,
    // mutation routes
    postEditRoute: `${routerBase}/:categoryId/post/:postId/edit`,
    postCreateRoute: `${routerBase}/:categoryId/post/create`,
    getCategoryRoute(categoryId: string, categoryName: string): string {
      return `${routerBase}/${toVanity(categoryName, categoryId)}`;
    },
    getPostRoute(
      categoryId: string,
      categoryName: string,
      postId: string,
      postName: string
    ): string {
      return `${routerBase}/${toVanity(categoryName, categoryId)}/post/${toVanity(
        postName,
        postId
      )}`;
    },
    getPostCommentRoute(
      categoryId: string,
      categoryName: string,
      postId: string,
      postName: string,
      commentId: string
    ): string {
      return `${routerBase}/${toVanity(categoryName, categoryId)}/post/${toVanity(
        postName,
        postId
      )}/comment/${commentId}`;
    },
    getPostEditRoute(categoryId: string, postId: string): string {
      return `${routerBase}/${categoryId}/post/${postId}/edit`;
    },
    getPostCreateRoute(categoryId: string): string {
      return `${routerBase}/${categoryId}/post/create`;
    }
  },
  noOpFunctionRef: (): void => {
    /* do nothing */
  },
  deepLinks: {
    groupForumUrl(groupId: number): string {
      return `${deepLinkBaseUrl(groupId)}/`;
    },
    groupForumCategoryUrl(groupId: number, categoryId: string, categoryName: string): string {
      return `${deepLinkBaseUrl(groupId)}/${toVanity(categoryName, categoryId)}`;
    },
    groupForumPostUrl(
      groupId: number,
      categoryId: string,
      categoryName: string,
      postId: string,
      postName: string
    ): string {
      return `${deepLinkBaseUrl(groupId)}/${toVanity(categoryName, categoryId)}/post/${toVanity(
        postName,
        postId
      )}`;
    },
    groupForumCommentUrl(
      groupId: number,
      categoryId: string,
      categoryName: string,
      postId: string,
      postName: string,
      commentId: string
    ): string {
      return `${deepLinkBaseUrl(groupId)}/${toVanity(categoryName, categoryId)}/post/${toVanity(
        postName,
        postId
      )}/comment/${commentId}`;
    }
  },
  CommentVariants
};

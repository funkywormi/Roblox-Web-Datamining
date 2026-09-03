import { match as ReactRouterMatch } from 'react-router-dom';
import { ForumCategory, ForumPostsResponse } from '../types';

import groupForumsConstants, { isUUID } from '../constants/groupForumsConstants';
import forumsService from '../services/forumsService';
import {
  isTopLevelComment,
  isThreadedComment,
  getThreadPostAndComment
} from '../utils/channelMessageHelper';
import { State } from './sliceTypes';

export type BaseRouteParams = {
  categoryShortId: string;
  categoryName: string;
};

export type PostRouteMatchParams = {
  postShortId: string;
  postName: string;
} & BaseRouteParams;

type CommentRouteMatchParams = {
  commentId: string;
} & PostRouteMatchParams;

export type RouteMatchType = BaseRouteParams | PostRouteMatchParams | CommentRouteMatchParams;

const getValidCategory = (
  categoryShortId: string,
  categories: ForumCategory[],
  archivedCategories: ForumCategory[]
): ForumCategory | undefined => {
  // First, check if the requested category exists in active categories
  const existingActive = categories.find(category => category.shortId === categoryShortId);
  if (existingActive) {
    return existingActive;
  }

  // Then, check if the requested category exists in archived categories
  const existingArchived = archivedCategories.find(
    category => category.shortId === categoryShortId
  );
  if (existingArchived) {
    return existingArchived; // Return the archived category to preserve the original request
  }

  // If not found in either, fall back to first active category if available
  if (categories.length > 0) {
    return categories[0];
  }

  return undefined;
};

const isCategoryArchived = (
  categoryShortId: string,
  archivedCategories: ForumCategory[]
): boolean => archivedCategories.some(category => category.shortId === categoryShortId);

const getCategoryInfo = (
  categoryShortId: string,
  categories: ForumCategory[],
  archivedCategories: ForumCategory[]
): { id: string; name: string; shortId: string } => {
  const category = getValidCategory(categoryShortId, categories, archivedCategories);
  return category
    ? { id: category.id, name: category.name, shortId: category.shortId }
    : { id: '', name: '', shortId: '' };
};

type StateUpdate = Partial<State>;

const reduceNextRoute = async (state: State, match: ReactRouterMatch): Promise<StateUpdate> => {
  const {
    archivedCategories,
    groupId,
    categories,
    categoriesLoaded,
    postShortId,
    commentId
  } = state;
  if (!categoriesLoaded || (!categories.length && !archivedCategories.length)) {
    return {};
  }

  const params = match.params as RouteMatchType;
  const nextCategoryInfo = getCategoryInfo(params.categoryShortId, categories, archivedCategories);
  const isArchived = isCategoryArchived(nextCategoryInfo.shortId, archivedCategories);

  switch (match.path) {
    case groupForumsConstants.router.postCommentRoute:
      if (
        'categoryShortId' in params &&
        'postShortId' in params &&
        'postName' in params &&
        'commentId' in params &&
        commentId !== params.commentId
      ) {
        const nextCommentId = params.commentId;
        let nextPostId = isUUID(params.postName) ? params.postName : undefined;
        if (!nextPostId) {
          try {
            const response = await forumsService.getGroupForumPostsByIds(
              groupId,
              nextCategoryInfo.id,
              [params.postShortId]
            );
            nextPostId = response.data.length === 1 ? response.data[0].id : undefined;
          } catch {
            // permission error — leave nextPostId undefined so we mark the post inaccessible below
          }
        }

        if (!nextPostId) {
          return {
            categoryId: nextCategoryInfo.id,
            categoryName: nextCategoryInfo.name,
            categoryShortId: nextCategoryInfo.shortId,
            isCategoryArchived: isArchived,
            postId: undefined,
            postShortId: undefined,
            isPostInaccessible: true,
            commentId: nextCommentId
          };
        }

        try {
          const response = await forumsService.getForumAncestry(
            groupId,
            nextCategoryInfo.id,
            nextPostId,
            nextCommentId
          );

          const ancestors = response.data;

          if (isTopLevelComment(nextCategoryInfo.id, nextPostId, nextCommentId, ancestors)) {
            return {
              categoryId: nextCategoryInfo.id,
              categoryName: nextCategoryInfo.name,
              categoryShortId: nextCategoryInfo.shortId,
              isCategoryArchived: isArchived,
              postId: nextPostId,
              postShortId: params.postShortId,
              isPostInaccessible: false,
              commentId: nextCommentId,
              activeCommentId: nextCommentId
            };
          }

          if (isThreadedComment(nextCategoryInfo.id, nextPostId, nextCommentId, ancestors)) {
            const { postId: validPostId, commentId: validCommentId } = getThreadPostAndComment(
              ancestors
            );
            return {
              categoryId: nextCategoryInfo.id,
              categoryName: nextCategoryInfo.name,
              categoryShortId: nextCategoryInfo.shortId,
              isCategoryArchived: isArchived,
              postId: validPostId,
              postShortId: params.postShortId,
              isPostInaccessible: false,
              commentId: validCommentId,
              threadCommentId: nextCommentId,
              activeCommentId: nextCommentId
            };
          }
        } catch (error) {
          // noop see below
        }

        // we couldn't find this post/comment on ancestors
        return {
          categoryId: nextCategoryInfo.id,
          categoryName: nextCategoryInfo.name,
          categoryShortId: nextCategoryInfo.shortId,
          isCategoryArchived: isArchived,
          postId: undefined,
          postShortId: undefined,
          isPostInaccessible: true,
          commentId: undefined
        };
      }
      break;
    case groupForumsConstants.router.postRoute:
      if (
        'categoryShortId' in params &&
        'postShortId' in params &&
        postShortId !== params.postShortId
      ) {
        // A post the user can't access (role-restricted category) is either filtered out of the
        // response (empty data) or rejected outright (the request throws). Treat both as inaccessible
        // so the post query stays gated and the disclaimer renders instead of an endless skeleton.
        const inaccessibleState: StateUpdate = {
          categoryId: nextCategoryInfo.id,
          categoryName: nextCategoryInfo.name,
          categoryShortId: nextCategoryInfo.shortId,
          postId: undefined,
          postShortId: undefined,
          isPostInaccessible: true,
          commentId: undefined
        };
        let response: ForumPostsResponse;
        try {
          response = await forumsService.getGroupForumPostsByIds(groupId, nextCategoryInfo.id, [
            params.postShortId
          ]);
        } catch {
          return inaccessibleState;
        }
        if (response.data.length === 0) {
          return inaccessibleState;
        }
        // we found the post, hydrate the full info
        return {
          categoryId: nextCategoryInfo.id,
          categoryName: nextCategoryInfo.name,
          categoryShortId: nextCategoryInfo.shortId,
          isCategoryArchived: isArchived,
          postId: response.data[0].id,
          postShortId: params.postShortId,
          isPostInaccessible: false,
          commentId: undefined
        };
      }
      break;
    case groupForumsConstants.router.categoryRoute:
      if ('categoryShortId' in params) {
        return {
          categoryId: nextCategoryInfo.id,
          categoryName: nextCategoryInfo.name,
          categoryShortId: nextCategoryInfo.shortId,
          isCategoryArchived: isArchived,
          postId: undefined,
          postShortId: undefined,
          isPostInaccessible: false,
          commentId: undefined
        };
      }
      break;
    case groupForumsConstants.router.defaultRoute:
    default:
      return {
        categoryId: nextCategoryInfo.id,
        categoryName: nextCategoryInfo.name,
        categoryShortId: nextCategoryInfo.shortId,
        isCategoryArchived: isArchived,
        postId: undefined,
        postShortId: undefined,
        isPostInaccessible: false,
        commentId: undefined
      };
  }

  return {};
};

export default reduceNextRoute;

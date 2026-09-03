import groupForumsConstants, { isUUID, isRouteNameMatch } from '../constants/groupForumsConstants';
import { RouteMatchType } from '../store/reduceNextRoute';

export type UiState = {
  categoryShortId: string | undefined;
  categoryName: string | undefined;
  postShortId: string | undefined;
  postName: string | undefined;
  categoriesLoaded: boolean;
};

const routeValidation = (params: RouteMatchType, uiState: UiState): string | undefined => {
  const { categoryShortId, categoryName, postShortId, postName, categoriesLoaded } = uiState;
  if (
    'postName' in params &&
    postName &&
    categoryShortId &&
    categoryName &&
    postShortId &&
    (!isRouteNameMatch(categoryName, params.categoryName) ||
      !isRouteNameMatch(postName, params.postName))
  ) {
    if (isUUID(params.postName)) {
      return undefined;
    }

    return 'commentId' in params
      ? groupForumsConstants.router.getPostCommentRoute(
          categoryShortId,
          categoryName,
          postShortId,
          postName,
          params.commentId
        )
      : groupForumsConstants.router.getPostRoute(
          categoryShortId,
          categoryName,
          postShortId,
          postName
        );
  }

  if (
    categoriesLoaded &&
    categoryShortId &&
    categoryName &&
    !isRouteNameMatch(categoryName, params.categoryName)
  ) {
    return groupForumsConstants.router.getCategoryRoute(categoryShortId, categoryName);
  }

  return undefined;
};

export default routeValidation;

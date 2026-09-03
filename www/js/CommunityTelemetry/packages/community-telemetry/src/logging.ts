import CommunityEventStream, { CommunityMetric, getImpressionId } from "./eventStream";
import { getCommonParams, getPageRoute } from "./pageInfo";

// Mirrors EventContext.GroupForums from Roblox.Groups.WebApp's constants/eventConstants.
// Inlined so this package does not depend on the legacy WebApp.
const GROUP_FORUMS_CONTEXT = "groupForums";

export const logGroupPageExposureEvent = ({
  context,
  groupId,
  exposureType,
  exposureId,
}: {
  groupId?: number;
  exposureType: string;
  exposureId?: string;
  context: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.GroupPageExposure({
      context,
      groupId: groupId ?? groupIdFromRoute,
      exposureType,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
      ...(exposureId && { exposureId }),
    }),
  );
};

export const logGroupPageClickEvent = ({
  context,
  groupId,
  clickTargetType,
  clickTargetId,
  hasRichText,
  enterFrom,
}: {
  groupId?: number;
  clickTargetType: string;
  clickTargetId?: string;
  hasRichText?: boolean;
  context: string;
  enterFrom?: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.GroupPageClick({
      context,
      groupId: groupId ?? groupIdFromRoute,
      clickTargetType,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
      ...(clickTargetId && { clickTargetId }),
      ...(hasRichText && { hasRichText }),
      ...(enterFrom && { enterFrom }),
    }),
  );
};

const defaultPageRoute = (): string =>
  window.location.hash.includes("#!")
    ? getPageRoute(window.location.hash)
    : window.location.pathname;

export const logCmntyEntrypointExposureEvent = ({
  context,
  entryPoint,
  entryPointDetail,
  entrypointImpressionId,
  groupId,
  pageRoute,
  locationTab,
  searchId,
  resultIndex,
  page,
}: {
  context: string;
  entryPoint: string;
  entryPointDetail?: string;
  entrypointImpressionId: string;
  groupId?: number;
  pageRoute?: string;
  locationTab?: string;
  searchId?: string;
  resultIndex?: number;
  page?: number;
}): void => {
  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyEntrypointExposure({
      context,
      entryPoint,
      entrypointImpressionId,
      pageRoute: pageRoute ?? defaultPageRoute(),
      sessionId: getImpressionId(),
      ...(entryPointDetail && { entryPointDetail }),
      ...(groupId != null && { groupId }),
      ...(locationTab && { locationTab }),
      ...(searchId && { searchId }),
      ...(resultIndex != null && { resultIndex }),
      ...(page != null && { page }),
    }),
  );
};

export const logCmntyEntrypointClickEvent = ({
  context,
  entryPoint,
  entryPointDetail,
  entrypointImpressionId,
  groupId,
  groupSize,
  pageRoute,
  locationTab,
  searchId,
  resultIndex,
  page,
}: {
  context: string;
  entryPoint: string;
  entryPointDetail?: string;
  entrypointImpressionId: string;
  groupId?: number;
  groupSize?: number;
  pageRoute?: string;
  locationTab?: string;
  searchId?: string;
  resultIndex?: number;
  page?: number;
}): void => {
  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyEntrypointClick({
      context,
      entryPoint,
      entrypointImpressionId,
      pageRoute: pageRoute ?? defaultPageRoute(),
      sessionId: getImpressionId(),
      ...(entryPointDetail && { entryPointDetail }),
      ...(groupId != null && { groupId }),
      ...(groupSize != null && { groupSize }),
      ...(locationTab && { locationTab }),
      ...(searchId && { searchId }),
      ...(resultIndex != null && { resultIndex }),
      ...(page != null && { page }),
    }),
  );
};

export const logCmntySearchConductedEvent = ({
  searchId,
  surface,
  searchKeyword,
  pageRoute,
}: {
  searchId: string;
  surface: string;
  searchKeyword: string;
  pageRoute?: string;
}): void => {
  CommunityEventStream.sendEvent(
    CommunityMetric.CmntySearchConducted({
      searchId,
      surface,
      searchKeyword,
      sessionId: getImpressionId(),
      pageRoute: pageRoute ?? defaultPageRoute(),
    }),
  );
};

export type SearchResultGroup = {
  groupId: number;
  positionInList: number;
  positionOnPage: number;
};

export const logCmntySearchResultsReturnedEvent = ({
  searchId,
  surface,
  groups,
  totalResults,
}: {
  searchId: string;
  surface: string;
  groups: SearchResultGroup[];
  totalResults?: number;
}): void => {
  CommunityEventStream.sendEvent(
    CommunityMetric.CmntySearchResultsReturned({
      searchId,
      surface,
      sessionId: getImpressionId(),
      groupsReturned: JSON.stringify(groups),
      ...(totalResults != null && { totalResults }),
    }),
  );
};

// Value sets the forums-search protos document as string fields, enforced at the call site.
export type SearchSurface = "communitiesSearch" | "forumsSearch";
export type ForumsSearchMode = "text" | "member" | "filtersOnly";
export type ForumsSearchTrigger = "search" | "reset" | "navigation";
export type ForumsSearchResultType = "Post" | "Comment";
export type ForumsSearchContentType = "Any" | "Post" | "Comment";
export type ForumsSearchTimeRange = "day" | "week" | "month" | "all";

export type ForumsSearchResultItem = {
  resultType: ForumsSearchResultType;
  postId: string;
  commentId?: string;
  positionInList: number;
  positionOnPage: number;
};

export const logCmntyForumsSearchConductedEvent = ({
  searchId,
  groupId,
  surface,
  searchMode,
  searchKeyword,
  isMemberSearch,
  searchTrigger,
  contentType,
  timeRange,
  categoryScope,
}: {
  searchId: string;
  groupId: number;
  surface: SearchSurface;
  searchMode: ForumsSearchMode;
  searchKeyword: string;
  isMemberSearch: boolean;
  searchTrigger: ForumsSearchTrigger;
  contentType: ForumsSearchContentType;
  timeRange: ForumsSearchTimeRange;
  categoryScope: string;
}): void => {
  const { pageRoute, locationTab } = getCommonParams(
    window.location.hash,
    window.location.pathname,
  );

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsSearchConducted({
      searchId,
      groupId,
      surface,
      searchMode,
      searchKeyword,
      isMemberSearch,
      searchTrigger,
      contentType,
      timeRange,
      categoryScope,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logCmntyForumsSearchResultsReturnedEvent = ({
  searchId,
  groupId,
  surface,
  totalResults,
  pageIndex,
  hasMore,
  results,
}: {
  searchId: string;
  groupId: number;
  surface: SearchSurface;
  totalResults: number;
  pageIndex: number;
  hasMore: boolean;
  results: ForumsSearchResultItem[];
}): void => {
  const { pageRoute, locationTab } = getCommonParams(
    window.location.hash,
    window.location.pathname,
  );

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsSearchResultsReturned({
      searchId,
      groupId,
      surface,
      totalResults,
      pageIndex,
      hasMore,
      resultsInPage: results.length,
      resultsReturned: JSON.stringify(results),
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logCmntyForumsSearchResultClickedEvent = ({
  searchId,
  groupId,
  surface,
  resultType,
  postId,
  commentId,
  positionInList,
  positionOnPage,
  pageIndex,
}: {
  searchId: string;
  groupId: number;
  surface: SearchSurface;
  resultType: ForumsSearchResultType;
  postId: string;
  commentId?: string;
  positionInList: number;
  positionOnPage: number;
  pageIndex: number;
}): void => {
  const { pageRoute, locationTab } = getCommonParams(
    window.location.hash,
    window.location.pathname,
  );

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsSearchResultClicked({
      searchId,
      groupId,
      surface,
      resultType,
      postId,
      positionInList,
      positionOnPage,
      pageIndex,
      // proto3 has no null; an absent comment is the empty string.
      commentId: commentId ?? "",
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logGroupForumsClickEvent = ({
  groupId,
  clickTargetType,
  clickTargetId,
  hasRichText,
}: {
  groupId: number;
  clickTargetType: string;
  clickTargetId?: string;
  hasRichText?: boolean;
}): void => {
  logGroupPageClickEvent({
    groupId,
    clickTargetType,
    clickTargetId,
    hasRichText,
    context: GROUP_FORUMS_CONTEXT,
  });
};

export type ForumContentType = "post" | "comment" | "reply";

export const logCmntyForumsConcealedContentShownEvent = ({
  groupId,
  contentType,
  concealedCount,
  concealmentImpressionId,
}: {
  groupId?: number;
  contentType: ForumContentType;
  concealedCount: number;
  concealmentImpressionId: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsConcealedContentShown({
      groupId: groupId ?? groupIdFromRoute,
      contentType,
      concealedCount,
      concealmentImpressionId,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logCmntyForumsConcealedContentRevealedEvent = ({
  groupId,
  contentType,
  concealedCount,
  concealmentImpressionId,
}: {
  groupId?: number;
  contentType: ForumContentType;
  concealedCount: number;
  concealmentImpressionId: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsConcealedContentRevealed({
      groupId: groupId ?? groupIdFromRoute,
      contentType,
      concealedCount,
      concealmentImpressionId,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logCmntyForumsDeleteDialogShownEvent = ({
  groupId,
  contentType,
  preventSimilarShown,
  deleteDialogImpressionId,
}: {
  groupId?: number;
  contentType: ForumContentType;
  preventSimilarShown: boolean;
  deleteDialogImpressionId: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsDeleteDialogShown({
      groupId: groupId ?? groupIdFromRoute,
      contentType,
      preventSimilarShown,
      deleteDialogImpressionId,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

export const logCmntyForumsDeleteConfirmEvent = ({
  groupId,
  contentType,
  preventSimilarShown,
  preventSimilar,
  deleteDialogImpressionId,
}: {
  groupId?: number;
  contentType: ForumContentType;
  preventSimilarShown: boolean;
  preventSimilar: boolean;
  deleteDialogImpressionId: string;
}): void => {
  const {
    pageRoute,
    locationTab,
    groupId: groupIdFromRoute,
  } = getCommonParams(window.location.hash, window.location.pathname);

  CommunityEventStream.sendEvent(
    CommunityMetric.CmntyForumsDeleteConfirm({
      groupId: groupId ?? groupIdFromRoute,
      contentType,
      preventSimilarShown,
      preventSimilar,
      deleteDialogImpressionId,
      pageRoute,
      locationTab,
      sessionId: getImpressionId(),
    }),
  );
};

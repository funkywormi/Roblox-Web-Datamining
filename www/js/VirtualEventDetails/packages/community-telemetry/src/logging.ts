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
}: {
  groupId?: number;
  clickTargetType: string;
  clickTargetId?: string;
  hasRichText?: boolean;
  context: string;
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

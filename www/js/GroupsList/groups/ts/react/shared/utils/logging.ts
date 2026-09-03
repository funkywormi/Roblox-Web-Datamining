/** Thin shim over the `Roblox.CommunityTelemetry` global; log helpers live in @rbx/community-telemetry. */
import { EventContext } from '../constants/eventConstants';
import getCommunityTelemetry from './communityTelemetryGlobal';
import type { SearchResultGroup } from './communityTelemetryTypes';

export type { SearchResultGroup } from './communityTelemetryTypes';

export const logGroupPageExposureEvent = (params: {
  groupId?: number;
  exposureType: string;
  exposureId?: string;
  context: string;
}): void => getCommunityTelemetry().logGroupPageExposureEvent(params);

export const logGroupPageClickEvent = (params: {
  groupId?: number;
  clickTargetType: string;
  clickTargetId?: string;
  hasRichText?: boolean;
  context: string;
  enterFrom?: string;
}): void => getCommunityTelemetry().logGroupPageClickEvent(params);

// GRPS-3102: community session enter_from (delegates to the package via the global).
export const getCommunitySessionEnterFrom = (): string =>
  getCommunityTelemetry().getCommunitySessionEnterFrom();

export const logCmntyEntrypointExposureEvent = (params: {
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
}): void => getCommunityTelemetry().logCmntyEntrypointExposureEvent(params);

export const logCmntyEntrypointClickEvent = (params: {
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
}): void => getCommunityTelemetry().logCmntyEntrypointClickEvent(params);

export const logCmntySearchConductedEvent = (params: {
  searchId: string;
  surface: string;
  searchKeyword: string;
  pageRoute?: string;
}): void => getCommunityTelemetry().logCmntySearchConductedEvent(params);

export const logCmntySearchResultsReturnedEvent = (params: {
  searchId: string;
  surface: string;
  groups: SearchResultGroup[];
  totalResults?: number;
}): void => getCommunityTelemetry().logCmntySearchResultsReturnedEvent(params);

export const logGroupForumsClickEvent = (params: {
  groupId: number;
  clickTargetType: string;
  clickTargetId?: string;
  hasRichText?: boolean;
}): void =>
  // Kept local so it can bind Groups.WebApp's own EventContext.GroupForums; forwards to the global.
  logGroupPageClickEvent({
    ...params,
    context: EventContext.GroupForums
  });

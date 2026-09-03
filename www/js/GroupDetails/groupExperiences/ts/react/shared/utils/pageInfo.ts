/** Thin shim over the `Roblox.CommunityTelemetry` global; page/route helpers live in @rbx/community-telemetry. */
import getCommunityTelemetry from './communityTelemetryGlobal';

export const getCommonParams = (
  hash: string,
  pathname: string
): { pageRoute: string; locationTab: string; groupId: number; isValid: boolean } =>
  getCommunityTelemetry().getCommonParams(hash, pathname);

export const getPageRoute = (hash: string): string => getCommunityTelemetry().getPageRoute(hash);

export const getSanitizedReferrer = (referrer: string): string =>
  getCommunityTelemetry().getSanitizedReferrer(referrer);

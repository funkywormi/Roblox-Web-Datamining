import { httpResponseCodes } from 'core-utilities';
import { AnnouncementErrorResponseV2 } from '../types';

// Re-exported so the announcement composer keeps getting all its error keys from one place.
export { ASSET_UPLOAD_FAILED_KEY } from '../../shared/constants/assetUploadConstants';

export const MODERATION_ERROR_KEY = 'Error.AnnouncementModerated';
export const ASSET_MODERATION_REJECTED_KEY = 'Error.AnnouncementAssetNotApproved';
export const TIMEOUT_ERROR_KEY = 'Description.CommunityDialogError';
export const NETWORK_ERROR_KEY = 'NetworkError';

const REQUEST_TIMEOUT_STATUS = 408;

/**
 * Error codes returned in `data.errors[].code` by groups-api. Source of truth:
 * `services/groups-api/Roblox.Groups.Api/ResponseEnums/GroupAnnouncementsErrors.cs`.
 */
export const AnnouncementsApiErrorCode = {
  InappropriateContent: 13,
  TextModerated: 14,
  AssetModerated: 15
} as const;

const MODERATION_CODES: ReadonlySet<number> = new Set([
  AnnouncementsApiErrorCode.InappropriateContent,
  AnnouncementsApiErrorCode.TextModerated,
  AnnouncementsApiErrorCode.AssetModerated
]);

export const getErrorKey = (error: AnnouncementErrorResponseV2): string => {
  const firstCode = error.data?.errors?.[0]?.code;

  if (firstCode !== undefined && MODERATION_CODES.has(firstCode)) {
    return MODERATION_ERROR_KEY;
  }

  if (
    error.status === httpResponseCodes.serviceUnavailable ||
    error.status === REQUEST_TIMEOUT_STATUS
  ) {
    return TIMEOUT_ERROR_KEY;
  }

  return NETWORK_ERROR_KEY;
};

export const isModerationErrorKey = (errorKey: string | null | undefined): boolean =>
  errorKey === MODERATION_ERROR_KEY || errorKey === ASSET_MODERATION_REJECTED_KEY;

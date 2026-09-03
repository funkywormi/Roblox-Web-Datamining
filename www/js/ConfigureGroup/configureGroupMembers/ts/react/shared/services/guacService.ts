/**
 * Retrieves the GUAC configuration for the new abuse reporting revamp flow and the new report abuse URL.
 * Multiple copies of this file exists in the codebase, give that there currently is not a way to share code across WebApps.
 * If updating this file, please report all the copies in the codebase.
 */
import { Guac } from 'Roblox';
import { getGuacRequestCacheBustParams } from '../utils/requestCacheBust';

// this method processes the response from Guac and ensures that all keys defined in the defaults are present in the result, with the correct types.
// If a key is missing or has an invalid type in the response, it falls back to the default value.
// currently assumes all values are boolean or string
function processGuacResponse<T extends Record<string, boolean | string>>(
  response: Partial<T> | undefined | null,
  defaults: T
): T {
  if (!response) {
    return defaults;
  }

  const result = {} as T;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const defaultValue = defaults[key];
    const responseValue = response[key];
    result[key] =
      typeof responseValue === 'boolean' || typeof responseValue === 'string'
        ? (responseValue as T[typeof key])
        : defaultValue;
  }
  return result;
}

const GuacAbuseReportingResponseDefaults = {
  EnableGroupComment: false as boolean,
  EnableGroupPost: false as boolean
};
export type GuacAbuseReportingResponse = Partial<typeof GuacAbuseReportingResponseDefaults>;

export type TwoWayCommunicationsUpsellStatus = 'Ineligible' | 'Eligible' | 'Completed';
export type EligibleForReadingTwoWayCommunications = 'Ineligible' | 'Eligible' | 'AgeCheckPending';
export type EligibleForWritingTwoWayCommunications =
  | 'Ineligible'
  | 'Eligible'
  | 'AgeCheckPending'
  | 'AgeVerificationRequired';
export type EligibleForRestrictedCommunications =
  | 'Ineligible'
  | 'Eligible'
  | 'AgeCheckPending'
  | 'AgeVerificationRequired';
const GroupDetailsUiResponseDefaults = {
  displayGroupForums: false as boolean,
  displayRank: false as boolean,
  displayGroupEvents: false as boolean,
  checkGroupOrigin: false as boolean,
  displayDescription: false as boolean,
  displayMembers: false as boolean,
  displayShout: false as boolean,
  displayGroupAnnouncements: false as boolean,
  displayMarketplaceEmbed: false as boolean,
  isGroupVerificationRequiredToJoin: false as boolean,
  displayGroupAnnouncementPublishing: false as boolean,
  isGracefulDegradationEnabled: false as boolean,
  isMemberListVisibilityEnforced: false as boolean,
  isHideCommentButtonVisible: false as boolean,
  checkTwoWayCommunicationsUpsell: 'Ineligible' as TwoWayCommunicationsUpsellStatus,
  eligibleForReadingTwoWayCommunications: 'Ineligible' as EligibleForReadingTwoWayCommunications,
  eligibleForWritingTwoWayCommunications: 'Ineligible' as EligibleForWritingTwoWayCommunications,
  eligibleForRestrictedCommunications: 'Ineligible' as EligibleForRestrictedCommunications,
  displayOptionalAnnouncementNotificationsCheckbox: false as boolean,
  displayRoleColor: false as boolean
};
export type GroupDetailsUiResponse = Partial<typeof GroupDetailsUiResponseDefaults>;

const ConfigureGroupUiResponseDefaults = {
  displayGroupFundsAndRobuxIcon: false as boolean,
  displayPlayerUsername: false as boolean,
  displayGroupForumsConfiguration: false as boolean,
  displayJoinRequirementsSetting: false as boolean,
  displayUploadGroupIcon: false as boolean,
  displayGroupPrivacySettings: false as boolean,
  displayGroupBans: false as boolean,
  displayGroupRolesSynced: false as boolean,
  systemGroupMessage: '' as string,
  displayContentModerationConfiguration: false as boolean,
  isGroupVerificationRequiredToJoin: false as boolean,
  displayAccountTenureVerification: false as boolean,
  displaySlowmodeConfiguration: false as boolean,
  displayMemberListVisibilityConfiguration: false as boolean,
  displayForumCategoryPermissionsConfiguration: false as boolean,
  displayForumCategoryOrderConfiguration: false as boolean,
  displayCoverPhotoUpload: false as boolean,
  useGroupAuditLogDisplayNamesForUser: false as boolean,
  allowDeleteRoleSetWithUsers: false as boolean,
  displaySetRoleColorConfiguration: false as boolean,
  displayAutoAssignRoleDeleteWarning: false as boolean
};
export type ConfigureGroupUiResponse = Partial<typeof ConfigureGroupUiResponseDefaults>;

export default {
  /**
   * Loads the GUAC (Great Universal App Configurator) configuration for abuse reporting, which functions as flags.
   * This function does not throw errors and returns a false configuration if the request fails.
   * @returns A promise that resolves to a `GuacConfig` object containing:
   *  - `EnableGroupComment`: A boolean indicating whether the group comment abuse reporting feature is enabled.
   *  - `EnableGroupPost`: A boolean indicating whether the group post abuse reporting feature is enabled.
   */
  getAbuseReportRevampPolicyNonThrowing: async (): Promise<GuacAbuseReportingResponse> => {
    try {
      const data = await Guac.callBehaviour<GuacAbuseReportingResponse>('abuse-reporting-revamp');
      return processGuacResponse(data, GuacAbuseReportingResponseDefaults);
    } catch (e) {
      return GuacAbuseReportingResponseDefaults;
    }
  },
  getConfigureGroupUiGuac: async (): Promise<ConfigureGroupUiResponse> => {
    try {
      const data = await Guac.callBehaviour<ConfigureGroupUiResponse>('configure-group-ui');

      return processGuacResponse(data, ConfigureGroupUiResponseDefaults);
    } catch (e) {
      return ConfigureGroupUiResponseDefaults;
    }
  },
  getGroupDetailsUiGuac: async (): Promise<GroupDetailsUiResponse> => {
    try {
      const data = await Guac.callBehaviour<GroupDetailsUiResponse>(
        'group-details-ui',
        getGuacRequestCacheBustParams()
      );

      return processGuacResponse(data, GroupDetailsUiResponseDefaults);
    } catch (e) {
      return GroupDetailsUiResponseDefaults;
    }
  }
};

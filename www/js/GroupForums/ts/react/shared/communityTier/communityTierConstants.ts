import { EnvironmentUrls } from 'Roblox';
import groupConstants from '../constants/groupConstants';
import { Capability, CommunityTier, CommunityTierValues } from './types';

const { groupsApi } = EnvironmentUrls;

/**
 * Canonical requirement keys. Every other map in this file is keyed off these so
 * that requirement knowledge lives in exactly one place.
 */
export const RequirementKeys = {
  ownerModerationStatusOk: 'OwnerModerationStatusOk',
  ownerAgeEstimationVerified: 'OwnerAgeEstimationVerified',
  ownerIdVerified: 'OwnerIdVerified',
  ownerTwoStepVerified: 'OwnerTwoStepVerified',
  communityMeetsPlayerRequirement: 'CommunityMeetsPlayerRequirement'
} as const;

export type RequirementKey = typeof RequirementKeys[keyof typeof RequirementKeys];

export const TIER_ORDER: CommunityTier[] = [
  CommunityTierValues.Profile,
  CommunityTierValues.Social,
  CommunityTierValues.Professional
];

export const TIER_NAME_KEYS: Record<CommunityTier, string> = {
  [CommunityTierValues.Profile]: 'Label.TierBasic',
  [CommunityTierValues.Social]: 'Label.TierSocial',
  [CommunityTierValues.Professional]: 'Label.TierProfessional'
};

export const TIER_DESCRIPTION_KEYS: Record<CommunityTier, string> = {
  [CommunityTierValues.Profile]: 'Description.TierBasic',
  [CommunityTierValues.Social]: 'Description.TierSocial',
  [CommunityTierValues.Professional]: 'Description.TierProfessional'
};

/**
 * Maps each requirement key to the minimum tier where it first becomes required.
 *
 * Basic (`CommunityTierValues.Profile`) is earned, not a free floor: the service
 * gates it on its own `CommunityOwnerProfileEligibility` AMP feature, exactly as
 * it does for Social and Professional. Owner account standing is what that entry
 * tier asks for, so `ownerModerationStatusOk` maps to Basic and the Basic column
 * is not empty.
 *
 * This grouping exists only for display. The service has no tier/requirement
 * mapping of its own: `CommunityTierRuleSet.AllRequirements` is a flat list and
 * the awarded tier comes from the separate per-tier AMP eligibility features.
 */
export const REQUIREMENT_MINIMUM_TIER: Record<RequirementKey, CommunityTier> = {
  [RequirementKeys.ownerModerationStatusOk]: CommunityTierValues.Profile,
  [RequirementKeys.ownerAgeEstimationVerified]: CommunityTierValues.Social,
  [RequirementKeys.ownerIdVerified]: CommunityTierValues.Professional,
  [RequirementKeys.ownerTwoStepVerified]: CommunityTierValues.Professional,
  [RequirementKeys.communityMeetsPlayerRequirement]: CommunityTierValues.Professional
};

// Maps the numeric requirement enum returned by the groups API to our keys.
export const REQUIREMENT_KEY_FROM_INT: Record<number, RequirementKey> = {
  1: RequirementKeys.ownerModerationStatusOk,
  2: RequirementKeys.ownerAgeEstimationVerified,
  3: RequirementKeys.ownerIdVerified,
  4: RequirementKeys.ownerTwoStepVerified,
  5: RequirementKeys.communityMeetsPlayerRequirement
};

/**
 * Maps AMP signal names to requirement keys. Used only for the legacy
 * `passedSignals` shape of the evaluate response.
 *
 * NOTE: there is no known AMP signal for `communityMeetsPlayerRequirement`, so
 * requirements derived from signals alone always report it unmet. Add the signal
 * name here once it is known; prefer the `requirements` field on the evaluate
 * response, which does cover it.
 */
export const SIGNAL_TO_REQUIREMENT_KEY: Record<string, RequirementKey> = {
  CommunityOwnerModerationStatus: RequirementKeys.ownerModerationStatusOk,
  CommunityOwnerAgeEstimationVerification: RequirementKeys.ownerAgeEstimationVerified,
  CommunityOwnerStrictIdVerification: RequirementKeys.ownerIdVerified,
  CommunityOwnerTwoStepVerification: RequirementKeys.ownerTwoStepVerified
};

export const RequirementActions = {
  ageEstimation: 'ageEstimation',
  securitySettings: 'securitySettings'
} as const;

export type RequirementAction = typeof RequirementActions[keyof typeof RequirementActions];

/**
 * Which requirements the owner can act on from this page, and how. Both the
 * action handler and the row button derive from this map, so a requirement can
 * never render a button without a matching action behind it.
 */
export const REQUIREMENT_ACTION_BY_KEY: Partial<Record<RequirementKey, RequirementAction>> = {
  [RequirementKeys.ownerAgeEstimationVerified]: RequirementActions.ageEstimation,
  [RequirementKeys.ownerIdVerified]: RequirementActions.securitySettings,
  [RequirementKeys.ownerTwoStepVerified]: RequirementActions.securitySettings
};

export const REQUIREMENTS_CONFIG: Record<
  RequirementKey,
  { titleKey: string; descriptionKey: string }
> = {
  [RequirementKeys.ownerModerationStatusOk]: {
    titleKey: 'Label.RequirementAccountStatus',
    descriptionKey: 'Description.RequirementAccountStatus'
  },
  [RequirementKeys.ownerAgeEstimationVerified]: {
    titleKey: 'Label.RequirementAgeCheck',
    descriptionKey: 'Description.RequirementAgeCheck'
  },
  [RequirementKeys.ownerIdVerified]: {
    titleKey: 'Label.RequirementIdVerification',
    descriptionKey: 'Description.RequirementIdVerification'
  },
  [RequirementKeys.ownerTwoStepVerified]: {
    titleKey: 'Label.RequirementTwoStep',
    descriptionKey: 'Description.RequirementTwoStep'
  },
  [RequirementKeys.communityMeetsPlayerRequirement]: {
    titleKey: 'Label.RequirementQualifiedMembers',
    descriptionKey: 'Description.RequirementQualifiedMembers'
  }
};

/**
 * Capability rows of the comparison grid. `labelKey` and `valueKeys` hold
 * translation keys resolved at render time. An empty entry means the capability
 * is unavailable at that tier.
 */
export const CAPABILITIES: Capability[] = [
  {
    capabilityKey: 'Announcements',
    labelKey: 'Label.CapabilityAnnouncements',
    iconName: 'icon-regular-megaphone',
    valueKeys: {
      [CommunityTierValues.Profile]: 'Label.CapabilityAllAges',
      [CommunityTierValues.Social]: 'Label.CapabilityAllAges',
      [CommunityTierValues.Professional]: 'Label.CapabilityAllAges'
    }
  },
  {
    capabilityKey: 'Forums',
    labelKey: 'Label.CapabilityForums',
    iconName: 'icon-regular-speech-bubble-round',
    valueKeys: {
      [CommunityTierValues.Profile]: '',
      [CommunityTierValues.Social]: 'Label.CapabilityForumsSocial',
      [CommunityTierValues.Professional]: 'Label.CapabilityForumsProfessional'
    }
  }
];

const communityTierConstants = {
  urls: {
    // Owner/manager only: GET /v1/groups/{id}/settings returns 403 for non-members.
    getGroupSettings: (groupId: number): string => groupConstants.urls.getGroupSettingsURL(groupId),
    // Publicly readable, and also carries communityTier.
    getGroupDetail: (groupId: number): string => groupConstants.urls.getGroupURL(groupId),
    evaluateCommunityTier: (groupId: number): string =>
      `${groupsApi}/v1/groups/${groupId}/community-tier/evaluate`
  },

  // Name of the Community Tier menu option on the configure community page. The
  // Angular router registers each menu option at `#!/<name>`.
  configureMenuOptionName: 'communityTier'
};

export default communityTierConstants;

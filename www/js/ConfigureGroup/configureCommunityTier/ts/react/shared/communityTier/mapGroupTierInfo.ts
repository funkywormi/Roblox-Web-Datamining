import {
  CommunityTier,
  CommunityTierValues,
  ENTERPRISE_TIER_VALUE,
  GroupTierInfo,
  TierRequirement
} from './types';
import {
  REQUIREMENT_KEY_FROM_INT,
  REQUIREMENT_MINIMUM_TIER,
  RequirementKey,
  TIER_NAME_KEYS
} from './communityTierConstants';

type ApiTierRequirement = {
  key: number | string;
  satisfied: boolean;
};

// Shape returned by GET /v1/groups/{groupId}/settings → communityTier field.
export type CommunityTierApiResponse = {
  groupId: number;
  currentTier: number;
  previousTier: number | null;
  tierUpdatedTime: string | null;
  lastEvaluatedTime: string | null;
  requirements?: ApiTierRequirement[] | null;
  capabilities?: { isEligibleForUnrestrictedMessages?: boolean } | null;
};

// The full group settings response; we only care about the communityTier property.
export type GroupSettingsCommunityTierResponse = {
  communityTier?: CommunityTierApiResponse | null;
};

// Highest tier this build knows how to name, describe and render a column for.
const HIGHEST_KNOWN_TIER: CommunityTier = CommunityTierValues.Professional;

/**
 * Resolves the numeric tier from the API to a tier this build can render.
 *
 * Tiers are cumulative, so anything above the highest tier we know clamps down
 * to it rather than being discarded. Enterprise (`999`) is the live case: it is
 * granted by an operator, never earned, and holds every capability we display,
 * so Professional is an accurate floor for it. Reporting "tier unknown" instead
 * would drop the comparison grid entirely and leave every gate reading this tier
 * falling open by accident rather than by decision.
 *
 * Clamping is for gating, not for naming: what the community actually holds is
 * carried separately by `isEnterprise`, since Professional is a truthful floor
 * for Enterprise but a false name for it.
 *
 * Values below Basic (`0`, negatives) are still not a tier.
 */
function toTierValue(apiTier: number): CommunityTier | null {
  if (apiTier >= HIGHEST_KNOWN_TIER) return HIGHEST_KNOWN_TIER;
  if (apiTier === CommunityTierValues.Social) return CommunityTierValues.Social;
  if (apiTier === CommunityTierValues.Profile) return CommunityTierValues.Profile;
  return null;
}

function resolveRequirementKey(apiKey: number | string): string {
  if (typeof apiKey === 'number') {
    return REQUIREMENT_KEY_FROM_INT[apiKey] ?? String(apiKey);
  }
  return apiKey;
}

function mapTierValues<T>(getValue: (tier: CommunityTier) => T): Record<CommunityTier, T> {
  return {
    [CommunityTierValues.Profile]: getValue(CommunityTierValues.Profile),
    [CommunityTierValues.Social]: getValue(CommunityTierValues.Social),
    [CommunityTierValues.Professional]: getValue(CommunityTierValues.Professional)
  };
}

function buildRequirements(isMetForKey: (key: RequirementKey) => boolean): TierRequirement[] {
  return (Object.keys(REQUIREMENT_MINIMUM_TIER) as RequirementKey[]).map(requirementKey => {
    const minTier = REQUIREMENT_MINIMUM_TIER[requirementKey];
    const isMet = isMetForKey(requirementKey);

    return {
      requirementKey,
      isMet,
      tierStatus: mapTierValues(tier => {
        if (tier < minTier) {
          return 'notApplicable' as const;
        }
        return isMet ? ('met' as const) : ('unmet' as const);
      })
    };
  });
}

/**
 * Used only when the backend reports no requirement breakdown at all. Holding a
 * tier means its eligibility check passed, so everything up to the awarded tier
 * counts as met — an owner reaching this page is at least Basic.
 */
function deriveRequirements(currentTier: CommunityTier): TierRequirement[] {
  return buildRequirements(key => currentTier >= REQUIREMENT_MINIMUM_TIER[key]);
}

/**
 * The service emits every requirement or none — `DeserializeRequirements` walks
 * `CommunityTierRuleSet.AllRequirements` and reports each one's `satisfied`, so a
 * partially populated array never arrives. An absent key therefore means the same
 * thing it means in the stored passed-signals snapshot: not satisfied.
 */
function mapBackendRequirements(apiRequirements: ApiTierRequirement[]): TierRequirement[] {
  const satisfiedByKey = new Map(
    apiRequirements.map(requirement => [
      resolveRequirementKey(requirement.key),
      requirement.satisfied
    ])
  );

  return buildRequirements(key => satisfiedByKey.get(key) ?? false);
}

/**
 * Maps the `communityTier` payload to view state, or returns `null` when the
 * backend supplied no payload or no recognized current tier.
 *
 * Null means "we don't know this community's tier" and must not be collapsed
 * into Basic: callers gate capabilities on the tier, so inventing Basic from
 * missing data would enforce brand-new restrictions on every community whenever
 * the field is absent (rollout off, older backend, group never evaluated).
 */
export function mapGroupSettingsToTierInfo(
  settings: GroupSettingsCommunityTierResponse
): GroupTierInfo | null {
  if (!settings.communityTier) {
    return null;
  }

  const {
    currentTier: rawTier,
    previousTier: rawPrevious,
    tierUpdatedTime,
    requirements: apiRequirements
  } = settings.communityTier;

  const currentTier = toTierValue(rawTier);
  if (currentTier === null) {
    return null;
  }

  const previousTier = rawPrevious != null ? toTierValue(rawPrevious) : null;

  return {
    currentTier,
    currentTierNameKey: TIER_NAME_KEYS[currentTier],
    // Matched exactly rather than "anything above Professional": the Enterprise
    // copy names Enterprise, so a tier added after this build ships must keep
    // clamping quietly instead of being announced as Enterprise.
    isEnterprise: rawTier === ENTERPRISE_TIER_VALUE,
    previousTier,
    tierUpdatedAt: tierUpdatedTime,
    requirements:
      apiRequirements && apiRequirements.length > 0
        ? mapBackendRequirements(apiRequirements)
        : deriveRequirements(currentTier)
  };
}

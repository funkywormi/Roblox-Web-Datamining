const CommunityTierValues = {
  Profile: 1,
  Social: 2,
  Professional: 3
} as const;

export type CommunityTier = typeof CommunityTierValues[keyof typeof CommunityTierValues];
export { CommunityTierValues };

/**
 * Enterprise, as groups-api reports it.
 *
 * Deliberately not a member of `CommunityTierValues`: Enterprise is assigned by
 * Roblox staff rather than earned, so it has no requirements to check and no
 * column in the comparison grid. Adding it to the `CommunityTier` union would
 * demand an entry in every per-tier record — capability values, tier names,
 * requirement statuses — for a tier that renders none of them.
 */
export const ENTERPRISE_TIER_VALUE = 999;

// Per-tier status for a requirement cell: requirement satisfied, not satisfied,
// or not applicable to that tier.
export type TierCellStatus = 'met' | 'unmet' | 'notApplicable';

export interface TierRequirement {
  requirementKey: string;
  // Drives the row action button: true -> no button, false -> "Start".
  isMet: boolean;
  // Status shown in each tier column.
  tierStatus: Record<CommunityTier, TierCellStatus>;
}

export interface Capability {
  capabilityKey: string;
  labelKey: string;
  iconName: string;
  // Translation keys for values shown in each tier column.
  // An empty entry means the capability is unavailable at that tier.
  valueKeys: Record<CommunityTier, string>;
}

export interface GroupTierInfo {
  currentTier: CommunityTier;
  // Translation key for the current tier's name, resolved at render time.
  currentTierNameKey: string;
  /**
   * True when Roblox staff assigned this community Enterprise. `currentTier` is
   * clamped to the highest tier this build can render, which keeps capability
   * gates reading correctly, but it no longer names the tier the community holds —
   * so any surface that names or explains the tier must read this flag.
   */
  isEnterprise: boolean;
  previousTier: CommunityTier | null;
  tierUpdatedAt: string | null;
  requirements: TierRequirement[];
}

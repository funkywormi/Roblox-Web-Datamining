import {
  TGetChildTransferLimitResponse,
  TRobuxTransferLimitsInput,
  TRobuxTransferLimitsValue,
  TRobuxTransferLimitWindow,
  TRobuxTransferWindowPair,
} from "../types/robuxTransferLimitsTypes";
import { TUserSettingsAndOptionsV2 } from "../types/userSettingsTypes";

type TTierLimits = Pick<
  TGetChildTransferLimitResponse,
  "tierDailyTransferLimit" | "tierMonthlyTransferLimit"
>;

const toWindow = (cap: number | null): TRobuxTransferLimitWindow =>
  cap === null ? { unset: {} } : { value: cap };

/** A window with no parental cap resolves to the child's tier ceiling. */
const resolveAgainstTier = (cap: number | null, tierCap: number): number => cap ?? tierCap;

/**
 * Pre-fills the parent's editable caps from a `child-settings-v2` read.
 *
 * A parent who has saved no caps is reported by the setting carrying no value,
 * which resolves to the same pair as one whose windows were both cleared: no
 * parental cap, so the tier ceilings apply.
 */
export const toRobuxTransferLimitsInputFromSetting = (
  setting: TUserSettingsAndOptionsV2<TRobuxTransferLimitsInput> | undefined,
): TRobuxTransferLimitsInput => ({
  daily: setting?.currentValue?.daily ?? null,
  monthly: setting?.currentValue?.monthly ?? null,
});

/**
 * The caps in force for each window, clamped so neither can exceed its ceiling.
 *
 * A save cannot set a cap above the tier ceiling, but a later tier drop — 2SV
 * lost, account standing changed, tier amounts lowered — leaves a stored value
 * stranded above the current ceiling, which must not raise it back up. transfer-api
 * applies the same clamp before enforcing, so this keeps the displayed pair equal
 * to the pair a transfer is actually held to.
 *
 * A `0` cap disables the window rather than capping it, so it still needs its own
 * treatment wherever these are rendered as amounts.
 */
export const clampRobuxTransferLimitsToTier = (
  stored: TRobuxTransferLimitsInput,
  tier: TRobuxTransferWindowPair,
): TRobuxTransferWindowPair => ({
  daily: Math.min(resolveAgainstTier(stored.daily, tier.daily), tier.daily),
  monthly: Math.min(resolveAgainstTier(stored.monthly, tier.monthly), tier.monthly),
});

/**
 * Whether a parent-configured cap is what limits the user, rather than their tier.
 *
 * True when either window sits strictly below its ceiling. One comparison covers
 * both ways that can happen: a cap the parent set below the tier, and a window the
 * parent disabled at `0`. Equality is deliberately not binding — a cap matching the
 * ceiling takes nothing away, and neither does one stranded above it by a tier drop,
 * where the tier is the constraint.
 *
 * transfer-api decides the same question the same way, and enforcement is its
 * answer, not this one. This exists so the client can choose what to offer a user
 * whose parent caps them; it is not a permission check.
 *
 * `tier` must be tier ceilings. Handed limits that already have a parent's cap
 * applied, every comparison collapses to false and a capped user reads as unbound.
 */
export const isRobuxTransferLimitParentBound = (
  stored: TRobuxTransferLimitsInput,
  tier: TRobuxTransferWindowPair,
): boolean =>
  (stored.daily !== null && stored.daily < tier.daily) ||
  (stored.monthly !== null && stored.monthly < tier.monthly);

/**
 * The caps in force on the parent's edit page, from a `child-transfer-limit` read.
 *
 * The two halves come from different services — the stored caps from
 * user-settings, the ceilings from transfer-api — so this reports nothing until
 * the ceilings resolve. Stored caps need no such guard: a read that has not
 * arrived looks like a parent who has capped nothing, which is what the tier
 * ceilings already describe.
 */
export const toEffectiveRobuxTransferLimits = (
  stored: TRobuxTransferLimitsInput,
  tierLimits: TTierLimits | undefined,
): TRobuxTransferWindowPair | undefined => {
  if (tierLimits === undefined) {
    return undefined;
  }
  return clampRobuxTransferLimitsToTier(stored, {
    daily: tierLimits.tierDailyTransferLimit,
    monthly: tierLimits.tierMonthlyTransferLimit,
  });
};

/**
 * Serializes proposed caps for the `robuxTransferLimits` field of a
 * grant-consent request.
 *
 * Both windows are always named. A save that omits one is rejected rather than
 * merged with the stored value, because an omission cannot be told apart from a
 * request that meant to name it.
 */
export const buildRobuxTransferLimitsConsentValue = (input: TRobuxTransferLimitsInput): string => {
  const value: TRobuxTransferLimitsValue = {
    daily: toWindow(input.daily),
    monthly: toWindow(input.monthly),
  };
  return JSON.stringify(value);
};

/**
 * Whether a proposed cap falls outside what the parent may save for that
 * window. A parent may not exceed the child's current tier ceiling.
 */
export const isRobuxTransferLimitOutOfRange = (cap: number | null, tierCap: number): boolean => {
  if (cap === null) {
    return false;
  }
  return !Number.isInteger(cap) || cap < 0 || cap > tierCap;
};

/**
 * Whether the proposed pair would leave a daily cap above its monthly cap.
 *
 * Windows with no parental cap resolve to the tier ceiling first, so clearing
 * daily against a low monthly can still be invalid. A window set to `0`
 * disables transfers rather than capping them, so it takes no part in ordering.
 *
 * transfer-service owns this rule on save; checking it here keeps the parent
 * from submitting a save that will be rejected.
 */
export const isRobuxTransferLimitOrderingInvalid = (
  input: TRobuxTransferLimitsInput,
  tierLimits: TTierLimits,
): boolean => {
  const daily = resolveAgainstTier(input.daily, tierLimits.tierDailyTransferLimit);
  const monthly = resolveAgainstTier(input.monthly, tierLimits.tierMonthlyTransferLimit);

  if (daily === 0 || monthly === 0) {
    return false;
  }
  return daily > monthly;
};

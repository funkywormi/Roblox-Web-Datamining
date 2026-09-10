import {
  TGetChildTransferLimitResponse,
  TRobuxTransferLimitsInput,
  TRobuxTransferLimitsValue,
  TRobuxTransferLimitWindow,
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
 * The caps in force for each window: the parent's cap where they set one, and
 * the child's tier ceiling for a window they left uncapped.
 *
 * The two halves come from different services — the stored caps from
 * user-settings, the ceilings from transfer-api — so this reports nothing until
 * the ceilings resolve. Stored caps need no such guard: a read that has not
 * arrived looks like a parent who has capped nothing, which is what the tier
 * ceilings already describe.
 *
 * Use this for display. A `0` cap disables the window rather than capping it, so
 * it needs its own treatment wherever these are rendered as amounts.
 */
export const toEffectiveRobuxTransferLimits = (
  stored: TRobuxTransferLimitsInput,
  tierLimits: TTierLimits | undefined,
): { daily: number; monthly: number } | undefined => {
  if (tierLimits === undefined) {
    return undefined;
  }
  return {
    daily: resolveAgainstTier(stored.daily, tierLimits.tierDailyTransferLimit),
    monthly: resolveAgainstTier(stored.monthly, tierLimits.tierMonthlyTransferLimit),
  };
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

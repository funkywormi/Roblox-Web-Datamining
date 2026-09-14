import {
  HigherLimitsIneligibilityReason as ApiHigherLimitsIneligibilityReason,
  type GetUserTransferLimitResponse,
} from "@rbx/client-transfer-api/v1";

export const HigherLimitsIneligibilityReason = {
  RecentModeration: "recentModeration",
  RecentRefundOrChargeback: "recentRefundOrChargeback",
  InsufficientPurchaseHistory: "insufficientPurchaseHistory",
} as const;

export type HigherLimitsIneligibilityReason =
  (typeof HigherLimitsIneligibilityReason)[keyof typeof HigherLimitsIneligibilityReason];

const API_NUMBER_TO_REASON: Record<
  NonNullable<GetUserTransferLimitResponse["higherLimitsIneligibilityReason"]>,
  HigherLimitsIneligibilityReason
> = {
  [ApiHigherLimitsIneligibilityReason.NUMBER_1]: HigherLimitsIneligibilityReason.RecentModeration,
  [ApiHigherLimitsIneligibilityReason.NUMBER_2]:
    HigherLimitsIneligibilityReason.RecentRefundOrChargeback,
  [ApiHigherLimitsIneligibilityReason.NUMBER_3]:
    HigherLimitsIneligibilityReason.InsufficientPurchaseHistory,
};

export const parseHigherLimitsIneligibilityReason = (
  reason: GetUserTransferLimitResponse["higherLimitsIneligibilityReason"],
): HigherLimitsIneligibilityReason | null | undefined => {
  if (reason == null) {
    return reason;
  }

  if (!(reason in API_NUMBER_TO_REASON)) {
    return null;
  }

  return API_NUMBER_TO_REASON[reason];
};

export const TransferLimitCta = {
  AskParent: "askParent",
  HigherLimits: "higherLimits",
  None: "none",
} as const;

export type TransferLimitCta = (typeof TransferLimitCta)[keyof typeof TransferLimitCta];

type AskParentEligibility = {
  /**
   * A parent's cap binds at least one window — composed from the stored caps and
   * the tier ceilings by `isRobuxTransferLimitParentBound`.
   */
  isParentBound: boolean;
  /**
   * Whether AMP grants the ask, `undefined` while that read is in flight. Only
   * ever true for a parent-bound child, since the read is gated on binding.
   */
  canAskParent: boolean | undefined;
};

type TransferLimitCtaInputs = AskParentEligibility & {
  /** Account standing alone would allow higher limits — says nothing about a parent's cap. */
  isEligibleForHigherLimitsUpsell: boolean;
};

/**
 * Whether the account-standing answer is the one that should reach this user.
 *
 * It is, unless a parent's cap is the thing this tab is acting on: either an
 * ask-parent row is being offered instead, or that possibility is still in
 * flight. A child whose limits a parent binds but who cannot ask falls back
 * here on purpose — 2SV cannot lift the capped window, but it can still lift a
 * window the parent left alone, and it is what the tab offered before
 * parent-configurable limits existed.
 */
export const appliesAccountStanding = ({
  isParentBound,
  canAskParent,
}: AskParentEligibility): boolean => !isParentBound || canAskParent === false;

/**
 * Picks the single call to action the Robux tab offers beneath the limits.
 *
 * The client composes this because its inputs come from three places:
 * user-settings holds the parent's caps, transfer-api reports the tier ceilings
 * those caps are measured against as well as account standing on its own terms,
 * and AMP owns both the age band that requires verified parental consent and the
 * rollout.
 */
export const resolveTransferLimitCta = ({
  isParentBound,
  canAskParent,
  isEligibleForHigherLimitsUpsell,
}: TransferLimitCtaInputs): TransferLimitCta => {
  if (canAskParent === true) {
    return TransferLimitCta.AskParent;
  }

  if (!appliesAccountStanding({ isParentBound, canAskParent })) {
    return TransferLimitCta.None;
  }

  if (isEligibleForHigherLimitsUpsell) {
    return TransferLimitCta.HigherLimits;
  }

  return TransferLimitCta.None;
};

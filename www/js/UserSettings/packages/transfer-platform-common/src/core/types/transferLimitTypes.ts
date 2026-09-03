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

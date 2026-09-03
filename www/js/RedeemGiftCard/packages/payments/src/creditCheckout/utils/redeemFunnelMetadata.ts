export type RedeemFunnelMetadata = Record<
  | "paymentSessionId"
  | "availableCreditBalance"
  | "currencyCode"
  | "getPlusVisible"
  | "getRobuxVisible"
  | "convertVisible"
  | "buttonType"
  | "tier"
  | "source"
  | "subscriptionProductId",
  string
>;

export const redeemFunnelMetadata = (
  metadata: Partial<RedeemFunnelMetadata>,
): RedeemFunnelMetadata => ({
  paymentSessionId: "",
  availableCreditBalance: "",
  currencyCode: "",
  getPlusVisible: "",
  getRobuxVisible: "",
  convertVisible: "",
  buttonType: "",
  tier: "",
  source: "",
  subscriptionProductId: "",
  ...metadata,
});

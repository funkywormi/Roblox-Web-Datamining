/** Single discount line — supports marketplace / game pass / developer product field names. */
export type DiscountLineInformation = {
  discountAmount?: number;
  /** Marketplace / game pass API */
  robuxDiscountAmount?: number;
  discountPercentage?: number;
  robuxDiscountPercentage?: number;
  discountCampaign?: string;
  /** cart-pricing discount classification, e.g. `ROBLOX_PLUS` | `MARKETPLACE_OFFER`. */
  discountType?: string;
  discountId?: string;
  localizedDiscountAttribution?: string | null;
};

export type DiscountInformation = {
  originalPrice?: number;
  totalDiscountAmount?: number;
  /** Game pass API name for total saved */
  totalAmountSaved?: number;
  totalDiscountPercentage?: number;
  discounts?: DiscountLineInformation[];
};

/** Typed empty `discounts` for fixtures/tests (`[]` alone can infer as `any[]` under strict tooling). */
export const EMPTY_DISCOUNT_LINES: DiscountLineInformation[] = [];

export type NormalizedDiscountLine = {
  discountAmount: number;
  discountCampaign?: string;
  /** cart-pricing discount classification, e.g. `ROBLOX_PLUS` | `MARKETPLACE_OFFER`. */
  discountType?: string;
  label: string;
  /** Raw `localizedDiscountAttribution` from the API when present (no synthesized fallback). */
  localizedAttribution?: string;
  /** Percentage for Plus benefit discount copy (0–100 or API shape). */
  discountPercent?: number;
};

/** Output of {@link normalizeDiscountInformation} — pass through UI to avoid re-normalizing. */
export type NormalizedDiscountInformation = {
  savedAmount: number;
  originalPrice: number;
  totalPrice: number;
  discountLines: NormalizedDiscountLine[];
};

/** Maps API variants (marketplace, game pass, developer product) to a single display shape. */
export function normalizeDiscountInformation(
  discountInformation: DiscountInformation
): NormalizedDiscountInformation {
  const rawOriginal = discountInformation.originalPrice ?? 0;
  const savedAmount =
    discountInformation.totalDiscountAmount ?? discountInformation.totalAmountSaved ?? 0;
  const totalPrice = rawOriginal - savedAmount;

  const discountLines: NormalizedDiscountLine[] =
    discountInformation.discounts?.map((d: DiscountLineInformation, index: number) => {
      const amount = d.discountAmount ?? d.robuxDiscountAmount ?? 0;
      const localizedAttribution = d.localizedDiscountAttribution?.trim() || undefined;
      const label = localizedAttribution || d.discountCampaign || `Discount ${index + 1}`;
      return {
        discountAmount: amount,
        discountCampaign: d.discountCampaign || d.discountId || `line-${index}`,
        discountType: d.discountType,
        label,
        localizedAttribution,
        discountPercent: d.discountPercentage ?? d.robuxDiscountPercentage
      };
    }) ?? [];

  return {
    savedAmount,
    originalPrice: rawOriginal,
    totalPrice,
    discountLines
  };
}

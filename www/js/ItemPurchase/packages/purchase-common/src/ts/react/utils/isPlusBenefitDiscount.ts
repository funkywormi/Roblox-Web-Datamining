import type { NormalizedDiscountLine } from '../components/discountInformation';

const PLUS_BENEFIT_DISCOUNT_CAMPAIGN = 'BlackbirdSubscription';
const ROBLOX_PLUS_SUBSCRIPTION_CAMPAIGN = 'RobloxPlusSubscription';
const ROBLOX_SUBSCRIPTION_CAMPAIGN = 'RobloxSubscription';
/** cart-pricing classifies Plus benefit lines via `discountType` (campaign may be empty). */
const ROBLOX_PLUS_DISCOUNT_TYPE = 'ROBLOX_PLUS';

export default function isPlusBenefitDiscount(
  discounts?: NormalizedDiscountLine[] | null
): boolean {
  return !!discounts?.some(
    d =>
      d.discountType === ROBLOX_PLUS_DISCOUNT_TYPE ||
      d.discountCampaign === PLUS_BENEFIT_DISCOUNT_CAMPAIGN ||
      d.discountCampaign === ROBLOX_PLUS_SUBSCRIPTION_CAMPAIGN ||
      d.discountCampaign === ROBLOX_SUBSCRIPTION_CAMPAIGN
  );
}

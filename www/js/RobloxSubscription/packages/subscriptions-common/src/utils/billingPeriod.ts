import { PeriodType } from "@rbx/client-subscriptions-api/v2";

export type BillingPeriodPrice = {
  amount: number;
  currencyCode: string;
};

export type BillingPeriodOption = {
  productId: string;
  productType: string;
  months: number;
  price: BillingPeriodPrice;
  strikethroughPrice?: BillingPeriodPrice;
  freeTrialEndDate?: Date;
  /** Trial length, for the disclosure copy (e.g. "2 weeks free trial"). Set only when a trial applies. */
  freeTrialDuration?: number;
  freeTrialPeriodType?: PeriodType;
};

export function getBillingPeriodMonths(
  periodType: PeriodType,
  periodCount?: number | null,
): number | undefined {
  const count = periodCount != null && periodCount > 0 ? periodCount : 1;
  switch (periodType) {
    case PeriodType.Month:
      return count;
    case PeriodType.Year:
      return count * 12;
    case PeriodType.Week:
      return undefined;
  }
}

export function getPricePerMonth(option: BillingPeriodOption): number {
  return option.price.amount / option.months;
}

export function getSavingsPercent(option: BillingPeriodOption): number | undefined {
  const { price, strikethroughPrice } = option;
  if (
    !strikethroughPrice ||
    strikethroughPrice.currencyCode !== price.currencyCode ||
    strikethroughPrice.amount <= price.amount
  ) {
    return undefined;
  }
  const percent = Math.round((1 - price.amount / strikethroughPrice.amount) * 100);
  return percent > 0 ? percent : undefined;
}

export function getBestValueProductId(options: BillingPeriodOption[]): string | undefined {
  let best: { productId: string; savings: number; months: number } | undefined;
  options.forEach(option => {
    const savings = getSavingsPercent(option);
    if (savings === undefined) {
      return;
    }
    if (
      !best ||
      savings > best.savings ||
      (savings === best.savings && option.months > best.months)
    ) {
      best = { productId: option.productId, savings, months: option.months };
    }
  });
  return best?.productId;
}

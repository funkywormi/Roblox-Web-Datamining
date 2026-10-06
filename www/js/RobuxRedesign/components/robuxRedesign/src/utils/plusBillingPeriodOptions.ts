import { addBillingPeriod } from "@rbx/payments/services/subscriptions";
import { getBillingPeriodMonths, type BillingPeriodOption } from "@rbx/subscriptions-common";

import type { SectionSubscriptionV2Product } from "../types/buyRobuxPageData";
import {
  SECTION_PRODUCT_TYPE_TO_API,
  convertPeriodTypeForTranslation,
  getMoneyAmount,
  isPeriodType,
  parseRobuxAllowance,
} from "./subscriptionProduct";

export type PlusBillingPeriodPartition = {
  tileProducts: SectionSubscriptionV2Product[];
  billingPeriodOptions: BillingPeriodOption[];
};

const getMonths = (product: SectionSubscriptionV2Product) =>
  getBillingPeriodMonths(convertPeriodTypeForTranslation(product.periodType), product.periodCount);

const isBaseTerm = (product: SectionSubscriptionV2Product) =>
  SECTION_PRODUCT_TYPE_TO_API[product.subscriptionProductType] !== undefined &&
  parseRobuxAllowance(product.robuxAmount) === 0 &&
  getMonths(product) !== undefined;

const getFreeTrial = (product: SectionSubscriptionV2Product) => {
  const freeTrial = product.offers?.find(offer => offer.freeTrial)?.freeTrial;
  if (!freeTrial || !isPeriodType(freeTrial.periodType)) {
    return undefined;
  }
  // Convert the proto-style period type (e.g. PERIOD_TYPE_WEEK) to the client enum (Week).
  return {
    duration: freeTrial.duration,
    periodType: convertPeriodTypeForTranslation(freeTrial.periodType),
  };
};

const toBillingPeriodOption = (product: SectionSubscriptionV2Product): BillingPeriodOption => {
  const freeTrial = getFreeTrial(product);
  return {
    productId: product.subscriptionProductId,
    productType: SECTION_PRODUCT_TYPE_TO_API[product.subscriptionProductType] ?? "",
    months: getMonths(product) ?? 1,
    price: { amount: getMoneyAmount(product.price), currencyCode: product.price.currencyCode },
    strikethroughPrice: product.strikethroughPrice && {
      amount: getMoneyAmount(product.strikethroughPrice),
      currencyCode: product.strikethroughPrice.currencyCode,
    },
    freeTrialEndDate: freeTrial
      ? addBillingPeriod(Date.now(), freeTrial.duration, freeTrial.periodType)
      : undefined,
    freeTrialDuration: freeTrial?.duration,
    freeTrialPeriodType: freeTrial?.periodType,
  };
};

export function partitionPlusBillingPeriods(
  products: SectionSubscriptionV2Product[],
): PlusBillingPeriodPartition {
  const baseTerms = products.filter(isBaseTerm);
  const hasMonthly = baseTerms.some(product => getMonths(product) === 1);
  const hasExtendedTerm = baseTerms.some(product => (getMonths(product) ?? 0) > 1);
  if (!hasMonthly || !hasExtendedTerm) {
    return { tileProducts: products, billingPeriodOptions: [] };
  }
  return {
    tileProducts: products.filter(product => !isBaseTerm(product) || getMonths(product) === 1),
    billingPeriodOptions: baseTerms.map(toBillingPeriodOption),
  };
}

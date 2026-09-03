import { httpService } from 'core-utilities';
import urlConfigs from '../constants/urlConfigs';
import {
  TSubscriptionProductsResponse,
  TSubscriptionStatus,
  TSubscriptionProduct
} from '../constants/types';

let cachedSubscriptionStatus: TSubscriptionStatus | null = null;

function parseSubscriptionProduct(product: TSubscriptionProduct): TSubscriptionStatus {
  const { productTypeDetails, eligibleOffers } = product;

  const hasFreeTrial = eligibleOffers?.some(offer => offer.offerType === 'FreeTrial') ?? false;

  const discounts =
    productTypeDetails?.robloxSubscriptionProductDetails?.featureConfig
      ?.virtualTransactionDiscounts ?? [];

  let discountPercentage = 0;
  if (discounts.length > 0) {
    const lowestPeriodDiscount = discounts.reduce((lowest, current) =>
      current.periodIndex < lowest.periodIndex ? current : lowest
    );
    discountPercentage = lowestPeriodDiscount.discountPercent;
  }

  return {
    hasSubscription: false,
    hasFreeTrial,
    discountPercentage,
    priceDisplayString: product.localizedPriceDisplayString
  };
}

export async function fetchSubscriptionStatus(): Promise<TSubscriptionStatus> {
  if (cachedSubscriptionStatus !== null) {
    return cachedSubscriptionStatus;
  }

  try {
    const response = await httpService.get<TSubscriptionProductsResponse>(
      urlConfigs.subscriptionProducts
    );

    const { products } = response.data;

    if (!products || products.length === 0) {
      cachedSubscriptionStatus = {
        hasSubscription: true,
        hasFreeTrial: false,
        discountPercentage: 0,
        priceDisplayString: ''
      };
    } else {
      cachedSubscriptionStatus = parseSubscriptionProduct(products[0]);
    }

    return cachedSubscriptionStatus;
  } catch (error) {
    return {
      hasSubscription: false,
      hasFreeTrial: false,
      discountPercentage: 0,
      priceDisplayString: ''
    };
  }
}

export function clearSubscriptionCache(): void {
  cachedSubscriptionStatus = null;
}

export default { fetchSubscriptionStatus, clearSubscriptionCache };

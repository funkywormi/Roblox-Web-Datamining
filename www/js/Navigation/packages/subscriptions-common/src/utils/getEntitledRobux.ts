import { ONE_ROBUX_IN_MICROS } from "../subscriptionConstants";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";

/** The Robux allowance a Plus product grants, in whole Robux. */
export const getEntitledRobux = (product: SubscriptionProductInfo): number =>
  Math.floor(
    (product.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig
      .currencySubscriptionConfig?.entitledAmountMicros ?? 0) / ONE_ROBUX_IN_MICROS,
  );

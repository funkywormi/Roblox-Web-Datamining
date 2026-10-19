import { getEntitledRobux } from "./getEntitledRobux";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import type { Translator } from "@rbx/www-common/i18n";

/** "Plus 500" for a tier with a Robux allowance, plain "Plus" otherwise. */
export const getPlusProductName = (
  product: SubscriptionProductInfo,
  t: Translator<"Feature.RobloxSubscription">,
): string => {
  const robux = getEntitledRobux(product);
  return robux > 0 ? `${t("Label.BlackbirdShort")} ${robux}` : t("Label.Blackbird");
};

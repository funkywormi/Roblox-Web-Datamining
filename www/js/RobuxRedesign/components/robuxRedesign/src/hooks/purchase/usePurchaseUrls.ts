import { useCallback, useMemo } from "react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { composeQueryString } from "@rbx/core-scripts/util/url";
import { PaymentSession, Product } from "../../types/buyRobuxPageData";

const desktopPurchaseUrl = "/upgrades/paymentmethods";
const mobilePurchaseUrl = "/mobile-app-upgrades/buy";

export function usePurchaseUrls(
  paymentSession: PaymentSession | undefined,
): (product: Product, isSubscriptionProduct: boolean) => string {
  const paymentSessionId = paymentSession?.id;
  const deviceMeta = useMemo(() => getDeviceMeta(), []);

  // Summarizing special cases:
  // Android, Amazon and UWP take a lower-cased `id` arg, iOS does not
  // Android takes a special `recurring` arg based on the mobile product id
  // Amazon and UWP don't take a payment session id arg (TODO: is this a bug?)
  return useCallback(
    ({ productId, providerProductId }: Product, isSubscriptionProduct: boolean): string => {
      if (deviceMeta?.isAndroidApp && providerProductId) {
        return `${mobilePurchaseUrl}?${composeQueryString({
          id: providerProductId.toLowerCase(),
          paymentSessionId,
          recurring: isSubscriptionProduct && !providerProductId.endsWith("onemonth"),
        })}`;
      }

      if ((deviceMeta?.isAmazonApp || deviceMeta?.isUWPApp) && providerProductId) {
        return `${mobilePurchaseUrl}?${composeQueryString({
          id: providerProductId.toLowerCase(),
        })}`;
      }

      if (deviceMeta?.isIosApp && providerProductId) {
        return `${mobilePurchaseUrl}?${composeQueryString({
          id: providerProductId,
          paymentSessionId,
        })}`;
      }

      return `${desktopPurchaseUrl}?${composeQueryString({
        ap: productId,
        page: "RobuxRedesign",
        paymentSessionId,
      })}`;
    },
    [deviceMeta, paymentSessionId],
  );
}

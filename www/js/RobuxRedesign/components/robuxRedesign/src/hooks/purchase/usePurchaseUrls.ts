import { useCallback, useMemo } from "react";
import { UrlSearchParams } from "@rbx/core-lib/url";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
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
        return `${mobilePurchaseUrl}?${UrlSearchParams.new({
          id: providerProductId.toLowerCase(),
          ...(paymentSessionId !== undefined ? { paymentSessionId } : {}),
          recurring: isSubscriptionProduct && !providerProductId.endsWith("onemonth"),
        }).toString()}`;
      }

      if ((deviceMeta?.isAmazonApp || deviceMeta?.isUWPApp) && providerProductId) {
        return `${mobilePurchaseUrl}?${UrlSearchParams.new({
          id: providerProductId.toLowerCase(),
        }).toString()}`;
      }

      if (deviceMeta?.isIosApp && providerProductId) {
        return `${mobilePurchaseUrl}?${UrlSearchParams.new({
          id: providerProductId,
          ...(paymentSessionId !== undefined ? { paymentSessionId } : {}),
        }).toString()}`;
      }

      return `${desktopPurchaseUrl}?${UrlSearchParams.new({
        ap: productId,
        page: "RobuxRedesign",
        ...(paymentSessionId !== undefined ? { paymentSessionId } : {}),
      }).toString()}`;
    },
    [deviceMeta, paymentSessionId],
  );
}

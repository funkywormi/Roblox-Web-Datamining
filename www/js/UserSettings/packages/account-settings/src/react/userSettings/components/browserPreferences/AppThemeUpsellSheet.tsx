import { SheetRoot } from "@rbx/foundation-ui";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { RobloxSubscriptionSheet } from "@rbx/subscriptions-common";
import { useGetPlusSubscriptionProductQuery } from "../../../apis/subscriptionsApi";
import { getAccountSettingsReturnUrl } from "../../utils/navigationUtils";

export default function AppThemeUpsellSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: subscriptionProductInfo } = useGetPlusSubscriptionProductQuery(undefined, {
    skip: !open,
  });
  const deviceMeta = getDeviceMeta();

  return (
    <SheetRoot open={open} onOpenChange={onOpenChange}>
      {open && subscriptionProductInfo && deviceMeta && (
        <RobloxSubscriptionSheet
          subscriptionProductInfo={subscriptionProductInfo}
          deviceMeta={deviceMeta}
          triggeringContext={
            paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_APP_THEME_PLUS_UPSELL
          }
          redirectUrl={getAccountSettingsReturnUrl()}
        />
      )}
    </SheetRoot>
  );
}

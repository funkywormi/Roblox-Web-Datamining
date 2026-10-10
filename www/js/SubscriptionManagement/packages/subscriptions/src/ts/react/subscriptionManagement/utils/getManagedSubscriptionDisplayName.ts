import { ProductType } from "@rbx/client-subscriptions-api/v2";
import { ONE_ROBUX_IN_MICROS } from "@rbx/subscriptions-common";
import { UserSubscription } from "../../../core/types/userSubscription";

export const entitledRobux = (sub: UserSubscription): number => {
  const micros = sub.currencySubscriptionBenefit?.entitledAmountMicrosPerGrantingPeriod ?? 0;
  return micros > 0 ? micros / ONE_ROBUX_IN_MICROS : 0;
};

export const getManagedSubscriptionDisplayName = (
  sub: UserSubscription,
  translate: (key: string) => string,
): string => {
  switch (sub.productType) {
    case ProductType.Blackbird: {
      const robux = entitledRobux(sub);
      return robux > 0 ? `Plus ${robux}` : translate("Label.Blackbird");
    }
    case ProductType.CurrencySubscription:
      return translate("Label.CurrencySubscription");
    case ProductType.RobuxSubscription: {
      const label = translate("Label.RobuxSubscription");
      const robux = entitledRobux(sub);
      return robux > 0 ? `${label} ${robux} Robux` : label;
    }
    default:
      return sub.name;
  }
};

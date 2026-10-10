import React, { useState } from "react";
import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import {
  getEntitledRobux,
  usePlanChangeProducts,
  usePreparePlanChange,
  useReservePlanChange,
} from "@rbx/subscriptions-common";
import { useFormatter, useTranslations } from "@rbx/www-common/i18n";
import { UserSubscription } from "../../../core/types/userSubscription";
import useSystemFeedbackContext from "../../shared/hooks/useSystemFeedback";
import { entitledRobux } from "../utils/getManagedSubscriptionDisplayName";
import PlanChangeConfirmDialog from "./PlanChangeConfirmDialog";
import PlanChangePackageTile, { PlanChangePackageBenefit } from "./PlanChangePackageTile";

type OtherPackagesSectionProps = {
  subscription: UserSubscription;
};

type PricedProduct = SubscriptionProductInfo & { localizedPriceDisplayString: string };

const OtherPackagesSection: React.FC<OtherPackagesSectionProps> = ({ subscription }) => {
  const t = useTranslations("Feature.RobloxSubscription");
  const format = useFormatter();
  const { systemFeedbackService } = useSystemFeedbackContext();
  const { subscriptionId } = subscription;
  // A plan change is keyed on the subscription id, which V1-only rows don't have.
  const { planChangeProducts } = usePlanChangeProducts({ enabled: subscriptionId !== undefined });
  const {
    mutate: preparePlanChange,
    isLoading: isPreparing,
    variables: preparingVariables,
  } = usePreparePlanChange();
  const { mutate: reservePlanChange, isLoading: isReserving } = useReservePlanChange();
  const [preparedPlanChangeId, setPreparedPlanChangeId] = useState<number>();
  // Kept after the dialog closes so its copy doesn't blank out while it animates away.
  const [targetProduct, setTargetProduct] = useState<PricedProduct>();

  const packages = planChangeProducts.filter((product): product is PricedProduct =>
    Boolean(product.localizedPriceDisplayString),
  );
  if (subscriptionId === undefined || packages.length === 0) {
    return null;
  }

  // Plan changes take effect at the next renewal.
  const changeDate = format.dateTime(subscription.renewal, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const getProductName = (product: SubscriptionProductInfo) => {
    const robux = getEntitledRobux(product);
    return robux > 0 ? `${t("Label.BlackbirdShort")} ${robux}` : t("Label.Blackbird");
  };

  const getBenefits = (product: SubscriptionProductInfo): PlanChangePackageBenefit[] => {
    const robux = getEntitledRobux(product);
    const benefits: PlanChangePackageBenefit[] = [];
    if (robux > 0) {
      benefits.push(
        { iconName: "icon-regular-roblox-plus", text: t("Description.Benefit.AllPlus.V2") },
        {
          iconName: "icon-regular-robux",
          text: t("Description.Benefit.RobuxAllowance", { amount: format.number(robux) }),
        },
      );
      const oldAmount = product.localizedStrikethroughPriceDisplayString;
      if (oldAmount) {
        benefits.push({
          iconName: "icon-regular-pig",
          text: t("Description.Benefit.BetterValue.V2", { oldAmount }),
        });
      }
      return benefits;
    }

    // "Up to {discountPercent} off" advertises the ceiling, so take the highest tenure tier.
    const maxDiscountPercent = Math.max(
      0,
      ...(
        product.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig
          .virtualTransactionDiscounts ?? []
      ).map(discount => discount.discountPercent),
    );
    if (maxDiscountPercent > 0) {
      benefits.push({
        iconName: "icon-regular-tag",
        text: t("Description.Benefit.DiscountBuyRobux", {
          discountPercent: format.number(maxDiscountPercent / 100, {
            style: "percent",
            maximumFractionDigits: 0,
          }),
        }),
      });
    }
    benefits.push(
      {
        iconName: "icon-regular-controller",
        text: t("Description.Benefit.PrivateServersExpandedTitle"),
      },
      { iconName: "icon-regular-robux", text: t("Description.Benefit.RobuxTransfers") },
      { iconName: "icon-regular-paint-brush", text: t("Description.Benefit.ProfileFrameAppTheme") },
    );
    return benefits;
  };

  const getDialogDescription = (product: PricedProduct) => {
    const robux = getEntitledRobux(product);
    const productName = getProductName(product);
    const price = product.localizedPriceDisplayString;
    if (robux === 0) {
      return t("Subtext.PlanChangeDialogNoRobux", { productName, price, date: changeDate });
    }
    const values = { productName, robuxAmount: format.number(robux), price, date: changeDate };
    return robux > entitledRobux(subscription)
      ? t("Subtext.PlanChangeDialog", values)
      : t("Subtext.PlanChangeDialogDowngrade", values);
  };

  const onPlanChangeFailed = () => {
    setPreparedPlanChangeId(undefined);
    systemFeedbackService.warning(t("Message.PlanChangeFailed"));
  };

  const onChangePlan = (product: PricedProduct) => {
    if (isPreparing || isReserving) {
      return;
    }
    setTargetProduct(product);
    preparePlanChange(
      { subscriptionId, targetSubscriptionProductKey: product.productKey },
      { onSuccess: setPreparedPlanChangeId, onError: onPlanChangeFailed },
    );
  };

  const onConfirm = () => {
    if (isPreparing || isReserving || preparedPlanChangeId === undefined || !targetProduct) {
      return;
    }
    const productName = getProductName(targetProduct);
    reservePlanChange(
      { subscriptionId, planChangeId: preparedPlanChangeId },
      {
        onSuccess: () => {
          setPreparedPlanChangeId(undefined);
          systemFeedbackService.success(
            t("Message.PlanChangeScheduled", { productName, date: changeDate }),
          );
        },
        onError: onPlanChangeFailed,
      },
    );
  };

  return (
    <section className="gap-large margin-top-large flex flex-col [grid-column:1/3]">
      <h2 className="text-heading-small content-emphasis margin-none">
        {t("Heading.OtherPackages")}
      </h2>
      {packages.map(product => (
        <PlanChangePackageTile
          key={product.productKey.id}
          actionLabel={t("Action.PricePerMonth", {
            price: product.localizedPriceDisplayString,
            periodType: product.periodType,
          })}
          benefits={getBenefits(product)}
          isActionLoading={
            isPreparing && preparingVariables?.targetSubscriptionProductKey === product.productKey
          }
          price={product.localizedPriceDisplayString}
          strikethroughPrice={product.localizedStrikethroughPriceDisplayString}
          title={getProductName(product)}
          onAction={() => {
            onChangePlan(product);
          }}
        />
      ))}
      <PlanChangeConfirmDialog
        description={targetProduct ? getDialogDescription(targetProduct) : ""}
        isConfirming={isReserving}
        open={preparedPlanChangeId !== undefined}
        onConfirm={onConfirm}
        onOpenChange={open => {
          if (!open) {
            setPreparedPlanChangeId(undefined);
          }
        }}
      />
    </section>
  );
};

export default OtherPackagesSection;

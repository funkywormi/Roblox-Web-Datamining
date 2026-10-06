import { PeriodType } from "@rbx/client-subscriptions-api/v2";
import { useTranslation } from "@rbx/core-scripts/react";
import { SheetActions, SheetBody, SheetContent, SheetRoot, SheetTitle } from "@rbx/foundation-ui";
import { getFreeTrialDisplay } from "@rbx/payments/services/subscriptions";
import { translateHtml } from "@rbx/translation-utils";
import { useEffect, useMemo, useRef, useState } from "react";

import BillingPeriodOptionRow from "./BillingPeriodOptionRow";
import {
  trackBillingPeriodOptionSelected,
  trackBillingPeriodSheetDismissed,
  trackBillingPeriodSheetShown,
  trackBillingPeriodSubscribeClick,
} from "./billingPeriodTracking";
import { SUBSCRIPTION_TERMS_URL } from "../../subscriptionConstants";
import { getBestValueProductId } from "../../utils/billingPeriod";
import SubscriptionButton from "../shared/SubscriptionButton";

import type { BillingPeriodAnalyticsContext } from "./billingPeriodTracking";
import type { BillingPeriodOption } from "../../utils/billingPeriod";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { FC, ReactNode } from "react";

export type BillingPeriodSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  options: BillingPeriodOption[];
  analyticsContext: BillingPeriodAnalyticsContext;
  deviceMeta: DeviceMeta;
  paymentSessionId?: string;
  referrerId?: string;
  isDisabled?: boolean;
  onOptionSelect?: (option: BillingPeriodOption) => void;
  onSubscribeClick?: (option: BillingPeriodOption) => void;
  onMobilePurchaseInitiated?: () => void;
};

const termsLink = [
  {
    opening: "linkStart",
    closing: "linkEnd",
    render: (children: ReactNode) => (
      <a
        className="underline"
        href={SUBSCRIPTION_TERMS_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    ),
  },
];

const BillingPeriodSheet: FC<BillingPeriodSheetProps> = ({
  isOpen,
  onOpenChange,
  options,
  analyticsContext,
  deviceMeta,
  paymentSessionId,
  referrerId,
  isDisabled = false,
  onOptionSelect,
  onSubscribeClick,
  onMobilePurchaseInitiated,
}) => {
  const { translate } = useTranslation();
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const hasTrackedShown = useRef(false);

  const bestValueProductId = useMemo(() => getBestValueProductId(options), [options]);

  useEffect(() => {
    if (!isOpen) {
      hasTrackedShown.current = false;
      return;
    }
    if (hasTrackedShown.current || options.length === 0 || !paymentSessionId) {
      return;
    }
    hasTrackedShown.current = true;
    trackBillingPeriodSheetShown({ analyticsContext, paymentSessionId }, options);
  }, [analyticsContext, isOpen, options, paymentSessionId]);

  const selectedOption = options.find(o => o.productId === selectedProductId) ?? options[0];

  if (!selectedOption) {
    return null;
  }

  const trackingArgs = { analyticsContext, paymentSessionId };
  const { freeTrialEndDate, freeTrialDuration, freeTrialPeriodType } = selectedOption;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      trackBillingPeriodSheetDismissed(trackingArgs, selectedOption);
    }
    onOpenChange(open);
  };

  // Resolve the trial length into display copy ("2 weeks"); billing cadence is monthly for the base trial.
  const trialDisplay =
    freeTrialDuration !== undefined && freeTrialPeriodType !== undefined
      ? getFreeTrialDisplay(
          { freeTrialOffer: { duration: freeTrialDuration, periodType: freeTrialPeriodType } },
          PeriodType.Month,
        )
      : null;

  const legalFooter =
    freeTrialEndDate === undefined
      ? translateHtml(translate, "Description.SubscriptionLegalBillingCycle", termsLink)
      : trialDisplay
        ? translateHtml(translate, "Description.SubscriptionFreeTrialLegalV2", termsLink, {
            date: freeTrialEndDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            trialDuration: String(trialDisplay.trialDuration),
            trialPeriodLabel: translate(trialDisplay.trialPeriodKey),
            billingPeriodLabel: translate(trialDisplay.billingPeriodKey),
          })
        : translateHtml(translate, "Description.SubscriptionFreeTrialLegal", termsLink, {
            date: freeTrialEndDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });

  return (
    <SheetRoot open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        centerSheetSize="Medium"
        closeLabel={translate("Action.Close")}
        largeScreenVariant="center"
      >
        <SheetTitle>{translate("Heading.ChooseBillingPeriod")}</SheetTitle>
        <SheetBody
          className="gap-y-xxlarge padding-bottom-medium flex flex-col"
          data-testid="billing-period-sheet-body"
        >
          <p className="text-body-medium content-default">
            {translate("Description.ChooseBillingPeriod")}
          </p>
          <div className="gap-y-medium flex flex-col">
            {options.map(option => (
              <BillingPeriodOptionRow
                key={option.productId}
                isBestValue={option.productId === bestValueProductId}
                isSelected={option.productId === selectedOption.productId}
                option={option}
                onSelect={() => {
                  if (option.productId !== selectedOption.productId) {
                    trackBillingPeriodOptionSelected(trackingArgs, option);
                  }
                  setSelectedProductId(option.productId);
                  onOptionSelect?.(option);
                }}
              />
            ))}
          </div>
        </SheetBody>
        <SheetActions>
          <div className="gap-y-medium flex flex-col">
            <SubscriptionButton
              className="width-full"
              deviceMeta={deviceMeta}
              isDisabled={isDisabled}
              paymentSessionId={paymentSessionId}
              productId={selectedOption.productId}
              productType={selectedOption.productType}
              referrerId={referrerId}
              size="Medium"
              trackSubscriptionButtonClick={() => {
                trackBillingPeriodSubscribeClick(trackingArgs, selectedOption);
                onSubscribeClick?.(selectedOption);
              }}
              onMobilePurchaseInitiated={onMobilePurchaseInitiated}
            >
              {freeTrialEndDate === undefined
                ? translate("Action.Subscribe")
                : translate("Action.TryItForFree")}
            </SubscriptionButton>
            <p
              className="text-body-small content-default text-align-x-left"
              data-testid="billing-period-legal-footer"
            >
              {legalFooter}
            </p>
          </div>
        </SheetActions>
      </SheetContent>
    </SheetRoot>
  );
};

export default BillingPeriodSheet;

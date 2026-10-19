import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Link,
} from "@rbx/foundation-ui";
import { useFormatter, useLocale, useTranslations } from "@rbx/www-common/i18n";
import { format as formatDate } from "date-fns";
import { useState } from "react";

import { useCancelPlanChange } from "../../hooks/useCancelPlanChange";
import { usePendingPlanChange } from "../../hooks/usePendingPlanChange";
import { usePlanChangeTargetProduct } from "../../hooks/usePlanChangeTargetProduct";
import { getPlusProductName } from "../../utils/getPlusProductName";

import type { CSSProperties, FC } from "react";

export type PendingPlanChangeBannerProps = {
  // V1-only subscriptions have no id and can't hold a plan change.
  subscriptionId?: string;
  // Used when the plan change has no scheduled time; a change takes effect at renewal.
  nextRenewalTimestampMs?: number | null;
  // Applied only when the banner renders, so a hidden banner leaves no layout gap.
  className?: string;
  style?: CSSProperties;
  testId?: string;
};

// Announces a scheduled Plus plan change and lets the subscriber cancel it.
const PendingPlanChangeBanner: FC<PendingPlanChangeBannerProps> = ({
  subscriptionId,
  nextRenewalTimestampMs,
  className,
  style,
  testId,
}) => {
  const t = useTranslations("Feature.RobloxSubscription");
  const format = useFormatter();
  const locale = useLocale();
  const { pendingPlanChange } = usePendingPlanChange({ subscriptionId });
  const { targetProduct } = usePlanChangeTargetProduct({
    productKey: pendingPlanChange?.targetSubscriptionProductKey,
  });
  const {
    mutate: cancelPlanChange,
    isLoading: isCancelling,
    isError,
    reset,
  } = useCancelPlanChange();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // A refetch before the provider confirms the cancel would otherwise bring the banner back.
  const [cancelledPlanChangeId, setCancelledPlanChangeId] = useState<number>();

  const changeTimestampMs = pendingPlanChange?.scheduledTimestampMs ?? nextRenewalTimestampMs;
  const price = targetProduct?.localizedPriceDisplayString;
  if (
    !subscriptionId ||
    !pendingPlanChange ||
    pendingPlanChange.planChangeId === cancelledPlanChangeId ||
    !targetProduct ||
    !price ||
    !changeTimestampMs
  ) {
    return null;
  }

  const { planChangeId } = pendingPlanChange;
  const productName = getPlusProductName(targetProduct, t);
  const formatChangeDate = (includeYear = false) =>
    includeYear && new Intl.Locale(locale).language === "en"
      ? formatDate(changeTimestampMs, "MMMM do, yyyy")
      : format.dateTime(changeTimestampMs, {
          ...(includeYear && { year: "numeric" }),
          month: "long",
          day: "numeric",
        });

  const onConfirmCancel = () => {
    if (isCancelling) {
      return;
    }
    cancelPlanChange(
      { subscriptionId, planChangeId },
      {
        onSuccess: () => {
          setCancelledPlanChangeId(planChangeId);
          setIsDialogOpen(false);
        },
      },
    );
  };

  return (
    <div
      className={`gap-small padding-medium bg-shift-200 radius-medium width-full flex items-start justify-between${className ? ` ${className}` : ""}`}
      data-testid={testId}
      style={style}
    >
      <span className="text-body-medium content-default">
        {t.html(
          "Description.PendingPlanChangeBanner",
          [
            {
              opening: "boldStart",
              closing: "boldEnd",
              render: children => <b className="content-emphasis">{children}</b>,
            },
          ],
          {
            productName,
            date: formatChangeDate(),
          },
        )}
      </span>
      <Link
        as="button"
        className="shrink-0"
        size="Medium"
        underline="always"
        onClick={() => {
          // Cleared on open rather than close so an in-flight cancel keeps its success callback.
          if (!isCancelling) {
            reset();
          }
          setIsDialogOpen(true);
        }}
      >
        {t("Action.CancelPlanChange")}
      </Link>
      <Dialog
        closeLabel={t("Action.Close")}
        hasCloseAffordance
        isModal
        open={isDialogOpen}
        size="Small"
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent>
          <DialogBody className="gap-xsmall flex flex-col">
            <DialogTitle className="text-heading-small content-emphasis">
              {t("Header.PendingPlanChangeDialogTitle")}
            </DialogTitle>
            <p className="text-body-medium content-default">
              {t("Description.PendingPlanChangeDialog", {
                productName,
                price,
                date: formatChangeDate(true),
              })}
            </p>
            {
              // Present before the failure text arrives, so a screen reader can announce the change.
              // A span, since the legacy theme's `.light-theme p` color outranks content-system-alert.
              <span
                className={
                  isError
                    ? "text-caption-medium content-system-alert"
                    : "absolute overflow-hidden [width:0] [height:0]"
                }
                role="alert"
              >
                {isError ? t("Message.CancelPlanChangeFailed") : ""}
              </span>
            }
          </DialogBody>
          <DialogFooter>
            <Button
              className="width-full"
              isLoading={isCancelling}
              size="Medium"
              variant="Standard"
              onClick={onConfirmCancel}
            >
              {t("Action.CancelPendingPlanChange")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingPlanChangeBanner;

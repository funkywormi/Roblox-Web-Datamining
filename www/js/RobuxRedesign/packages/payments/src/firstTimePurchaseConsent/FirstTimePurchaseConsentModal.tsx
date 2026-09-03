import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  TCheckboxCheckState,
} from "@rbx/foundation-ui";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import type { FireTelemetryCounterFn } from "@rbx/web-telemetry/fire";

type TriggeringContext = Parameters<
  typeof paymentFlowAnalyticsService.sendUserPurchaseFlowEvent
>[0];

export type FirstTimePurchaseConsentModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  publishMetric: FireTelemetryCounterFn;
  triggerContext: TriggeringContext;
};

export function FirstTimePurchaseConsentModal({
  isOpen,
  onConfirm,
  onCancel,
  publishMetric,
  triggerContext,
}: FirstTimePurchaseConsentModalProps) {
  const { translate } = useTranslation();

  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const hasTrackedOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasTrackedOpenRef.current) {
      hasTrackedOpenRef.current = true;
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        triggerContext,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.FIRST_TIME_PURCHASE_CONSENT_MODAL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      );
    }
    if (!isOpen) {
      hasTrackedOpenRef.current = false;
    }
  }, [isOpen, triggerContext]);

  const onCheckedChange = useCallback(
    (checked: TCheckboxCheckState) => {
      setIsConsentChecked(checked === true);
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        triggerContext,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.FIRST_TIME_PURCHASE_CONSENT_MODAL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        undefined,
        { checkboxState: String(checked === true) },
      );
    },
    [triggerContext],
  );

  const handleConfirm = useCallback(() => {
    publishMetric("FirstTimePurchaseConsent_Confirmed");
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      triggerContext,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.FIRST_TIME_PURCHASE_CONSENT_MODAL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CONFIRM,
    );
    setIsConsentChecked(false);
    onConfirm();
  }, [onConfirm, publishMetric, triggerContext]);

  const handleCancel = useCallback(() => {
    publishMetric("FirstTimePurchaseConsent_Cancelled");
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      triggerContext,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.FIRST_TIME_PURCHASE_CONSENT_MODAL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.CANCEL,
    );
    setIsConsentChecked(false);
    onCancel();
  }, [onCancel, publishMetric, triggerContext]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleCancel();
        }
      }}
      size="Small"
      isModal
      hasCloseAffordance={false}
    >
      <DialogContent>
        <DialogBody>
          <div className="text-heading-small content-emphasis padding-y-[4px]">
            {translate("Label.AskParentFirst")}
          </div>
          <div className="text-body-medium padding-bottom-large content-default">
            {translateHtml(translate, "Description.ParentalApprovalRequired", [
              {
                opening: "learnLinkStart",
                closing: "learnLinkEnd",
                render: children => (
                  <a
                    target="_blank"
                    href="https://en.help.roblox.com/hc/en-us/articles/4409558125460-Monthly-Spending-Limits-and-Notifications-FAQ"
                    className="color-content-default [text-decoration:underline] [text-underline-position:from-font]"
                    rel="noreferrer"
                  >
                    {children}
                  </a>
                ),
              },
            ])}
          </div>
          <div className="flex flex-row gap-medium">
            <Checkbox
              isChecked={isConsentChecked}
              onCheckedChange={onCheckedChange}
              label=""
              size="Medium"
              placement="Start"
            />
            <div className="text-body-small content-emphasis">
              {translateHtml(translate, "Description.ParentalApprovalConfirmation", [
                {
                  opening: "termsLinkStart",
                  closing: "termsLinkEnd",
                  render: children => (
                    <a
                      target="_blank"
                      href="https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use"
                      className="color-content-emphasis [text-decoration:underline] [text-underline-position:from-font]"
                      rel="noreferrer"
                    >
                      {children}
                    </a>
                  ),
                },
              ])}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-col gap-small padding-top-xsmall">
            <Button
              className={classNames({
                "[background-color:var(--color-action-emphasis-background)]": !isConsentChecked,
              })}
              isDisabled={!isConsentChecked}
              onClick={handleConfirm}
              variant="Emphasis"
              size="Medium"
            >
              {translate("Action.Continue")}
            </Button>
            <Button className="width-full" onClick={handleCancel} variant="Standard" size="Medium">
              {translate("Action.Cancel")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

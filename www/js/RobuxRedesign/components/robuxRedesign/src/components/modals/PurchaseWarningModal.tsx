/* eslint-disable react/no-danger */
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import {
  PurchaseWarningAction,
  acknowledgePurchaseWarning,
} from "../../services/purchaseWarningsService";
import { ModalContext } from "../../contexts/ModalContext";
import { trackCounter, trackError } from "../../observability";

const lineBreak = "<br /><br />";

export function PurchaseWarningModal() {
  const {
    purchaseWarning: { action, closeModal, continuePurchase, isOpen },
  } = useContext(ModalContext);

  const { translate } = useTranslation();

  const body = useMemo(() => {
    switch (action) {
      case PurchaseWarningAction.U13PaymentModal: {
        return translate("Description.ScaryModalBodyNew", { lineBreak });
      }
      case PurchaseWarningAction.ParentalConsentWarningPaymentModal13To17: {
        return translate("Description.ScaryModalBody13To17");
      }
      case PurchaseWarningAction.U13MonthlyThreshold1Modal: {
        return translate("Description.ScaryModalThreshold1Body", { linebreak: lineBreak });
      }
      case PurchaseWarningAction.U13MonthlyThreshold2Modal: {
        return translate("Description.ScaryModalThreshold2Body", { linebreak: lineBreak });
      }
      case PurchaseWarningAction.RequireEmailVerification:
      case undefined:
      default:
        return null;
    }
  }, [action, translate]);

  const onPurchaseWarningConfirm = useCallback(() => {
    if (!action) {
      return;
    }

    acknowledgePurchaseWarning(action)
      .then(() => {
        trackCounter("PurchaseWarningAcknowledged");
      })
      .catch((error: unknown) => {
        trackError("PurchaseWarningAcknowledgeFailed", {}, error);
      })
      .finally(() => {
        // acknowledge is best effort, so we continue the purchase regardless of success or failure
        closeModal();
        continuePurchase?.();
      });
  }, [action, closeModal, continuePurchase]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      size="Medium"
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle>{translate("Heading.ScaryModalTitle")}</DialogTitle>
          <div>
            {body && (
              <div>
                <span className="text-description" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-row gap-medium">
            <Button onClick={onPurchaseWarningConfirm} variant="Emphasis" className="width-full">
              {translate("Action.OK")}
            </Button>
            <Button onClick={closeModal} variant="Standard" className="width-full">
              {translate("Action.Cancel")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

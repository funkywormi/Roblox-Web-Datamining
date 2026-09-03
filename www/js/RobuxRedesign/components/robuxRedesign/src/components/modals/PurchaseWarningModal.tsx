/* eslint-disable react/no-danger */
import { useCallback, useContext, useEffect, useMemo } from "react";
import { createModal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  PurchaseWarningAction,
  acknowledgePurchaseWarning,
} from "../../services/purchaseWarningsService";
import { ModalContext } from "../../contexts/ModalContext";

const lineBreak = "<br /><br />";

export function PurchaseWarningModal() {
  const {
    purchaseWarning: { action, closeModal, continuePurchase, isOpen },
  } = useContext(ModalContext);

  const { translate } = useTranslation();

  const [Modal, modalService] = createModal();

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

  const onPurchaseWarningConfirm = useCallback(async () => {
    if (!action) {
      return;
    }

    await acknowledgePurchaseWarning(action);
    continuePurchase?.();
  }, [action, continuePurchase]);

  useEffect(() => {
    if (isOpen) {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [isOpen, modalService]);

  return (
    <Modal
      title={translate("Heading.ScaryModalTitle")}
      body={
        body && (
          <div>
            <div className="image-center">
              <div className="icon-warning-no-tilt" />
            </div>
            <span className="text-description" dangerouslySetInnerHTML={{ __html: body }} />
          </div>
        )
      }
      actionButtonShow
      actionButtonText={translate("Action.OK")}
      neutralButtonText={translate("Action.Cancel")}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onAction={onPurchaseWarningConfirm}
      onNeutral={() => {
        modalService.close();
        closeModal();
      }}
      closeable
      size="md"
    />
  );
}

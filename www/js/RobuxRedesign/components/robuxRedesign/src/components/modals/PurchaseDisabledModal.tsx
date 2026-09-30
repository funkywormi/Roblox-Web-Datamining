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
import { ModalContext } from "../../contexts/ModalContext";
import { TrackingContext } from "../../contexts/TrackingContext";

export function PurchaseDisabledModal() {
  const {
    purchaseDisabled: { closeModal, hasUserDisabledPurchases, isOpen, showVPCOptimization },
  } = useContext(ModalContext);
  const { trackPurchaseDisabledConfirm, trackPurchaseDisabledNeutral } =
    useContext(TrackingContext);

  const { translate } = useTranslation();

  const [title, body] = useMemo(() => {
    if (showVPCOptimization && !hasUserDisabledPurchases) {
      return [
        translate("Label.RequestPending"),
        translate("Description.ExistingPendingRequestRedirectToSettings"),
      ];
    } else if (showVPCOptimization && hasUserDisabledPurchases) {
      return [
        translate("Label.UpdateYourSettings"),
        translate("Description.EnablePurchasesInSettings"),
      ];
    }

    return [translate("Label.AskParent"), translate("Description.SpendingRestrictionWithSettings")];
  }, [showVPCOptimization, hasUserDisabledPurchases, translate]);

  const onPurchaseVPCCheckModalConfirm = useCallback(() => {
    trackPurchaseDisabledConfirm(showVPCOptimization);
    window.location.href = "/my/account#!/billing";
  }, [trackPurchaseDisabledConfirm, showVPCOptimization]);

  const handleClose = useCallback(() => {
    trackPurchaseDisabledNeutral(showVPCOptimization);
    closeModal();
  }, [trackPurchaseDisabledNeutral, showVPCOptimization, closeModal]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody>
          <DialogTitle>
            <div>{title}</div>
          </DialogTitle>
          <div className="text-body-large">{body}</div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-row gap-small">
            <Button
              onClick={onPurchaseVPCCheckModalConfirm}
              variant="Emphasis"
              className="width-full"
            >
              {translate("Action.GoToSettings")}
            </Button>
            <Button onClick={handleClose} variant="Standard" className="width-full">
              {translate("Action.Close")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

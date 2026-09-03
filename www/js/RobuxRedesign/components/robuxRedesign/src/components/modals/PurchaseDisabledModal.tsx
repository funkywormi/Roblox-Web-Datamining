import { useCallback, useContext, useEffect, useMemo } from "react";
import { createModal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation } from "@rbx/core-scripts/react";
import { ModalContext } from "../../contexts/ModalContext";
import { TrackingContext } from "../../contexts/TrackingContext";

export function PurchaseDisabledModal() {
  const {
    purchaseDisabled: { closeModal, hasUserDisabledPurchases, isOpen, showVPCOptimization },
  } = useContext(ModalContext);
  const { trackPurchaseDisabledConfirm, trackPurchaseDisabledNeutral } =
    useContext(TrackingContext);

  const { translate } = useTranslation();

  const [Modal, modalService] = createModal();

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

  const onNeutral = useCallback(() => {
    trackPurchaseDisabledNeutral(showVPCOptimization);
    modalService.close();
    closeModal();
  }, [trackPurchaseDisabledNeutral, showVPCOptimization, modalService, closeModal]);

  useEffect(() => {
    if (isOpen) {
      modalService.open();
    }
  }, [isOpen, modalService]);

  return (
    <Modal
      actionButtonShow
      title={title}
      body={<div>{body}</div>}
      actionButtonText={translate("Action.GoToSettings")}
      neutralButtonText={translate("Action.Close")}
      onAction={onPurchaseVPCCheckModalConfirm}
      onNeutral={onNeutral}
      size="md"
    />
  );
}

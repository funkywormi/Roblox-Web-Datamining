import { useTranslation } from "@rbx/core-scripts/react";
import { SimpleModal } from "@rbx/core-ui";

export default function LeaveRobloxPopupDisclaimer({
  isOpen,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const { translate } = useTranslation();
  const modalBody = (
    <p className="modal-body">
      {translate("Description.RedirectToPartnerWebsite") ||
        "This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\nProceed to partner website for payment?"}
    </p>
  );

  return (
    <SimpleModal
      title={translate("Heading.LeaveRoblox") || "Leaving Roblox"}
      body={modalBody}
      show={isOpen}
      actionButtonShow
      actionButtonText={translate("Action.ContinueToPayment") || "Continue to Payment"}
      neutralButtonText={translate("Action.Cancel") || "Cancel"}
      onAction={onContinue}
      onNeutral={onClose}
      onClose={onClose}
    />
  );
}

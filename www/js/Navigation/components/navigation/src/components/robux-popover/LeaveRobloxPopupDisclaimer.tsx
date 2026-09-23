import { useTranslation } from "@rbx/core-scripts/react";
import { SimpleModal } from "@rbx/core-ui";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useIsTopNavFoundation } from "../../util/topNavFoundationIxp";

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
  const isFoundation = useIsTopNavFoundation();

  const title = translate("Heading.LeaveRoblox") || "Leaving Roblox";
  const actionText = translate("Action.ContinueToPayment") || "Continue to Payment";
  const cancelText = translate("Action.Cancel") || "Cancel";
  const bodyText =
    translate("Description.RedirectToPartnerWebsite") ||
    "This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\nProceed to partner website for payment?";

  if (isFoundation) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            onClose();
          }
        }}
        size="Small"
        type="Default"
        isModal
        hasCloseAffordance
        closeLabel={cancelText}
      >
        <DialogContent>
          <DialogBody>
            <DialogTitle className="text-title-large content-emphasis">{title}</DialogTitle>
            <p className="padding-top-medium">{bodyText}</p>
          </DialogBody>
          <DialogFooter className="flex gap-small justify-end">
            <Button variant="Standard" size="Small" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant="Emphasis" size="Small" onClick={onContinue}>
              {actionText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SimpleModal
      title={title}
      body={<p className="modal-body">{bodyText}</p>}
      show={isOpen}
      actionButtonShow
      actionButtonText={actionText}
      neutralButtonText={cancelText}
      onAction={onContinue}
      onNeutral={onClose}
      onClose={onClose}
    />
  );
}

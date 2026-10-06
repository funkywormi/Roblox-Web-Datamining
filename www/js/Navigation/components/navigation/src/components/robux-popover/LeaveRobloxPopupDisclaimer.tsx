import { useTranslations } from "@rbx/www-common/i18n";
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
  const tMessages = useTranslations("CommonUI.Messages");
  const tFeatures = useTranslations("CommonUI.Features");
  const isFoundation = useIsTopNavFoundation();

  const title = tMessages.has("Heading.LeaveRoblox")
    ? tMessages("Heading.LeaveRoblox")
    : "Leaving Roblox";
  const actionText = tMessages.has("Action.ContinueToPayment")
    ? tMessages("Action.ContinueToPayment")
    : "Continue to Payment";
  const cancelText = tFeatures.has("Action.Cancel") ? tFeatures("Action.Cancel") : "Cancel";
  const bodyText = tMessages.has("Description.RedirectToPartnerWebsite")
    ? tMessages("Description.RedirectToPartnerWebsite")
    : "This purchase must be completed on our partner’s website. You will be returned to Roblox after the purchase is completed.\n\nProceed to partner website for payment?";

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

import { useContext } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { ModalContext } from "../../contexts/ModalContext";

export function QuickPay3DSModal() {
  const {
    quickPay3DS: { closeModal, isOpen, url },
  } = useContext(ModalContext);

  const translate = useTranslations("Feature.Premium");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      size="Small"
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle>{translate("QuickPay.Authentication")}</DialogTitle>
          <div className="width-full clip">
            <iframe title="3DS Modal" src={url} width={400} height={640} style={{ border: 0 }} />
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

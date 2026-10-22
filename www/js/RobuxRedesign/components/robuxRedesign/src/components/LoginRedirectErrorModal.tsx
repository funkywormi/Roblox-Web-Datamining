import { useContext } from "react";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { ModalContext } from "../contexts/ModalContext";

export function LoginRedirectErrorModal() {
  const translate = useTranslations("CommonUI.Controls");
  const translatePremium = useTranslations("Feature.Premium");

  const {
    redirectError: { isOpen, closeModal },
  } = useContext(ModalContext);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody>
          <DialogTitle>{translatePremium("Message.SomethingWentWrong")}</DialogTitle>
          <div className="text-body-large">{translatePremium("Message.PleaseTryAgain")}</div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

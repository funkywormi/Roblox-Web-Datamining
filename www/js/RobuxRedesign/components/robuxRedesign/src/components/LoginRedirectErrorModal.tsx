import { useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { ModalContext } from "../contexts/ModalContext";

export function LoginRedirectErrorModal() {
  const { translate } = useTranslation();

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
          <DialogTitle>{translate("Message.SomethingWentWrong")}</DialogTitle>
          <div className="text-body-large">{translate("Message.PleaseTryAgain")}</div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import avatarConstants from "../../../constants/avatarConstants";

type ItemLimitExceededDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
};

function ItemLimitExceededDialog({
  closeDialog,
  isOpen,
}: ItemLimitExceededDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const modalLayout = avatarConstants.modalLayout.outfitDelete;

  const layeredClothingLimitMessage = avatarConstants.layeredClothingLimit;

  const modalParams = {
    titleText: layeredClothingLimitMessage.title,
    bodyText: layeredClothingLimitMessage.description,
    actionButtonShow: true,
    actionButtonText: layeredClothingLimitMessage.action,
    actionButtonId: modalLayout.confirmBtnId,
  };

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) closeDialog();
      }}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle className="text-title-medium content-emphasis">
            {translate(modalParams.titleText)}
          </DialogTitle>
          <span className="text-body-medium content-default">
            {translate(modalParams.bodyText)}
          </span>
        </DialogBody>
        <DialogFooter className="flex gap-small justify-end">
          <Button variant="Emphasis" size="Medium" onClick={closeDialog}>
            {translate(modalParams.actionButtonText)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ItemLimitExceededDialog;

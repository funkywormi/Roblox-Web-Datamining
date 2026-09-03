import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

type AvatarEditingBlockedDialogProps = {
  closeDialog: () => void;
  isOpen: boolean;
  formattedBlockEndTime: string;
};

function AvatarEditingBlockedDialog({
  closeDialog,
  isOpen,
  formattedBlockEndTime,
}: AvatarEditingBlockedDialogProps): JSX.Element {
  const { translate } = useTranslation();
  const blockedMessage = translate("Message.AvatarEditingDisabledTime", {
    date: formattedBlockEndTime,
  });

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={nextOpen => {
        if (!nextOpen) closeDialog();
      }}
      size="Small"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-small">
          <DialogTitle hidden>{blockedMessage}</DialogTitle>
          <span className="text-body-medium content-default">{blockedMessage}</span>
        </DialogBody>
        <DialogFooter className="flex">
          <Button className="width-full" variant="Emphasis" size="Medium" onClick={closeDialog}>
            {translate("UnavailableItems.ConfirmText") || "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarEditingBlockedDialog;

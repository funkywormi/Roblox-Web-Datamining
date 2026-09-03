import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { ReminderDisplayStringsType } from "../utils/getDisplayStringsFromReminderData";

type ReminderOfNormsDialogProps = {
  displayStrings: ReminderDisplayStringsType;
  onClose: () => void;
  onDismiss: () => void;
};

/**
 * A simple dialog that renders on the home page if the user has a reminder to read.
 * In these scenarios, we want to remind to the user to follow the Community Standards.
 */
const ReminderOfNormsDialog = ({
  displayStrings,
  onClose,
  onDismiss,
}: ReminderOfNormsDialogProps): React.JSX.Element => {
  const { dialogTitle, dialogBodyAbuseType, dialogBodyGuidelineReminder, confirmationButtonLabel } =
    displayStrings;

  return (
    <Dialog
      open
      isModal
      size="Small"
      hasCloseAffordance={false}
      onOpenChange={open => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small content-emphasis">{dialogTitle}</DialogTitle>
          <p className="text-body-medium content-default">{dialogBodyAbuseType}</p>
          <p className="text-body-medium content-default">{dialogBodyGuidelineReminder}</p>
        </DialogBody>

        <DialogFooter>
          <Button size="Medium" className="width-full" onClick={onClose}>
            {confirmationButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderOfNormsDialog;

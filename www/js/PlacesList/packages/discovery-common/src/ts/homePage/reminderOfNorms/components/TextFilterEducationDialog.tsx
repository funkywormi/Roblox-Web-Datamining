import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  Icon,
} from "@rbx/foundation-ui";
import { TextFilterEducationDisplayStrings } from "../utils/getTextFilterEducationDisplayStrings";

type TextFilterEducationDialogProps = {
  displayStrings: TextFilterEducationDisplayStrings;
  isKids: boolean;
  onClose: () => void;
};

/**
 * A dialog that educates users who have had several text filter violations in recent history.
 */
const TextFilterEducationDialog = ({
  displayStrings,
  isKids,
  onClose,
}: TextFilterEducationDialogProps): React.JSX.Element => {
  const { dialogTitle, dialogBody, confirmationButtonLabel } = displayStrings;

  return (
    <Dialog open isModal size="Small" hasCloseAffordance={false}>
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small content-emphasis">{dialogTitle}</DialogTitle>

          <div className="flex items-start gap-xsmall">
            {isKids && (
              <Icon
                aria-hidden
                data-testid="kids-education-body-icon"
                name="icon-regular-shield-check"
                size="Small"
                className="content-default margin-top-[1px]"
              />
            )}

            <p className="text-body-medium content-default">{dialogBody}</p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button className="width-full" size="Medium" variant="Emphasis" onClick={onClose}>
            {confirmationButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextFilterEducationDialog;

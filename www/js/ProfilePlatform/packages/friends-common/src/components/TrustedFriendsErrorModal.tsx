import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  type TrustedFriendsErrorModalKindEnum,
  trustedFriendsErrorModalKindToText,
} from "../constants/trustedFriendsModal";

export type TrustedFriendsErrorModalProps = {
  errorType: TrustedFriendsErrorModalKindEnum;
  open: boolean;
  onClose: () => void;
};

const TrustedFriendsErrorModal = ({
  errorType,
  open,
  onClose,
}: TrustedFriendsErrorModalProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const { title, description } = trustedFriendsErrorModalKindToText[errorType];
  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-heading-small margin-none">{translate(title)}</DialogTitle>
          <div className="text-body-medium content-default flex flex-col gap-xsmall">
            {translate(description)}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="Emphasis" size="Medium" className="width-full" onClick={onClose}>
            {translate("Action.Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrustedFriendsErrorModal;

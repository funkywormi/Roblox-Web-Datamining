import React from "react";
import { Dialog, DialogContent, DialogBody, DialogTitle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

type AboutDialogProps = {
  open: boolean;
  onClose: () => void;
  sections: React.ReactElement[];
};

const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose, sections }) => {
  const { translate } = useTranslation();
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      isModal
      size="Large"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      hasMarginTop
      hasMarginBottom
    >
      <DialogContent className="width-[calc(var(--size-100)*160)]">
        <DialogBody className="gap-xxlarge flex flex-col">
          <DialogTitle hidden>{translate("Label.About")}</DialogTitle>
          {sections}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;

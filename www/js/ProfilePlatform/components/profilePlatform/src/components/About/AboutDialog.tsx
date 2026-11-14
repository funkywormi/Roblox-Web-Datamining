import React from "react";
import { Dialog, DialogContent, DialogBody, DialogTitle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";

type AboutDialogProps = {
  open: boolean;
  onClose: () => void;
  sections: React.ReactElement[];
  profileName: string;
};

const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose, sections, profileName }) => {
  const { translate } = useTranslation();
  const translateProfile = useTranslations("Feature.Profile");
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
      <DialogContent className="width-full">
        <DialogBody className="gap-xxlarge flex flex-col">
          <DialogTitle hidden>
            {translateProfile("Label.AboutDetailsHeading", { name: profileName })}
          </DialogTitle>
          {sections}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;

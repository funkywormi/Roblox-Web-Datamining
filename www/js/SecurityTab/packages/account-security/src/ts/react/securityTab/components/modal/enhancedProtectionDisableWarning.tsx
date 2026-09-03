import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from "@rbx/foundation-ui";
import React from "react";
import "../../../../../css/tailwind.css";

type EnhancedProtectionDisableWarningProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  modalTitleText: string;
  modalBodyText: string;
  modalCancelButtonText: string;
  modalTurnOffButtonText: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const EnhancedProtectionDisableWarning: React.FC<EnhancedProtectionDisableWarningProps> = ({
  open,
  setOpen,
  modalTitleText,
  modalBodyText,
  modalCancelButtonText,
  modalTurnOffButtonText,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      size="Medium"
      type="Default"
      ariaLabel={modalTitleText}
      isModal
      hasCloseAffordance={false}
    >
      <DialogContent>
        <DialogBody className="justify-center padding-top-medium">
          <h2 className="text-align-x-center padding-bottom-small">{modalTitleText}</h2>
          <div className="rbx-divider" />
          <div className="text-body-large margin-small text-align-x-center">{modalBodyText}</div>
          <DialogFooter className="flex gap-medium">
            <Button
              variant="Standard"
              className="flex flex-col fill"
              onClick={() => {
                // fires event for cancel button click
                onCancel?.();
                setOpen(false);
              }}
            >
              {modalCancelButtonText}
            </Button>
            <Button variant="Alert" className="flex flex-col fill" onClick={onConfirm}>
              {modalTurnOffButtonText}
            </Button>
          </DialogFooter>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedProtectionDisableWarning;

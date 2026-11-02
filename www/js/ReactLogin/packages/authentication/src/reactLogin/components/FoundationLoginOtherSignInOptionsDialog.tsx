import React from "react";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";

export type FoundationLoginOtherSignInOptionsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
};

const FoundationLoginOtherSignInOptionsDialog = ({
  isOpen,
  onOpenChange,
  title,
  closeLabel,
  children,
}: FoundationLoginOtherSignInOptionsDialogProps): React.JSX.Element => (
  <Dialog
    open={isOpen}
    isModal
    size="Small"
    type="Default"
    hasCloseAffordance
    closeLabel={closeLabel}
    onOpenChange={onOpenChange}
  >
    <DialogContent className="login-other-sign-in-options-dialog">
      <DialogBody className="flex flex-col gap-large">
        <DialogTitle className="text-heading-small content-emphasis padding-bottom-small">
          {title}
        </DialogTitle>
        <div className="flex width-full flex-col gap-small">{children}</div>
      </DialogBody>
    </DialogContent>
  </Dialog>
);

export default FoundationLoginOtherSignInOptionsDialog;

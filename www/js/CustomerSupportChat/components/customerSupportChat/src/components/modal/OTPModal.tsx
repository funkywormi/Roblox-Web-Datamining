import React, { ReactElement } from "react";
import { Dialog, DialogContent, DialogBody, DialogTitle } from "@rbx/foundation-ui";
import { WithTranslationsProps } from "@rbx/core-scripts/react";

type Props = {
  /* A boolean indicating whether the modal is open or not */
  open: boolean;

  /* A function to be called when user presses the escape key or clicks on a close button */
  onClose: () => void;

  /* A optional string that represents title of modal. If not provided, a default title will be used */
  title?: string;

  /* The optional content of the modal. It can be a simple string or a React Node */
  content?: string | React.ReactNode;

  /* Children elements to be rendered inside the modal, such as buttons or custom footers */
  children?: ReactElement | null;

  /* Translation function for i18n support */
  translate: WithTranslationsProps["translate"];
};

const OTPModal = ({
  open,
  onClose,
  title,
  content = "",
  children,
  translate,
}: Props): ReactElement => {
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
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
    >
      <DialogContent>
        <DialogBody className="gap-large flex flex-col">
          <DialogTitle className="text-heading-medium">{title}</DialogTitle>
          {content && <p>{content}</p>}
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;

import React, { useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";

export type TChildPrivacyRequestModalProps = {
  translatedTitle: string;
  translatedBody: React.ReactNode;
  translatedActionButtonText?: string;
  translatedSecondaryButtonText?: string;
  translatedCloseLabel: string;
  onAction?: () => void;
  disableActionButton?: boolean;
  disableSecondaryButton?: boolean;
  shouldCloseModalOnActionButton?: boolean;
};

export type TChildPrivacyRequestModalService = {
  open: () => void;
  close: () => void;
};

const useChildPrivacyRequestModal = ({
  translatedTitle,
  translatedBody,
  translatedActionButtonText,
  translatedSecondaryButtonText,
  translatedCloseLabel,
  onAction,
  disableActionButton,
  disableSecondaryButton,
  shouldCloseModalOnActionButton = true,
}: TChildPrivacyRequestModalProps): [React.JSX.Element, TChildPrivacyRequestModalService] => {
  const [open, setOpen] = useState(false);
  const modalService = useMemo(
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [],
  );

  const modal = (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      size="Small"
      isModal
      hasCloseAffordance
      closeLabel={translatedCloseLabel}
    >
      <DialogContent>
        <DialogBody className="text-body-medium flex flex-col gap-medium">
          <DialogTitle className="text-heading-small">{translatedTitle}</DialogTitle>
          <div className="flex flex-col gap-medium">{translatedBody}</div>
        </DialogBody>
        <DialogFooter className="width-full flex flex-col gap-small">
          {translatedActionButtonText && (
            <Button
              variant="Standard"
              size="Medium"
              className="width-full"
              isDisabled={disableActionButton}
              onClick={() => {
                if (shouldCloseModalOnActionButton) {
                  modalService.close();
                }
                onAction?.();
              }}
            >
              {translatedActionButtonText}
            </Button>
          )}
          {translatedSecondaryButtonText && (
            <Button
              variant="Standard"
              size="Medium"
              className="width-full"
              isDisabled={disableSecondaryButton}
              onClick={modalService.close}
            >
              {translatedSecondaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [modal, modalService];
};

export default useChildPrivacyRequestModal;

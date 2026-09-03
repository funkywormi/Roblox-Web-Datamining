import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  TDialogSize,
  Button,
} from "@rbx/foundation-ui";

export interface IModalService {
  open: () => void;
  close: (closedByAction?: boolean) => void;
}

export type TSettingsModalProps = {
  translatedTitle: string;
  translatedBody: React.ReactNode;
  translatedActionButtonText?: string;
  translatedSecondaryButtonText?: string;
  translatedCloseLabel: string;
  size?: TDialogSize;
  // Callback when action button is clicked
  onAction?: () => void;
  // Callback when secondary button is clicked
  onSecondary?: () => void;
  disableActionButton?: boolean;
  disableSecondaryButton?: boolean;
  shouldCloseModalOnActionButton?: boolean;
  shouldCloseModalOnSecondaryButton?: boolean;
  // Callback when modal is dismissed - not called when primary action button closes modal
  onDismiss?: () => void;
  closeable?: boolean;
};

/**
 * A hook that creates a Foundation UI Dialog-based settings modal.
 */
export function useSettingsModal({
  translatedTitle,
  translatedBody,
  translatedActionButtonText,
  translatedSecondaryButtonText,
  translatedCloseLabel,
  size = "Large",
  onAction,
  onSecondary,
  disableActionButton,
  disableSecondaryButton,
  shouldCloseModalOnActionButton = true,
  shouldCloseModalOnSecondaryButton = true,
  onDismiss,
  closeable = true,
}: TSettingsModalProps): [React.JSX.Element, IModalService] {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const modalService: IModalService = useMemo(
    () => ({
      open: () => {
        setModalOpen(true);
      },
      close: (closedByAction?: boolean) => {
        setModalOpen(false);
        if (!closedByAction) {
          onDismiss?.();
        }
      },
    }),
    [onDismiss],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      modalService.close(false);
    }
  };

  const modal = (
    <Dialog
      open={modalOpen}
      onOpenChange={handleOpenChange}
      size={size}
      isModal
      hasCloseAffordance={closeable}
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
              variant="Emphasis"
              size="Medium"
              className="width-full"
              isDisabled={disableActionButton}
              onClick={() => {
                if (shouldCloseModalOnActionButton) {
                  modalService.close(true);
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
              onClick={() => {
                if (shouldCloseModalOnSecondaryButton) {
                  modalService.close(false);
                }
                onSecondary?.();
              }}
            >
              {translatedSecondaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [modal, modalService];
}

/**
 * A convenience wrapper for creating simple info modals with just title, body, and an OK button.
 */
export function useSettingsInfoModal(
  translatedTitle: string,
  translatedBody: string,
  translatedActionButtonText: string,
  translatedCloseLabel: string,
  modalSize?: TDialogSize,
  closeable?: boolean,
): [React.JSX.Element, IModalService] {
  return useSettingsModal({
    translatedTitle,
    translatedBody,
    translatedActionButtonText,
    translatedCloseLabel,
    disableActionButton: false,
    size: modalSize ?? "Small",
    closeable: closeable ?? true,
  });
}

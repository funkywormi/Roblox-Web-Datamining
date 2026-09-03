import { JSX, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";

export type ConfirmationModalService = {
  open: () => void;
  close: () => void;
};

type UseConfirmationModalArgs = {
  titleText: string;
  bodyComponent?: ReactNode;
  actionButtonText: string;
  onAction?: () => void;
  neutralButtonText?: string;
  onNeutral?: () => void;
  closeable?: boolean;
  disableActionButton?: boolean;
};

export const useConfirmationModal = ({
  titleText,
  bodyComponent,
  actionButtonText,
  onAction,
  neutralButtonText,
  onNeutral,
  closeable = true,
  disableActionButton = false,
}: UseConfirmationModalArgs): [JSX.Element, ConfirmationModalService] => {
  const [modalOpen, setModalOpen] = useState(false);

  const modalService: ConfirmationModalService = useMemo(
    () => ({
      open: () => {
        setModalOpen(true);
      },
      close: () => {
        setModalOpen(false);
      },
    }),
    [],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!closeable) {
        return;
      }
      modalService.close();
    }
  };

  const modal = (
    <Dialog
      open={modalOpen}
      onOpenChange={handleOpenChange}
      size="Small"
      isModal
      hasCloseAffordance={closeable}
      closeLabel={neutralButtonText ?? actionButtonText}
    >
      <DialogContent>
        <DialogBody className="text-body-medium">
          <DialogTitle className="text-heading-small">{titleText}</DialogTitle>
          {bodyComponent !== undefined ? (
            <div className="flex flex-col gap-medium">{bodyComponent}</div>
          ) : null}
        </DialogBody>
        <DialogFooter
          className={`width-full flex gap-small ${neutralButtonText !== undefined ? "flex-row" : "flex-col"}`}
        >
          {neutralButtonText !== undefined && (
            <Button
              variant="Standard"
              size="Medium"
              className="flex-1"
              onClick={() => {
                onNeutral?.();
                modalService.close();
              }}
            >
              {neutralButtonText}
            </Button>
          )}
          <Button
            variant="Emphasis"
            size="Medium"
            className={neutralButtonText !== undefined ? "flex-1" : "width-full"}
            isDisabled={disableActionButton}
            onClick={() => {
              onAction?.();
              modalService.close();
            }}
          >
            {actionButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [modal, modalService];
};

import React from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: React.ReactNode;
  /** Optional extra content rendered under the body (e.g. lowball-trade note). */
  footerNote?: React.ReactNode;
  actionText?: string;
  actionVariant?: "Emphasis" | "Alert";
  neutralText: string;
  /** When false only the neutral/dismiss button is shown (informational modal). */
  showAction?: boolean;
  closeLabel: string;
  onAction?: () => void;
  onCancel: () => void;
};

/**
 * Thin wrapper over the Foundation Dialog that reproduces the confirm/cancel
 * modals the Angular controller opened via modalService.
 */
export const ConfirmDialog = ({
  open,
  title,
  body,
  footerNote,
  actionText,
  actionVariant = "Emphasis",
  neutralText,
  showAction = true,
  closeLabel,
  onAction,
  onCancel,
}: ConfirmDialogProps): JSX.Element => (
  <Dialog
    open={open}
    onOpenChange={isOpen => {
      if (!isOpen) {
        onCancel();
      }
    }}
    size="Medium"
    isModal
    hasCloseAffordance
    closeLabel={closeLabel}
  >
    {/* `size` only sets the content's max-width; the content itself is sized to
        fit its children. Force it to fill so the modal actually reaches the
        wider `Medium` width (and still shrinks below it on narrow viewports). */}
    <DialogContent style={{ width: "100%" }}>
      <DialogBody>
        <DialogTitle>{title}</DialogTitle>
        <div className="text-content-emphasis">{body}</div>
      </DialogBody>
      <DialogFooter>
        <div className="flex gap-x-small">
          {showAction && (
            <Button
              variant={actionVariant}
              size="Medium"
              className="fill basis-0"
              onClick={() => {
                onAction?.();
              }}
            >
              {actionText}
            </Button>
          )}
          <Button variant="Standard" size="Medium" className="fill basis-0" onClick={onCancel}>
            {neutralText}
          </Button>
        </div>
        {/* Footnote (e.g. the lowball-trade note) sits under the buttons, as it
            did in the legacy Angular modal. */}
        {footerNote && <div className="padding-top-medium">{footerNote}</div>}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;

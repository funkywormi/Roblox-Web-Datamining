import { type JSX, type ReactNode } from "react";
import { Dialog, DialogBody, DialogContent } from "@rbx/foundation-ui";

export function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}): JSX.Element {
  return (
    <Dialog
      open
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance={onClose != null}
      closeLabel="Close"
      onOpenChange={isOpen => {
        // Covers Escape and the X alike, both of which close the dialog.
        if (!isOpen) {
          onClose?.();
        }
      }}
    >
      <DialogContent>
        {/* The close affordance is positioned absolutely, so a heading that runs the dialog's full
            width renders underneath it; leave it room on the screens that draw one. The button is
            36px wide and sits 13px in from the edge, so 2.5rem clears it with a gap to spare. */}
        <DialogBody
          className={
            onClose == null
              ? "gap-large flex flex-col"
              : "gap-large flex flex-col [&_h2]:[padding-inline-end:2.5rem]"
          }
        >
          {children}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

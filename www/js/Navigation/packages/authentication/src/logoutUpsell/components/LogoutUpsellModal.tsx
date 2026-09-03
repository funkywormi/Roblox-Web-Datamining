import React from "react";
import { Dialog, DialogContent } from "@rbx/foundation-ui";

/**
 * Generic dialog shell shared by logout upsells (passkey today, future
 * variants tomorrow). The shell owns the Dialog chrome and the close
 * affordance; per-prompt content (icon, copy, action buttons) is provided as
 * children so each upsell can compose its own body+footer without duplicating
 * the modal scaffolding.
 */

export type LogoutUpsellModalProps = {
  /** Localized label for the dialog close affordance (X button / aria-label). */
  closeLabel: string;
  /**
   * Called when the user dismisses the dialog via the close affordance, the
   * Escape key, or any other "open → closed" transition initiated by the user.
   */
  onClose: () => void;
  children: React.ReactNode;
};

const LogoutUpsellModal: React.FC<LogoutUpsellModalProps> = ({ closeLabel, onClose, children }) => (
  <Dialog
    open
    isModal
    size="Medium"
    type="Default"
    hasCloseAffordance
    closeLabel={closeLabel}
    onOpenChange={open => {
      if (!open) {
        onClose();
      }
    }}
  >
    <DialogContent>{children}</DialogContent>
  </Dialog>
);

export default LogoutUpsellModal;

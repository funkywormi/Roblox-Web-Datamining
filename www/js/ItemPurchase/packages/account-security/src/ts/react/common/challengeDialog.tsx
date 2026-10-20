import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import "../../../css/common/challengeDialog.css";
import "../../../css/common/challengeText.css";

type Props = {
  open: boolean;
  onClose: () => unknown;
  /** Escape closes the dialog unless disabled. The backdrop never does. */
  isKeyboardDismissible?: boolean;
  /** Screen-reader title for dialogs without a `ChallengeDialogHeader`. */
  hiddenTitle?: string;
  className?: string;
  children: React.ReactNode;
};

const preventDefault = (event: Event) => event.preventDefault();

/**
 * Foundation replacement for the react-style-guide `Modal` used by challenges, matching its
 * `backdrop="static"` behavior. Pair with `ChallengeDialogHeader` and `ChallengeDialogFooter`.
 */
const ChallengeDialog: React.FC<Props> = ({
  open,
  onClose,
  isKeyboardDismissible = true,
  hiddenTitle,
  className,
  children,
}: Props) => (
  <Dialog
    open={open}
    onOpenChange={isOpen => {
      if (!isOpen) {
        onClose();
      }
    }}
    size="Medium"
    isModal
    hasMarginTop={false}
    hasMarginBottom={false}
    hasCloseAffordance={false}
    experimentalDisablePointerEventsStylingOnBody
  >
    <DialogContent
      className={`challenge-dialog challenge-text-base${className ? ` ${className}` : ""}`}
      data-testid="challenge-dialog"
      // Radix props forwarded through DialogContent's ...props spread (not in its types).
      {...({
        onPointerDownOutside: preventDefault,
        onInteractOutside: preventDefault,
        onEscapeKeyDown: isKeyboardDismissible ? undefined : preventDefault,
      } as Record<string, unknown>)}
    >
      {hiddenTitle !== undefined && <DialogTitle hidden>{hiddenTitle}</DialogTitle>}
      {children}
    </DialogContent>
  </Dialog>
);

export default ChallengeDialog;

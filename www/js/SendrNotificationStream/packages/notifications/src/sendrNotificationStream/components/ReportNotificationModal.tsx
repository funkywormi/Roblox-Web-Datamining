import React, { FC, useCallback, useState } from "react";
import { DeviceMeta } from "Roblox";
import { Dialog as FoundationDialog, DialogContent } from "@rbx/foundation-ui";
import { Dialog } from "../../styledMuiComponents";
import { useSelectedNotification } from "../context/SelectedNotification";
import isVisualItemAbuseReport from "../utils/isVisualItemAbuseReport";
import ReportNotificationModalContent from "./ReportNotificationModalContent";
import { getIsFoundationModalEnabled } from "../utils/getIsFoundationModalEnabled";

const ReportNotificationModal: FC<{
  isOpen: boolean;
  closeModal: () => void;
}> = ({ isOpen, closeModal }) => {
  const selectedNotification = useSelectedNotification();
  const [isOnPhone] = useState(() => {
    if (DeviceMeta) {
      const { isPhone } = DeviceMeta();
      return isPhone;
    }
    return false;
  });
  const handleCloseAbuseReport = useCallback(
    (reported: boolean) => {
      if (reported) {
        selectedNotification.displayState?.currentState.visualItems.metaAction?.forEach(
          metaAction => {
            if (
              isVisualItemAbuseReport(metaAction) &&
              selectedNotification.displayState?.handleActions
            ) {
              selectedNotification.displayState.handleActions(metaAction);
            }
          },
        );
      }
      closeModal();
    },
    [closeModal, selectedNotification],
  );

  // Preventing event propagation on modal events, so underlying modals do not close
  const stopPropagation = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    // Modal potentially has a URL link for EU DSA which we need to allow it to open a new tab
    if (!(ev.target instanceof HTMLAnchorElement)) {
      ev.preventDefault();
    }
  }, []);

  const onReportNotificationModalClose = useCallback(
    (event, reason: "backdropClick" | "escapeKeyDown") => {
      if (reason === "escapeKeyDown") {
        handleCloseAbuseReport(false);
      }
    },
    [handleCloseAbuseReport],
  );

  if (getIsFoundationModalEnabled()) {
    return (
      <FoundationDialog
        open={isOpen}
        onOpenChange={open => {
          // Foundation exposes no close reason; Escape (and any programmatic close)
          // fires open=false. Backdrop click is suppressed below so it never fires here.
          if (!open) {
            handleCloseAbuseReport(false);
          }
        }}
        type="Default"
        size="Large"
        isModal
        hasCloseAffordance={false}
      >
        <DialogContent
          className="report-notification-modal"
          // Radix close-control props forwarded through DialogContent's ...props spread
          // to preserve MUI parity: backdrop click does not dismiss (Escape still does),
          // and clicks do not propagate to underlying modals. See PHASE_0_4 doc for the
          // foundation-web follow-up to type these natively.
          {...({
            onClick: stopPropagation,
            onPointerDownOutside: (event: Event) => event.preventDefault(),
            onInteractOutside: (event: Event) => event.preventDefault(),
          } as Record<string, unknown>)}
        >
          <ReportNotificationModalContent handleClose={handleCloseAbuseReport} />
        </DialogContent>
      </FoundationDialog>
    );
  }

  return (
    <Dialog
      maxWidth="md"
      onClose={onReportNotificationModalClose}
      open={isOpen}
      isPhone={isOnPhone}
      onClick={stopPropagation}
      className="report-notification-modal"
    >
      <ReportNotificationModalContent handleClose={handleCloseAbuseReport} />
    </Dialog>
  );
};

export default ReportNotificationModal;

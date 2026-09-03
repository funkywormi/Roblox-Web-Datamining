import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { Tracking } from "./useTracking";
import { trackCounter } from "../observability";

export type TransferSendUserSelectedSource = "friends_list" | "search";

export type TransfersTracking = {
  trackTransferSendImpression: () => void;
  trackTransferSendSheetView: () => void;
  trackTransferSendUserSelected: (source: TransferSendUserSelectedSource) => void;
  trackPendingTransfersImpression: () => void;
  trackPendingTransfersSheetView: () => void;
  trackPendingTransfersAcceptClick: () => void;
};

const {
  ENUM_VIEW_NAME: { ROBUX_SEND_TRANSFERS, ROBUX_PENDING_TRANSFERS },
  ENUM_PURCHASE_EVENT_TYPE: { VIEW_SHOWN, USER_INPUT },
  ENUM_VIEW_MESSAGE: {
    TRANSFER_SEND_BUTTON,
    TRANSFER_SEND_SHEET,
    TRANSFER_SEND_USER_SELECTED,
    TRANSFER_PENDING_BUTTON,
    TRANSFER_PENDING_SHEET,
    TRANSFER_PENDING_ACCEPT_CLICK,
  },
} = pfas;

export function useTransfersTracking({ trackFlow }: Tracking): TransfersTracking {
  const trackTransferSendImpression = useCallback(() => {
    trackFlow(ROBUX_SEND_TRANSFERS, VIEW_SHOWN, TRANSFER_SEND_BUTTON);
    trackCounter("TransferSendImpression");
  }, [trackFlow]);

  const trackTransferSendSheetView = useCallback(() => {
    trackFlow(ROBUX_SEND_TRANSFERS, VIEW_SHOWN, TRANSFER_SEND_SHEET);
    trackCounter("TransferSendSheetView");
  }, [trackFlow]);

  const trackTransferSendUserSelected = useCallback(
    (source: TransferSendUserSelectedSource) => {
      trackFlow(ROBUX_SEND_TRANSFERS, USER_INPUT, TRANSFER_SEND_USER_SELECTED);
      trackCounter("TransferSendUserSelected", { source });
    },
    [trackFlow],
  );

  const trackPendingTransfersImpression = useCallback(() => {
    trackFlow(ROBUX_PENDING_TRANSFERS, VIEW_SHOWN, TRANSFER_PENDING_BUTTON);
    trackCounter("TransferPendingImpression");
  }, [trackFlow]);

  const trackPendingTransfersSheetView = useCallback(() => {
    trackFlow(ROBUX_PENDING_TRANSFERS, VIEW_SHOWN, TRANSFER_PENDING_SHEET);
    trackCounter("TransferPendingSheetView");
  }, [trackFlow]);

  const trackPendingTransfersAcceptClick = useCallback(() => {
    trackFlow(ROBUX_PENDING_TRANSFERS, USER_INPUT, TRANSFER_PENDING_ACCEPT_CLICK);
    trackCounter("TransferPendingAcceptClick");
  }, [trackFlow]);

  return {
    trackTransferSendImpression,
    trackTransferSendSheetView,
    trackTransferSendUserSelected,
    trackPendingTransfersImpression,
    trackPendingTransfersSheetView,
    trackPendingTransfersAcceptClick,
  };
}

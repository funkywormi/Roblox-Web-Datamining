import { useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetContent, SheetTitle, SheetBody, Button, Icon } from "@rbx/foundation-ui";
import { PendingTransfer } from "../../types/buyRobuxPageData";
import { UserAvatar } from "../UserAvatar";
import { navigateToAcceptTransferDeepLink } from "../../utils/robuxTransfersDeepLinks";
import { TrackingContext } from "../../contexts/TrackingContext";

type PendingTransfersSheetProps = {
  pendingTransfers: PendingTransfer[];
  acceptTransfersTranslationKey: string;
};

export function PendingTransfersSheet({
  pendingTransfers,
  acceptTransfersTranslationKey,
}: PendingTransfersSheetProps) {
  const { translate } = useTranslation();
  const { trackPendingTransfersAcceptClick } = useContext(TrackingContext);

  const handleAcceptClick = (transferRequestId: string) => {
    trackPendingTransfersAcceptClick();
    navigateToAcceptTransferDeepLink(transferRequestId);
  };

  return (
    <SheetContent centerSheetSize="Medium" closeLabel="Close" largeScreenVariant="center">
      <SheetTitle>{translate("Heading.PendingTransfers")}</SheetTitle>
      <SheetBody>
        <div
          className="flex flex-col gap-medium padding-bottom-xlarge overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          {pendingTransfers.map(transfer => (
            <div
              key={transfer.transferRequestId}
              className="flex flex-row items-center justify-between padding-medium radius-medium stroke-standard stroke-default"
            >
              <div className="flex flex-row items-center gap-small">
                <UserAvatar
                  thumbnailUrl={transfer.sender.thumbnailUrl}
                  displayName={transfer.sender.displayName}
                  size="Small"
                  className="bg-surface-200"
                />
                <div className="flex flex-col">
                  <span className="text-label-medium content-emphasis">
                    {transfer.sender.displayName}
                  </span>
                  <span className="text-body-small content-muted">
                    {new Date(Number(transfer.createdTimestampMs)).toLocaleDateString("default", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-small">
                <div className="flex flex-row items-center gap-xsmall">
                  <Icon name="icon-regular-robux" size="Small" />
                  <span className="text-label-medium content-emphasis">
                    {formatNumber(Number(transfer.netTransferRobuxAmount))}
                  </span>
                </div>
                <Button
                  size="Small"
                  variant="Standard"
                  onClick={() => {
                    handleAcceptClick(transfer.transferRequestId);
                  }}
                >
                  {translate(acceptTransfersTranslationKey)}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetBody>
    </SheetContent>
  );
}

import { useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetContent, SheetTitle, SheetBody, Button, Icon } from "@rbx/foundation-ui";
import { PendingTransfer } from "../../types/buyRobuxPageData";
import { UserAvatar } from "../UserAvatar";
import { navigateToAcceptTransferDeepLink } from "../../utils/robuxTransfersDeepLinks";
import { TrackingContext } from "../../contexts/TrackingContext";

const ROW_CLASS =
  "flex flex-row items-center justify-between gap-small padding-medium radius-medium stroke-standard stroke-default";

function PendingTransferRow({
  transfer,
  acceptTranslationKey,
}: {
  transfer: PendingTransfer;
  acceptTranslationKey: string;
}) {
  const { translate } = useTranslation();
  const { trackPendingTransfersAcceptClick } = useContext(TrackingContext);

  return (
    <div className={ROW_CLASS}>
      <div className="flex flex-row items-center gap-small">
        <UserAvatar
          thumbnailUrl={transfer.sender.thumbnailUrl}
          displayName={transfer.sender.displayName}
          size="Small"
          className="bg-surface-200"
        />
        <div className="flex flex-col">
          <span className="text-label-medium content-emphasis">{transfer.sender.displayName}</span>
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
            trackPendingTransfersAcceptClick();
            navigateToAcceptTransferDeepLink(transfer.transferRequestId);
          }}
        >
          {translate(acceptTranslationKey)}
        </Button>
      </div>
    </div>
  );
}

type PendingTransfersSheetProps = {
  pendingTransfers: PendingTransfer[];
  acceptTransfersTranslationKey: string;
};

/**
 * The incoming Robux transfers themselves, each accepted on its own. Reached by selecting the
 * transfers row in {@link PendingRequestsSheet}, which only counts them.
 */
export function PendingTransfersSheet({
  pendingTransfers,
  acceptTransfersTranslationKey,
}: PendingTransfersSheetProps) {
  const { translate } = useTranslation();

  return (
    <SheetContent centerSheetSize="Medium" closeLabel="Close" largeScreenVariant="center">
      <SheetTitle>{translate("Heading.PendingTransfers")}</SheetTitle>
      <SheetBody>
        <div
          className="flex flex-col gap-medium padding-bottom-xlarge overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          {pendingTransfers.map(transfer => (
            <PendingTransferRow
              key={transfer.transferRequestId}
              transfer={transfer}
              acceptTranslationKey={acceptTransfersTranslationKey}
            />
          ))}
        </div>
      </SheetBody>
    </SheetContent>
  );
}

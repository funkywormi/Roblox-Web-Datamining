import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetRoot } from "@rbx/foundation-ui";
import { SectionTransfers } from "../types/buyRobuxPageData";
import { PendingTransfersAvatars } from "./PendingTransfersAvatars";
import { PendingTransfersSheet } from "./modals/PendingTransfersSheet";
import { TrackingContext } from "../contexts/TrackingContext";

const BULLET = "\u2022";

export function InlinePendingTransfers({ transfers }: { transfers: SectionTransfers }) {
  const { translate } = useTranslation();
  const { trackPendingTransfersImpression, trackPendingTransfersSheetView } =
    useContext(TrackingContext);
  const [pendingSheetOpen, setPendingSheetOpen] = useState(false);

  useEffect(() => {
    if (transfers.pendingTransfers && transfers.pendingTransfers.length > 0) {
      trackPendingTransfersImpression();
    }
  }, [transfers, trackPendingTransfersImpression]);

  const handleSheetChange = (isOpen: boolean) => {
    if (isOpen) {
      trackPendingTransfersSheetView();
    }
    setPendingSheetOpen(isOpen);
  };

  const pendingTransfers = useMemo(
    () => transfers.pendingTransfers ?? [],
    [transfers.pendingTransfers],
  );

  const totalRobux = useMemo(
    () => pendingTransfers.reduce((sum, t) => sum + Number(t.netTransferRobuxAmount), 0),
    [pendingTransfers],
  );

  if (pendingTransfers.length === 0) {
    return null;
  }

  const descriptionTranslationKey =
    pendingTransfers.length === 1
      ? "Label.PendingTransfersSummary.Singular"
      : "Label.PendingTransfersSummary.Plural";

  return (
    <Fragment>
      <div className="flex flex-row items-center justify-between medium:justify-end gap-small width-full">
        <div className="flex flex-row items-center gap-small min-width-0">
          <PendingTransfersAvatars pendingTransfers={pendingTransfers} />
          <span className="text-label-medium content-emphasis">
            {translate(descriptionTranslationKey, {
              count: formatNumber(pendingTransfers.length),
              robux: formatNumber(totalRobux),
            })}
          </span>
        </div>
        <span className="content-default none medium:block">{BULLET}</span>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          className="text-title-medium text-link underline cursor-pointer shrink-0"
          onClick={() => {
            handleSheetChange(true);
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSheetChange(true);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {translate(transfers.acceptTransfersTranslationKey)}
        </a>
      </div>

      <SheetRoot open={pendingSheetOpen} onOpenChange={handleSheetChange}>
        <PendingTransfersSheet
          pendingTransfers={pendingTransfers}
          acceptTransfersTranslationKey={transfers.acceptTransfersTranslationKey}
        />
      </SheetRoot>
    </Fragment>
  );
}

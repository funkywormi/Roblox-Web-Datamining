import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon, SheetRoot } from "@rbx/foundation-ui";
import {
  PlusReferralSheet,
  PlusReferralSurface,
  referralEventService,
  useReferrerHandle,
  type SubscriptionReferral,
} from "@rbx/subscriptions-common";
import type { PendingTransfer, SectionTransfers } from "../types/buyRobuxPageData";
import { PendingTransfersAvatars } from "./PendingTransfersAvatars";
import { PendingRequestsSheet } from "./modals/PendingRequestsSheet";
import { PendingTransfersSheet } from "./modals/PendingTransfersSheet";
import { TrackingContext } from "../contexts/TrackingContext";
import { UserAvatar } from "./UserAvatar";
import { useAvatarThumbnails } from "../hooks/useAvatarThumbnails";

type InlinePendingRequestsProps = {
  transfers?: SectionTransfers;
  pendingReferrals: SubscriptionReferral[];
};

const BULLET = "•";

/**
 * The generic prompt, used whenever no single person can stand for what is waiting: a mix of
 * transfers and invites, or an invite whose sender the users api withholds.
 */
function MixedRequestsSummary({ countLabel }: { countLabel: string }) {
  return (
    <Fragment>
      {/*
        The glyph is a mask filled with one colour and its `i` is a hole rather than a stroke, so
        the mark would otherwise take the dark surface behind it. This disc paints it light.

        Sized to the `i` alone, not to the glyph's circle: the two circles at equal diameter let
        the glyph's antialiased rim bleed the light disc out as a halo. The `i` reaches 8.1 of the
        32-unit box from centre against the circle's 14, so 11px under a 20px glyph clears it with
        room to spare.

        `system-emphasis` is the design's blue, and unlike `content-link` it holds the same value
        in both themes, so its companion is a fixed light rather than a themed one.
      */}
      <span className="relative flex shrink-0 items-center justify-center">
        <span
          className="radius-circle absolute size-[11px] bg-[var(--color-extended-gray-100)]"
          data-testid="info-mark-disc"
        />
        <Icon
          className="content-system-emphasis relative"
          name="icon-filled-circle-i"
          size="Medium"
        />
      </span>
      <span className="text-label-medium content-emphasis">{countLabel}</span>
    </Fragment>
  );
}

/**
 * Names whoever invited, in place of the generic count, for a user with nothing else waiting.
 *
 * Falls back to the count while the handle is in flight and for accounts the users api withholds.
 */
function ReferralRequestSummary({
  referral,
  countLabel,
}: {
  referral: SubscriptionReferral;
  countLabel: string;
}) {
  const { translate } = useTranslation();
  const { handle } = useReferrerHandle(String(referral.senderUserId));
  const referrers = useMemo(() => [{ id: referral.senderUserId }], [referral.senderUserId]);
  const thumbnails = useAvatarThumbnails(referrers);

  if (handle === undefined) {
    return <MixedRequestsSummary countLabel={countLabel} />;
  }

  return (
    <Fragment>
      <UserAvatar
        className="bg-shift-200"
        displayName={handle}
        size="XSmall"
        thumbnailUrl={thumbnails[referral.senderUserId]}
      />
      <span className="text-label-medium content-emphasis text-truncate-end">
        {translate(
          "Label.ReferralPendingRequestSummary",
          { displayName: handle },
          `${handle} referred you`,
        )}
      </span>
    </Fragment>
  );
}

function TransfersOnlySummary({
  pendingTransfers,
  totalRobux,
}: {
  pendingTransfers: PendingTransfer[];
  totalRobux: number;
}) {
  const { translate } = useTranslation();
  const descriptionTranslationKey =
    pendingTransfers.length === 1
      ? "Label.PendingTransfersSummary.Singular"
      : "Label.PendingTransfersSummary.Plural";
  return (
    <Fragment>
      <PendingTransfersAvatars pendingTransfers={pendingTransfers} />
      <span className="text-label-medium content-emphasis">
        {translate(descriptionTranslationKey, {
          count: formatNumber(pendingTransfers.length),
          robux: formatNumber(totalRobux),
        })}
      </span>
    </Fragment>
  );
}

/**
 * One prompt for everything waiting on the user: incoming Robux transfers and Plus invites,
 * counted together and reviewed in a single sheet.
 */
export function InlinePendingRequests({ transfers, pendingReferrals }: InlinePendingRequestsProps) {
  const { translate } = useTranslation();
  const { trackPendingTransfersImpression, trackPendingTransfersSheetView } =
    useContext(TrackingContext);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const pendingTransfers = useMemo(() => transfers?.pendingTransfers ?? [], [transfers]);

  useEffect(() => {
    if (pendingTransfers.length > 0) {
      trackPendingTransfersImpression();
    }
  }, [pendingTransfers, trackPendingTransfersImpression]);

  useEffect(() => {
    const referral = pendingReferrals.at(0);
    if (referral !== undefined) {
      referralEventService.buyRobuxReferralImpression(
        String(referral.senderUserId),
        referral.referralId,
      );
    }
  }, [pendingReferrals]);

  const handleSheetChange = (isOpen: boolean) => {
    // The transfers funnel predates referrals, so a referral-only open is not a sheet view for it.
    if (isOpen && pendingTransfers.length > 0) {
      trackPendingTransfersSheetView();
    }
    setIsSheetOpen(isOpen);
  };

  const totalRobux = useMemo(
    () => pendingTransfers.reduce((sum, t) => sum + Number(t.netTransferRobuxAmount), 0),
    [pendingTransfers],
  );

  const requestCount = pendingTransfers.length + pendingReferrals.length;

  if (requestCount === 0) {
    return null;
  }

  const isTransfersOnly = pendingTransfers.length > 0 && pendingReferrals.length === 0;

  const count = formatNumber(requestCount);
  const summaryTranslationKey =
    requestCount === 1
      ? "Label.PendingRequestsSummary.Singular"
      : "Label.PendingRequestsSummary.Plural";
  const countLabel = translate(
    summaryTranslationKey,
    { count },
    requestCount === 1 ? `${count} pending request` : `${count} pending requests`,
  );

  // Transfers keep the counted summary since more than one person is behind it. `at(0)` is the
  // latest, matching usePendingPlusReferrals.
  const latestReferral = pendingTransfers.length === 0 ? pendingReferrals.at(0) : undefined;

  // The list would be a one-row detour to the invite the summary just named. Only the latest
  // matters: accepting any invite makes the user a subscriber, which settles the rest.
  const openReview = () => {
    if (latestReferral !== undefined) {
      referralEventService.buyRobuxReferralReviewClick(
        String(latestReferral.senderUserId),
        latestReferral.referralId,
      );
      setIsInviteOpen(true);
      return;
    }
    const firstReferral = pendingReferrals.at(0);
    if (firstReferral !== undefined) {
      referralEventService.buyRobuxReferralReviewClick(
        String(firstReferral.senderUserId),
        firstReferral.referralId,
      );
    }
    handleSheetChange(true);
  };

  return (
    <Fragment>
      <div
        className={`flex flex-row items-center justify-between gap-small width-full${isTransfersOnly ? " medium:justify-end" : ""}`}
      >
        <div className="flex flex-row items-center gap-small min-width-0">
          {isTransfersOnly ? (
            <TransfersOnlySummary pendingTransfers={pendingTransfers} totalRobux={totalRobux} />
          ) : latestReferral === undefined ? (
            <MixedRequestsSummary countLabel={countLabel} />
          ) : (
            <ReferralRequestSummary countLabel={countLabel} referral={latestReferral} />
          )}
        </div>
        {isTransfersOnly && <span className="content-default none medium:block">{BULLET}</span>}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          className="text-title-medium text-link underline cursor-pointer shrink-0"
          onClick={openReview}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              openReview();
            }
          }}
          role="button"
          tabIndex={0}
        >
          {isTransfersOnly && transfers
            ? translate(transfers.acceptTransfersTranslationKey)
            : translate("Action.Review", undefined, "Review")}
        </a>
      </div>

      {isTransfersOnly && transfers ? (
        <SheetRoot open={isSheetOpen} onOpenChange={handleSheetChange}>
          <PendingTransfersSheet
            pendingTransfers={pendingTransfers}
            acceptTransfersTranslationKey={transfers.acceptTransfersTranslationKey}
          />
        </SheetRoot>
      ) : latestReferral === undefined ? (
        <SheetRoot open={isSheetOpen} onOpenChange={handleSheetChange}>
          <PendingRequestsSheet
            pendingTransfers={pendingTransfers}
            acceptTransfersTranslationKey={transfers?.acceptTransfersTranslationKey}
            pendingReferrals={pendingReferrals}
          />
        </SheetRoot>
      ) : (
        <PlusReferralSheet
          invite={{ referrerId: String(latestReferral.senderUserId) }}
          open={isInviteOpen}
          surface={PlusReferralSurface.BuyRobuxPage}
          onOpenChange={setIsInviteOpen}
        />
      )}
    </Fragment>
  );
}

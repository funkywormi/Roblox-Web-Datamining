import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetContent, SheetTitle, SheetBody, SheetRoot } from "@rbx/foundation-ui";
import {
  PlusReferralSheet,
  REFERRAL_REWARD_ROBUX,
  useReferrerHandle,
  type SubscriptionReferral,
} from "@rbx/subscriptions-common";
import { PendingRequestRow } from "./PendingRequestRow";
import { PendingTransfersSheet } from "./PendingTransfersSheet";
import { PendingTransfer } from "../../types/buyRobuxPageData";

function PendingTransfersRequestRow({
  pendingTransfers,
  acceptTransfersTranslationKey,
}: {
  pendingTransfers: PendingTransfer[];
  acceptTransfersTranslationKey: string;
}) {
  const { translate } = useTranslation();
  const [isTransfersOpen, setIsTransfersOpen] = useState(false);

  const robuxTotal = useMemo(
    () =>
      pendingTransfers.reduce(
        (total, transfer) => total + Number(transfer.netTransferRobuxAmount),
        0,
      ),
    [pendingTransfers],
  );

  const count = formatNumber(pendingTransfers.length);
  const robux = formatNumber(robuxTotal);
  // `Message.PendingTransfersBanner` is plural-only, so one transfer read "1 people sent you".
  // These are the keys the transfers-only surface already uses.
  const isSingleTransfer = pendingTransfers.length === 1;
  const summaryTranslationKey = isSingleTransfer
    ? "Label.PendingTransfersSummary.Singular"
    : "Label.PendingTransfersSummary.Plural";

  return (
    <Fragment>
      <PendingRequestRow
        iconName="icon-regular-robux"
        metadata={translate("Label.AcceptTheseRobux", undefined, "Accept these Robux")}
        title={translate(
          summaryTranslationKey,
          { count, robux },
          isSingleTransfer
            ? `${count} person sent you ${robux} Robux`
            : `${count} people sent you ${robux} Robux`,
        )}
        onSelect={() => {
          setIsTransfersOpen(true);
        }}
      />
      <SheetRoot open={isTransfersOpen} onOpenChange={setIsTransfersOpen}>
        <PendingTransfersSheet
          acceptTransfersTranslationKey={acceptTransfersTranslationKey}
          pendingTransfers={pendingTransfers}
        />
      </SheetRoot>
    </Fragment>
  );
}

function PendingReferralRow({ referral }: { referral: SubscriptionReferral }) {
  const { translate, intl } = useTranslation();
  const { handle, isLoading } = useReferrerHandle(String(referral.senderUserId));
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const reward = translate(
    "Heading.ReferralRecipientEntry",
    { amount: intl.n(REFERRAL_REWARD_ROBUX) },
    `Join Plus to get ${intl.n(REFERRAL_REWARD_ROBUX)} Robux`,
  );

  // The handle is the whole title, so there is nothing worth showing until the lookup settles.
  if (isLoading) {
    return null;
  }

  return (
    <Fragment>
      <PendingRequestRow
        iconName="icon-regular-roblox-plus"
        // An account the users api withholds leaves nobody to name, so the reward carries the row
        // on its own rather than the invite disappearing along with the handle.
        metadata={handle ? reward : undefined}
        title={
          handle
            ? translate(
                "Description.ReferralPendingRequest",
                { displayName: handle },
                `${handle} referred you to Plus`,
              )
            : reward
        }
        onSelect={() => {
          setIsInviteOpen(true);
        }}
      />
      <PlusReferralSheet
        invite={{ referrerId: String(referral.senderUserId) }}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </Fragment>
  );
}

type PendingRequestsSheetProps = {
  pendingTransfers: PendingTransfer[];
  acceptTransfersTranslationKey?: string;
  pendingReferrals: SubscriptionReferral[];
};

/**
 * Everything awaiting the user, one row per kind. Transfers are counted rather than listed, since
 * accepting them is a surface of its own; Plus invites open the invite they belong to.
 */
export function PendingRequestsSheet({
  pendingTransfers,
  acceptTransfersTranslationKey,
  pendingReferrals,
}: PendingRequestsSheetProps) {
  const { translate } = useTranslation();

  return (
    <SheetContent centerSheetSize="Medium" closeLabel="Close" largeScreenVariant="center">
      <SheetTitle>
        {translate("Heading.ReviewPendingRequests", undefined, "Review pending requests")}
      </SheetTitle>
      <SheetBody>
        <div
          className="flex flex-col gap-xsmall padding-bottom-xlarge overflow-y-auto"
          style={{ maxHeight: "60vh" }}
        >
          {acceptTransfersTranslationKey && pendingTransfers.length > 0 ? (
            <PendingTransfersRequestRow
              acceptTransfersTranslationKey={acceptTransfersTranslationKey}
              pendingTransfers={pendingTransfers}
            />
          ) : null}
          {pendingReferrals.map(referral => (
            <PendingReferralRow key={referral.referralId} referral={referral} />
          ))}
        </div>
      </SheetBody>
    </SheetContent>
  );
}

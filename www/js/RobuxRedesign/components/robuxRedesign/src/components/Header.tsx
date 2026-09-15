import classNames from "classnames";
import { useContext } from "react";
import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { usePendingPlusReferrals } from "@rbx/subscriptions-common";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { Section } from "../types/buyRobuxPageData";
import { InlinePendingRequests } from "./InlinePendingRequests";
import { RobuxBalance } from "./RobuxBalance";
import { SendRobuxButton } from "./SendRobuxButton";
import { TrackingContext } from "../contexts/TrackingContext";
import { ModalContext } from "../contexts/ModalContext";
import { isInApp } from "../utils/platform";
import { getSectionTrackingProps } from "../hooks/useScrollTracking";

const HEADER_SHELL_CLASS =
  "flex flex-col self-stretch medium:self-end medium:margin-top-[16px] medium:margin-right-[16px]";

const HEADER_CARD_CLASS =
  "flex flex-col gap-large bg-surface-100 padding-y-medium padding-x-large small:padding-x-xlarge self-stretch";

export function Header({
  transfersSection,
  robuxGiftSection,
}: {
  transfersSection?: Section;
  robuxGiftSection?: Section;
}) {
  const {
    robuxGifting: { openModal },
  } = useContext(ModalContext);
  const { breakpoint } = useContext(BuyRobuxPageContext);
  const { trackRobuxGiftClick } = useContext(TrackingContext);

  const { translate } = useTranslation();
  const { pendingReferrals } = usePendingPlusReferrals();

  const transfers = transfersSection?.transfers;
  const robuxGift = robuxGiftSection?.robuxGift;
  const hasTransfers = Boolean(transfers?.pendingTransfers?.length);
  const hasPendingRequests = hasTransfers || pendingReferrals.length > 0;
  const isSmallView = !breakpoint.isAboveInclusive("medium");

  const pendingRequestsRow = hasPendingRequests ? (
    <div className="flex padding-y-medium padding-x-medium medium:padding-x-large self-stretch radius-medium justify-center bg-shift-100 stroke-standard stroke-default">
      <InlinePendingRequests transfers={transfers} pendingReferrals={pendingReferrals} />
    </div>
  ) : null;

  // A temporary check; while Transfers is not enabled, then ensure we render
  // the old sticky RobuxBalance in Banner.tsx. Referrals don't depend on Transfers, so the
  // prompt still gets a home above the page content.
  if (!transfers) {
    return pendingRequestsRow ? (
      // `.buy-robux-background` is an absolutely positioned 1080px overlay, so without a z-index
      // it paints over this row and swallows the Review click.
      <div
        className={HEADER_SHELL_CLASS}
        style={
          isSmallView
            ? {
                position: "sticky",
                top: "env(safe-area-inset-top)",
                marginTop: "env(safe-area-inset-top)",
                zIndex: 10,
              }
            : { zIndex: 10 }
        }
      >
        <div className={classNames(HEADER_CARD_CLASS, "medium:radius-medium")}>
          {pendingRequestsRow}
        </div>
      </div>
    ) : null;
  }

  return (
    <div
      // Tagging the entire transfers header region: any time SendRobuxButton
      // or InlinePendingRequests becomes visible, the Transfers section is
      // considered impressed.
      {...getSectionTrackingProps(transfersSection)}
      className={HEADER_SHELL_CLASS}
      style={
        isSmallView
          ? {
              position: "sticky",
              top: "env(safe-area-inset-top)",
              // need to offset the rest of the page by safe-area-inset-top when sticky
              marginTop: "env(safe-area-inset-top)",
              zIndex: 10,
            }
          : { zIndex: 10 }
      }
    >
      <div
        className={classNames(HEADER_CARD_CLASS, {
          "medium:radius-medium": hasPendingRequests,
          "medium:radius-circle": !hasPendingRequests,
        })}
      >
        <div
          className={classNames(
            "flex flex-row items-center gap-large medium:padding-left-none justify-between medium:justify-end",
            { "padding-left-[58px]": isInApp },
          )}
        >
          <div className="flex flex-row justify-center items-center gap-xsmall medium:padding-left-none">
            <RobuxBalance
              iconSize="Large"
              textClassName="text-title-large [font-size:var(--font-size-500)] medium:[font-size:var(--font-size-600)]"
            />
          </div>
          <div className="flex flex-row gap-small">
            <SendRobuxButton
              translationKey={transfers.sendButtonTextTranslationKey}
              className="text-label-medium content-action-standard shrink-0 [padding-right:12px]"
              size="Small"
            />
            {robuxGift && (
              <Button
                {...getSectionTrackingProps(robuxGiftSection)}
                className="text-label-medium content-action-standard shrink-0 [padding-right:12px]"
                icon="icon-regular-arrow-down-to-line"
                size="Small"
                variant="Standard"
                onClick={() => {
                  trackRobuxGiftClick();
                  openModal();
                }}
              >
                {translate(robuxGift.buttonTextTranslationKey)}
              </Button>
            )}
          </div>
        </div>
        {pendingRequestsRow}
      </div>
    </div>
  );
}

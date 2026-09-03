import classNames from "classnames";
import { useContext } from "react";
import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { Section } from "../types/buyRobuxPageData";
import { InlinePendingTransfers } from "./InlinePendingTransfers";
import { RobuxBalance } from "./RobuxBalance";
import { SendRobuxButton } from "./SendRobuxButton";
import { TrackingContext } from "../contexts/TrackingContext";
import { ModalContext } from "../contexts/ModalContext";
import { isInApp } from "../utils/platform";
import { getSectionTrackingProps } from "../hooks/useScrollTracking";

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

  const transfers = transfersSection?.transfers;
  const robuxGift = robuxGiftSection?.robuxGift;
  const hasPendingTransfers = Boolean(transfers?.pendingTransfers?.length);
  const isSmallView = !breakpoint.isAboveInclusive("medium");

  // A temporary check; while Transfers is not enabled, then ensure we render
  // the old sticky RobuxBalance in Banner.tsx.
  if (!transfers) return null;

  return (
    <div
      // Tagging the entire transfers header region: any time SendRobuxButton
      // or InlinePendingTransfers becomes visible, the Transfers section is
      // considered impressed.
      {...getSectionTrackingProps(transfersSection)}
      className="flex flex-col self-stretch medium:self-end medium:margin-top-[16px] medium:margin-right-[16px]"
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
        className={classNames(
          "flex flex-col gap-large bg-surface-100 padding-y-medium padding-x-large small:padding-x-xlarge self-stretch",
          {
            "medium:radius-medium": hasPendingTransfers,
            "medium:radius-circle": !hasPendingTransfers,
          },
        )}
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
        {hasPendingTransfers && (
          <div className="flex padding-y-medium padding-x-medium medium:padding-x-large self-stretch radius-medium justify-center bg-shift-100 stroke-standard stroke-default">
            <InlinePendingTransfers transfers={transfers} />
          </div>
        )}
      </div>
    </div>
  );
}

import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetContent, SheetTitle, Icon } from "@rbx/foundation-ui";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { SendRobuxSearchContent, type SendRobuxUserSelection } from "../SendRobuxSearchContent";
import { navigateToSendTransferDeepLink } from "../../utils/robuxTransfersDeepLinks";
import { TrackingContext } from "../../contexts/TrackingContext";
import { useMyFriends } from "../../hooks/useMyFriends";

function RobuxBalanceUtility() {
  const { robuxBalance } = useContext(BuyRobuxPageContext);
  if (robuxBalance == null) return null;

  return (
    <div className="flex flex-row items-center gap-xsmall">
      <Icon name="icon-regular-robux" size="Small" />
      <span className="text-label-medium content-emphasis">{formatNumber(robuxBalance)}</span>
    </div>
  );
}

export function SendRobuxSheet() {
  const { translate } = useTranslation();
  const { trackTransferSendUserSelected } = useContext(TrackingContext);
  const { friends, isLoading, error, isLoggedIn } = useMyFriends();

  const handleSelectUser = useCallback(
    ({ userId, context }: SendRobuxUserSelection) => {
      trackTransferSendUserSelected(context);
      navigateToSendTransferDeepLink(userId);
    },
    [trackTransferSendUserSelected],
  );

  return (
    <SheetContent
      centerSheetSize="Medium"
      closeLabel="Close"
      largeScreenVariant="center"
      mobilePortraitClassName="![height:92vh] ![max-height:92vh] ![padding-bottom:env(safe-area-inset-bottom)]"
    >
      {/* SheetTitle pads 8px and StyleGuide adds 5px inside every heading, so the
          title text sits 13px below the sheet's top edge; 11px makes the design's
          16px. Important because it competes with Foundation's own padding
          utility. */}
      <SheetTitle
        className="relative bg-surface-100 shrink-0 [z-index:6] ![padding-top:11px]"
        utilities={<RobuxBalanceUtility />}
      >
        <div className="flex flex-row items-center gap-xsmall">
          <Icon name="icon-regular-roblox-plus" size="Large" />
          {translate("Heading.SendRobux")}
        </div>
      </SheetTitle>
      <SendRobuxSearchContent
        friends={friends}
        isLoading={isLoading}
        error={error}
        isLoggedIn={isLoggedIn}
        onSelectUser={handleSelectUser}
      />
    </SheetContent>
  );
}

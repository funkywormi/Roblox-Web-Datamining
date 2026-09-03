import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { SheetContent, SheetTitle, SheetBody, Icon } from "@rbx/foundation-ui";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { SendRobuxSearchContent, type SendRobuxUserSelection } from "../SendRobuxSearchContent";
import { MyFriendsList } from "../MyFriendsList";
import { OmniSearch } from "../OmniSearch";
import type { OmniSearchUser } from "../../services/userSearchService";
import { navigateToSendTransferDeepLink } from "../../utils/robuxTransfersDeepLinks";
import { TrackingContext } from "../../contexts/TrackingContext";
import { useMyFriends } from "../../hooks/useMyFriends";

type SendRobuxSheetProps = {
  isFriendListFilterEnabled: boolean;
  isExperimentLoading: boolean;
};

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

function SendRobuxSearchSkeleton() {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-medium" role="status" aria-label={translate("Label.Loading")}>
      <div className="height-1000 width-full radius-circle bg-surface-300 animate-pulse" />
      <div className="height-400 width-[40%] radius-medium bg-surface-300 animate-pulse" />
      {[0, 1, 2].map(row => (
        <div key={row} className="flex flex-row items-center gap-medium padding-y-small">
          <div className="height-1000 width-1000 radius-circle bg-surface-300 shrink-0 animate-pulse" />
          <div className="flex flex-col gap-xsmall width-full">
            <div className="height-300 width-[55%] radius-medium bg-surface-300 animate-pulse" />
            <div className="height-250 width-[35%] radius-medium bg-surface-300 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SendRobuxSheet({
  isFriendListFilterEnabled,
  isExperimentLoading,
}: SendRobuxSheetProps) {
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
  const handleSelectFromFriendsList = useCallback(
    (user: { id: number }) => {
      handleSelectUser({ userId: user.id, context: "friends_list" });
    },
    [handleSelectUser],
  );
  const handleSelectFromSearch = useCallback(
    (user: OmniSearchUser) => {
      handleSelectUser({ userId: user.contentId, context: "search" });
    },
    [handleSelectUser],
  );
  const controlMyFriendsHeading =
    !isFriendListFilterEnabled && isLoggedIn
      ? translate("Label.MyFriendsWithCount", { count: friends.length })
      : "";

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
        className={
          isFriendListFilterEnabled
            ? "relative bg-surface-100 shrink-0 [z-index:6] ![padding-top:11px]"
            : undefined
        }
        utilities={<RobuxBalanceUtility />}
      >
        <div className="flex flex-row items-center gap-xsmall">
          <Icon name="icon-regular-roblox-plus" size="Large" />
          {translate("Heading.SendRobux")}
        </div>
      </SheetTitle>
      {/* Each search arm renders its own SheetBody: the friend-filter arm keeps
          its search input outside the scrolling region, above the body. */}
      {isExperimentLoading ? (
        <SheetBody className="hide-scrollbar clip-x">
          <div className="flex flex-col padding-bottom-medium [min-height:40vh]">
            <SendRobuxSearchSkeleton />
          </div>
        </SheetBody>
      ) : isFriendListFilterEnabled ? (
        <SendRobuxSearchContent
          friends={friends}
          isLoading={isLoading}
          error={error}
          isLoggedIn={isLoggedIn}
          onSelectUser={handleSelectUser}
        />
      ) : (
        <SheetBody className="hide-scrollbar">
          <div className="flex flex-col padding-bottom-medium [min-height:40vh]">
            <div className="bg-surface-100" style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <OmniSearch onSelectUser={handleSelectFromSearch} />
              {isLoggedIn && (
                <h2 className="text-title-large content-default margin-top-small">
                  {controlMyFriendsHeading}
                </h2>
              )}
            </div>
            {/* Friends list is hidden for logged-out users so they don't see
                an "EmptyState.NoFriends" message that conflates "not signed in"
                with "no friends". */}
            {isLoggedIn && (
              <MyFriendsList
                friends={friends}
                isLoading={isLoading}
                error={error}
                ariaLabel={controlMyFriendsHeading}
                onSelectUser={handleSelectFromFriendsList}
              />
            )}
          </div>
        </SheetBody>
      )}
    </SheetContent>
  );
}

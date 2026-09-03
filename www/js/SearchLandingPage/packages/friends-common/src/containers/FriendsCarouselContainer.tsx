import { JSX, useEffect, useState } from "react";
import ExperimentationService from "@rbx/experimentation";
import { EventContext } from "@rbx/unified-logging";
import { useTranslation } from "@rbx/core-scripts/react";
import RealTime from "@rbx/core-scripts/realtime";
import dataStores from "@rbx/core-scripts/data-store";
import * as friendsService from "../services/friends";
import * as chatService from "../services/chat";
import { TFriend } from "../types/friendsCarousel";
import FriendsCarouselHeader from "../components/FriendsCarouselHeader";
import FriendsList from "../components/FriendsList";
import FriendCarouselNames from "../constants/friendCarouselNames";
import { mustHideConnectionsDueToAMP, isBlockingViewer } from "../utils/osa";

const FRIENDSHIP_EVENT_TYPE = "FriendshipNotifications";
const BADGING_EXPERIMENT_LAYER = "Social.Friends";
const FULFILLED_PROMISE_STATUS = "fulfilled";

const { userDataStore } = dataStores;

type ExperimentationConfig = {
  isBadgeEnabled: boolean;
  isAddFriendsTileEnabledWeb: boolean;
  isIARCJoinCardRedesignEnabled: boolean;
  isIARCJoinCardGameRowClickableEnabled: boolean;
};

const mustHideConnectionsCheck = async (profileUserId: number, isMyProfile: boolean) => {
  if (isMyProfile) {
    return false;
  }
  if (await isBlockingViewer(profileUserId)) {
    return true;
  }
  const mustHide = await mustHideConnectionsDueToAMP(profileUserId);
  return mustHide;
};

const FriendsCarouselContainer = ({
  profileUserId,
  isOwnUser,
  carouselName,
  eventContext,
  homePageSessionInfo,
  sortId,
  sortPosition,
}: {
  profileUserId: number;
  isOwnUser: boolean;
  carouselName: FriendCarouselNames;
  eventContext: EventContext;
  homePageSessionInfo: string | undefined;
  sortId: number | undefined;
  sortPosition: number | undefined;
}): JSX.Element => {
  const [friendsCount, setFriendsCount] = useState<number | null>(null);
  const [friends, setFriends] = useState<TFriend[] | null>(null);
  const [canChat, setCanChat] = useState<boolean>(false);
  const [newFriendRequestsCount, setNewFriendRequestsCount] = useState<number | null>(null);
  const [showFriendsCarousel, setShowFriendsCarousel] = useState<boolean>(false);
  const [experimentationConfig, setExperimentationConfig] = useState<ExperimentationConfig>({
    isBadgeEnabled: false,
    isAddFriendsTileEnabledWeb: false,
    isIARCJoinCardRedesignEnabled: false,
    isIARCJoinCardGameRowClickableEnabled: false,
  });

  const { translate } = useTranslation();

  const fetchExperimentationConfig = async (): Promise<ExperimentationConfig> => {
    try {
      const ixpResult = await ExperimentationService.getAllValuesForLayer(BADGING_EXPERIMENT_LAYER);
      return {
        isBadgeEnabled: ixpResult.enableNewFriendRequestsBadge === true,
        isAddFriendsTileEnabledWeb: ixpResult.enableAddFriendsTileOnWeb === true,
        isIARCJoinCardRedesignEnabled: ixpResult.isIARCJoinCardRedesignEnabled === true,
        isIARCJoinCardGameRowClickableEnabled:
          ixpResult.isIARCJoinCardGameRowClickableEnabled === true,
      };
    } catch (error) {
      console.error("Error fetching experimentation config:", error);
      return {
        isBadgeEnabled: false,
        isAddFriendsTileEnabledWeb: false,
        isIARCJoinCardRedesignEnabled: false,
        isIARCJoinCardGameRowClickableEnabled: false,
      };
    }
  };

  const getShouldShowFriendsCarousel = (
    hideConnections: boolean,
    name: FriendCarouselNames,
    friendCount: number,
    requestCount: number,
    isAddFriendsTileEnabledWeb: boolean,
  ): boolean => {
    if (hideConnections) return false;

    if (name !== FriendCarouselNames.WebHomeFriendsCarousel) {
      return friendCount !== 0;
    }
    return friendCount !== 0 || (isAddFriendsTileEnabledWeb && requestCount !== 0);
  };

  // temporary here to clean up local storage from userDataStore
  // can be removed once local storage v2 is implemented (UBIQUITY-1456)
  useEffect(() => {
    userDataStore.clearUserDataStoreCache();
  }, []);

  // Listen to friend events if carousel is visible
  useEffect(() => {
    if (!showFriendsCarousel) return undefined;

    const handleFriendEvent = async () => {
      try {
        const count = await friendsService.getNewFriendRequestsCount();
        setNewFriendRequestsCount(count);
      } catch (error) {
        console.error("Error fetching friend request count:", error);
      }
    };
    // Subscribe to friending events
    const realTimeClient = RealTime.GetClient();

    realTimeClient.Subscribe(FRIENDSHIP_EVENT_TYPE, handleFriendEvent);

    return () => {
      realTimeClient.Unsubscribe(FRIENDSHIP_EVENT_TYPE, handleFriendEvent);
    };
  }, [showFriendsCarousel]);

  useEffect(() => {
    const getData = async () => {
      const [
        getFriendsCount,
        getFriends,
        getChatSettings,
        getNewFriendRequestsCount,
        mustHideFriends,
        experimentationConfigResult,
      ] = await Promise.allSettled([
        friendsService.getFriendsCount(profileUserId),
        friendsService.getFriends(profileUserId, isOwnUser),
        chatService.getChatSettings(),
        friendsService.getNewFriendRequestsCount(),
        mustHideConnectionsCheck(profileUserId, isOwnUser),
        fetchExperimentationConfig(),
      ]);
      const friendsCountValue =
        getFriendsCount.status === FULFILLED_PROMISE_STATUS ? getFriendsCount.value.count : 0;
      const friendsValue = getFriends.status === FULFILLED_PROMISE_STATUS ? getFriends.value : [];
      const chatEnabledValue =
        getChatSettings.status === FULFILLED_PROMISE_STATUS
          ? getChatSettings.value.chatEnabled
          : false;
      const newFriendRequestsCountValue =
        getNewFriendRequestsCount.status === FULFILLED_PROMISE_STATUS
          ? getNewFriendRequestsCount.value
          : 0;
      const experimentationConfigValue =
        experimentationConfigResult.status === FULFILLED_PROMISE_STATUS
          ? experimentationConfigResult.value
          : {
              isBadgeEnabled: false,
              isAddFriendsTileEnabledWeb: false,
              isIARCJoinCardRedesignEnabled: false,
              isIARCJoinCardGameRowClickableEnabled: false,
            };
      const mustHideConnections =
        mustHideFriends.status === FULFILLED_PROMISE_STATUS ? mustHideFriends.value : true;
      setFriendsCount(friendsCountValue);
      setFriends(friendsValue);
      setCanChat(chatEnabledValue);
      setNewFriendRequestsCount(newFriendRequestsCountValue);
      setExperimentationConfig(experimentationConfigValue);

      // Set the visibility of the friends carousel on load
      setShowFriendsCarousel(
        getShouldShowFriendsCarousel(
          mustHideConnections,
          carouselName,
          friendsCountValue,
          newFriendRequestsCountValue,
          experimentationConfigValue.isAddFriendsTileEnabledWeb,
        ),
      );
    };

    getData().catch((e: unknown) => {
      console.error(e);
    });
  }, [profileUserId, isOwnUser, carouselName]);

  return !showFriendsCarousel ? (
    <div className="friends-carousel-0-friends" />
  ) : (
    <div className="react-friends-carousel-container">
      <FriendsCarouselHeader
        friendsCount={friendsCount}
        translate={translate}
        profileUserId={profileUserId}
        isOwnUser={isOwnUser}
      />
      <FriendsList
        badgeCount={experimentationConfig.isBadgeEnabled ? (newFriendRequestsCount ?? 0) : 0}
        friendsList={friends}
        translate={translate}
        isOwnUser={isOwnUser}
        canChat={canChat}
        carouselName={carouselName}
        eventContext={eventContext}
        homePageSessionInfo={homePageSessionInfo}
        sortId={sortId}
        sortPosition={sortPosition}
        isAddFriendsTileEnabled={experimentationConfig.isAddFriendsTileEnabledWeb}
        isIARCJoinCardRedesignEnabled={experimentationConfig.isIARCJoinCardRedesignEnabled}
        isIARCJoinCardGameRowClickableEnabled={
          experimentationConfig.isIARCJoinCardGameRowClickableEnabled
        }
      />
    </div>
  );
};

export default FriendsCarouselContainer;

import { useEffect, useRef } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import RealTime from "@rbx/core-scripts/realtime";
import { useSystemFeedback } from "@rbx/core-ui";
import ProfileTabsContainer from "./components/ProfileTabs/ProfileTabsContainer";
import UserProfileHeader from "./components/UserProfileHeader";
import CurrentlyWearingAvatar from "./components/CurrentlyWearing/CurrentlyWearingAvatar";

import GracefulDegradationBanner from "./components/Common/GracefulDegradationBanner";
import { useProfilePlatformContext } from "./context/ProfilePlatformContext";
import analyticsService from "./analytics/analyticsService";
import { EventNames } from "./analytics/constants";
import getFriendStatusFromPrimaryAction from "./analytics/getFriendStatusFromPrimaryAction";

const ProfilePlatformContainer = () => {
  const authedUser = authenticatedUser();
  const isAuthenticated = authedUser?.isAuthenticated ?? false;

  const {
    isLoading,
    hasError,
    profileData,
    profileId,
    profileType,
    profileSessionId,
    refreshProfilePlatform,
  } = useProfilePlatformContext();
  const { SystemFeedbackComponent } = useSystemFeedback();
  const firedPageLoadEvent = useRef(false);
  const gracefulDegradationEnabled = profileData?.gracefulDegradationEnabled ?? false;

  useEffect(() => {
    if (isLoading || hasError || !profileData || firedPageLoadEvent.current) {
      return;
    }
    firedPageLoadEvent.current = true;

    const primaryAction = profileData.components.Actions?.buttons?.[0]?.type;
    analyticsService.fireAnalyticsEvent(profileType, EventNames.WEB_PAGE_LOAD, {
      profileId,
      profileType,
      profileSessionId,
      primaryAction: primaryAction?.toString(),
      friendStatus: getFriendStatusFromPrimaryAction(
        primaryAction,
        authedUser?.id?.toString() === profileId,
      ),
    });
  }, [isLoading, hasError, profileData, profileId, profileType, profileSessionId, authedUser?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const handleFriendshipEvent = () => {
      refreshProfilePlatform().catch((error: unknown) => {
        console.error(error);
      });
    };

    const realTimeClient = RealTime.GetClient();
    realTimeClient.Subscribe("FriendshipNotifications", handleFriendshipEvent);

    return () => {
      realTimeClient.Unsubscribe("FriendshipNotifications", handleFriendshipEvent);
    };
  }, [refreshProfilePlatform, isAuthenticated]);

  return (
    <div>
      <SystemFeedbackComponent />
      <CurrentlyWearingAvatar />
      <UserProfileHeader gracefulDegradationEnabled={gracefulDegradationEnabled} />
      {gracefulDegradationEnabled ? <GracefulDegradationBanner /> : <ProfileTabsContainer />}
    </div>
  );
};

export default ProfilePlatformContainer;

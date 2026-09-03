import { EventContext } from "@rbx/unified-logging";
import { FriendsCarousel, FriendCarouselNames } from "@rbx/friends-common";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import { useIsOwnProfile } from "../../hooks/useIsOwnProfile";

const FriendsContainer = () => {
  const { profileId } = useProfilePlatformContext();
  const isOwnUser = useIsOwnProfile();
  const profileUserId = parseInt(profileId, 10);

  if (Number.isNaN(profileUserId)) {
    return null;
  }

  return (
    <FriendsCarousel
      profileUserId={profileUserId}
      isOwnUser={isOwnUser}
      carouselName={FriendCarouselNames.WebProfileFriendsCarousel}
      eventContext={EventContext.UserProfile}
      homePageSessionInfo={undefined}
      sortId={undefined}
      sortPosition={undefined}
    />
  );
};

export default FriendsContainer;

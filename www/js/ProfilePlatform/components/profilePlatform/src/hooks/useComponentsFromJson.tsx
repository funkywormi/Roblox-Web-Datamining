import { ReactElement } from "react";
import { Component, ProfileType } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import CollectionsContainer from "../components/Collections/CollectionsContainer";
import CommunitiesContainer from "../components/Communities/CommunitiesContainer";
import CurrentlyWearingContainer from "../components/CurrentlyWearing/CurrentlyWearingContainer";
import ExperiencesContainer from "../components/Experiences/ExperiencesContainer";
import FavoriteExperiences from "../components/FavoriteExperiences";
import FriendsContainer from "../components/Friends/FriendsContainer";
import PlayerBadgesContainer from "../components/PlayerBadges/PlayerBadgesContainer";
import StoreContainer from "../components/Store/StoreContainer";
import TrustedFriendModalWrapper from "../components/TrustedFriendModalWrapper";

const USER_COMPONENTS_MAP: Partial<Record<Component, ReactElement>> = {
  [Component.CurrentlyWearing]: <CurrentlyWearingContainer />,
  [Component.Friends]: <FriendsContainer />,
  [Component.Collections]: <CollectionsContainer />,
  [Component.Communities]: <CommunitiesContainer />,
  [Component.FavoriteExperiences]: <FavoriteExperiences />,
  [Component.PlayerBadges]: <PlayerBadgesContainer />,
  [Component.Experiences]: <ExperiencesContainer />,
  [Component.Store]: <StoreContainer />,
  [Component.TrustedFriendModal]: <TrustedFriendModalWrapper />,
};

const useComponentsFromJson = (): Partial<Record<Component, ReactElement>> => {
  const { profileType } = useProfilePlatformContext();

  switch (profileType) {
    case ProfileType.User:
      return USER_COMPONENTS_MAP;
    case ProfileType.Community: {
      // TODO: Handle other profile types when needed
      return {};
    }
    case ProfileType.Contact: {
      return {};
    }
    default:
      return {};
  }
};

export default useComponentsFromJson;

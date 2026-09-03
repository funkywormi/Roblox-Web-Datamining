import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import Communities from "./Communities";
import useFetchGroupsData from "../../hooks/useFetchGroupsData";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";

const CommunitiesContainer = () => {
  const { profileData } = useProfilePlatformContext();
  const communitiesData = useProfileJsonComponent(Component.Communities);
  const { groups, isLoading } = useFetchGroupsData(
    profileData?.profileId ?? "",
    communitiesData?.communityIds ?? [],
  );

  if (isLoading || groups.length === 0) {
    return null;
  }

  return <Communities groups={groups} />;
};

export default CommunitiesContainer;

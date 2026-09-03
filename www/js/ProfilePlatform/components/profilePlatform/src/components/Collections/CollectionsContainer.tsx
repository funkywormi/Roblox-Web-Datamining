import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import Collections from "./Collections";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import useFetchAssetsData from "../../hooks/useFetchAssetsData";

const CollectionsContainer = () => {
  const { profileData } = useProfilePlatformContext();
  const collectionsData = useProfileJsonComponent(Component.Collections);
  const { hydratedAssets, isLoading } = useFetchAssetsData(collectionsData?.assets ?? []);

  if (isLoading || hydratedAssets.length === 0) {
    return null;
  }

  return <Collections userId={profileData?.profileId ?? ""} assets={hydratedAssets} />;
};

export default CollectionsContainer;

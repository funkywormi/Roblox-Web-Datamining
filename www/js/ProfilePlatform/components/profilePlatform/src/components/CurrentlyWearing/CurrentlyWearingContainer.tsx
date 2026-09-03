import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import CurrentlyWearing from "./CurrentlyWearing";
import useFetchAssetsData from "../../hooks/useFetchAssetsData";

const CurrentlyWearingContainer = () => {
  const currentlyWearingData = useProfileJsonComponent(Component.CurrentlyWearing);
  const { hydratedAssets, isLoading } = useFetchAssetsData(currentlyWearingData?.assets ?? []);

  if (!currentlyWearingData || isLoading || hydratedAssets.length === 0) {
    return null;
  }

  return <CurrentlyWearing assets={hydratedAssets} />;
};

export default CurrentlyWearingContainer;

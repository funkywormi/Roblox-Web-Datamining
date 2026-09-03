import { Component } from "@rbx/profile-platform";
import Store from "./Store";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import useFetchAssetsData from "../../hooks/useFetchAssetsData";

const StoreContainer = () => {
  const storeData = useProfileJsonComponent(Component.Store);
  const { hydratedAssets, isLoading } = useFetchAssetsData(storeData?.assets ?? []);

  if (!storeData || isLoading || hydratedAssets.length === 0) {
    return null;
  }

  return <Store name={storeData.name} assets={hydratedAssets} />;
};

export default StoreContainer;

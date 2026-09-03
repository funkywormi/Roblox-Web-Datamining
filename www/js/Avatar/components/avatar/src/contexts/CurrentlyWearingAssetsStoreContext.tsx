import React, { createContext, useCallback, useContext, useState } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";

interface CurrentlyWearingAssetsStoreContextType {
  currentlyWornAssetsList: AccoutrementAsset[];
  setCurrentlyWornAssetsList: (assets: AccoutrementAsset[]) => void;
  setCurrentlyWornAssets: (assets: AccoutrementAsset[]) => void;
  currentlyWornAssetsLookup: Record<number, boolean>;
  equippedBackgroundId: number | undefined;
  setEquippedBackgroundId: (assetId: number | undefined) => void;
}

const CurrentlyWearingAssetsStoreContext = createContext<
  CurrentlyWearingAssetsStoreContextType | undefined
>(undefined);

export const CurrentlyWearingAssetsStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentlyWornAssetsList, setCurrentlyWornAssetsList] = useState<AccoutrementAsset[]>([]);

  const [currentlyWornAssetsLookup, setCurrentlyWornAssetsLookup] = useState<
    Record<number, boolean>
  >({});

  const [equippedBackgroundId, setEquippedBackgroundId] = useState<number | undefined>(undefined);

  const getIds = useCallback((assets: AccoutrementAsset[]): number[] => {
    const ids: number[] = [];
    assets.forEach(asset => {
      ids.push(asset.id);
    });
    return ids;
  }, []);

  const getIdsLookup = useCallback(
    (assets: AccoutrementAsset[]): Record<number, boolean> => {
      const ids: number[] = getIds(assets);
      const lookup: Record<number, boolean> = {};
      ids.forEach(id => {
        lookup[id] = true;
      });
      return lookup;
    },
    [getIds],
  );

  const setCurrentlyWornAssets = useCallback(
    (assets: AccoutrementAsset[]) => {
      setCurrentlyWornAssetsList(assets);
      setCurrentlyWornAssetsLookup(getIdsLookup(assets));
    },
    [getIdsLookup],
  );

  return (
    <CurrentlyWearingAssetsStoreContext.Provider
      value={{
        currentlyWornAssetsList,
        setCurrentlyWornAssetsList,
        setCurrentlyWornAssets,
        currentlyWornAssetsLookup,
        equippedBackgroundId,
        setEquippedBackgroundId,
      }}
    >
      {children}
    </CurrentlyWearingAssetsStoreContext.Provider>
  );
};

export const useCurrentlyWearingAssetsStoreContext = () => {
  const context = useContext(CurrentlyWearingAssetsStoreContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentlyWearingAssetsStoreContext must be used within an CurrentlyWearingAssetsStoreProvider",
    );
  }
  return context;
};

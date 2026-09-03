import { useState, useCallback } from "react";
import { WearableAssetType } from "../avatarRules";

export type AvatarTypeService = {
  setAssetTypeLookups: (wearableAssetTypes: WearableAssetType[]) => void;
  getAssetTypeName: (id: number) => string | null;
  getAssetTypeByName: (name: string) => WearableAssetType;
  isReady: boolean;
};

function useAvatarTypeService(): AvatarTypeService {
  const [assetTypeLookup, setAssetTypeLookup] = useState<Record<number, WearableAssetType>>({});
  const [assetTypeNameLookup, setAssetTypeNameLookup] = useState<Record<string, WearableAssetType>>(
    {},
  );

  const setAssetTypeLookups = useCallback((wearableAssetTypes: WearableAssetType[]) => {
    const newAssetTypeLookup: Record<number, WearableAssetType> = {};
    const newAssetTypeNameLookup: Record<string, WearableAssetType> = {};

    // Populate lookups
    for (let i = 0; i < wearableAssetTypes.length; i++) {
      const assetType = wearableAssetTypes[i]!;
      newAssetTypeLookup[assetType.id] = assetType;
      newAssetTypeNameLookup[assetType.name] = assetType;
    }

    // Update state with new lookup objects
    setAssetTypeLookup(newAssetTypeLookup);
    setAssetTypeNameLookup(newAssetTypeNameLookup);
  }, []);

  // Function to get asset type name by id
  const getAssetTypeName = useCallback(
    (id: number): string | null => {
      const assetType = assetTypeLookup[id];
      return assetType?.name ? assetType.name : null;
    },
    [assetTypeLookup],
  );

  // Function to get asset type by name
  const getAssetTypeByName = useCallback(
    (name: string): WearableAssetType => {
      return assetTypeNameLookup[name]!;
    },
    [assetTypeNameLookup],
  );

  // Ready once the asset-type lookups have been populated. Consumers can use
  // this to avoid acting on the empty/initial lookup state.
  const isReady = Object.keys(assetTypeLookup).length > 0;

  return {
    setAssetTypeLookups,
    getAssetTypeName,
    getAssetTypeByName,
    isReady,
  };
}

export default useAvatarTypeService;

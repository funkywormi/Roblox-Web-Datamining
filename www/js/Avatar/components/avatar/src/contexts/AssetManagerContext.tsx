import React, { createContext, useContext } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { ClassicHeadSlot, HatSlot, LayeredClothingSlot, CategorySlot } from "../types";
import useAssetManager from "../hooks/useAssetManager";
import { CategoryRow } from "../types/avatarTab.types";
import useAssetManagerService from "../hooks/useAssetManagerService";
import { SetWearingAssetsResponse } from "../services/avatarAPIService";

interface AssetManagerContextType {
  hatSlots: HatSlot[];
  classicHeadSlots: ClassicHeadSlot[];
  layeredClothingSlots: LayeredClothingSlot[];
  makeupSlots: CategorySlot[];
  makeupItemCount: number;
  eyebrowSlot: CategorySlot;
  eyelashSlot: CategorySlot;
  updateLayeredClothingSlots: (assets: AccoutrementAsset[]) => void;
  layeredClothingItemCount: number;
  isLayeredClothingCategory: (
    menuName: string | undefined,
    selectedRow: CategoryRow | undefined | null,
  ) => boolean;
  showLayeredClothingSlotUp: (slot: LayeredClothingSlot) => boolean;
  onLayeredClothingSlotUp: (item: LayeredClothingSlot) => void;
  showLayeredClothingSlotDown: (slot: LayeredClothingSlot) => boolean;
  onLayeredClothingSlotDown: (item: LayeredClothingSlot) => void;
  showMakeupSlotUp: (slot: CategorySlot) => boolean;
  onMakeupSlotUp: (slot: CategorySlot) => void;
  showMakeupSlotDown: (slot: CategorySlot) => boolean;
  onMakeupSlotDown: (slot: CategorySlot) => void;
  isDefaultClassicHeadSelected: boolean;
  constructLayeredClothingMetadata: (
    assets: AccoutrementAsset[],
    newLayeredClothingOrder?: LayeredClothingSlot[],
  ) => AccoutrementAsset[];
  setWearingAssets: (assets: AccoutrementAsset[]) => Promise<SetWearingAssetsResponse>;
  avatarCallLimiterItemCardsDisabled: boolean;
  setAvatarCallLimiterItemCardsDisabled: (disabled: boolean) => void;
  setWearingAssetsFromIdsV2: (
    assets: AccoutrementAsset[],
    reloadAssetsAfterSuccess: boolean,
  ) => Promise<any>;
  removeAsset: (asset: AccoutrementAsset) => Promise<SetWearingAssetsResponse>;
  wearAsset: (
    assetToWear: AccoutrementAsset,
    useExtendedSlots?: boolean,
  ) => Promise<SetWearingAssetsResponse>;
  onLayeredClothingSlotClicked: (slot: LayeredClothingSlot) => void;
  onClassicHeadSlotClicked: (slot: ClassicHeadSlot) => void;
  onHeadShapeSlotClicked: (headShape: string) => void;
  defaultClassicHeadSlotClicked: () => Promise<SetWearingAssetsResponse>;
  removeLayeredClothing: () => Promise<SetWearingAssetsResponse>;
  isClassicHeadItemSelected: (slot: ClassicHeadSlot) => boolean;
  isHeadShapeSelected: (headShape: string) => boolean;
}

const AssetManagerContext = createContext<AssetManagerContextType | undefined>(undefined);

export const AssetManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const assetManager = useAssetManager();

  const {
    removeAsset,
    wearAsset,
    onLayeredClothingSlotClicked,
    onClassicHeadSlotClicked,
    onHeadShapeSlotClicked,
    defaultClassicHeadSlotClicked,
    removeLayeredClothing,
    isClassicHeadItemSelected,
  } = useAssetManagerService(assetManager.setWearingAssets, assetManager.layeredClothingSlots);

  const assetManagerContextValue: AssetManagerContextType = {
    ...assetManager,
    removeAsset,
    wearAsset,
    onLayeredClothingSlotClicked,
    onClassicHeadSlotClicked,
    onHeadShapeSlotClicked,
    defaultClassicHeadSlotClicked,
    removeLayeredClothing,
    isClassicHeadItemSelected,
  };

  return (
    <AssetManagerContext.Provider value={assetManagerContextValue}>
      {children}
    </AssetManagerContext.Provider>
  );
};

export const useAssetManagerContext = () => {
  const context = useContext(AssetManagerContext);
  if (context === undefined) {
    throw new Error("useAssetManagerContext must be used within an AssetManagerProvider");
  }
  return context;
};

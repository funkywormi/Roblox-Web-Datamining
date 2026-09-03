import { useCallback } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import { LayeredClothingSlot, isEmptySlot, ClassicHeadSlot } from "../types";
import { avatarRefineItemRemovedEvent } from "../eventService";
import { SetWearingAssetsResponse } from "../services/avatarAPIService";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import avatarConstants from "../constants/avatarConstants";

// General makeup asset type IDs (Eye Makeup, Face Makeup, Lip Makeup)
const GENERAL_MAKEUP_ASSET_TYPE_IDS = [88, 89, 90];

const isGeneralMakeupAsset = (asset: AccoutrementAsset): boolean => {
  return GENERAL_MAKEUP_ASSET_TYPE_IDS.includes(asset.assetType.id);
};

const addMakeupOrderMeta = (
  assetList: AccoutrementAsset[],
  newAssetId?: number,
): AccoutrementAsset[] => {
  const makeupAssets = assetList.filter(isGeneralMakeupAsset);

  // Sort by current order descending (highest order first), with new asset at top
  const sortedMakeupIds = makeupAssets
    .sort((a, b) => {
      // New asset always goes to top
      if (a.id === newAssetId) return -1;
      if (b.id === newAssetId) return 1;
      // Otherwise sort by existing order descending (higher order = higher position)
      const orderA = a.meta?.order ?? 0;
      const orderB = b.meta?.order ?? 0;
      return orderB - orderA;
    })
    .map(asset => asset.id);

  return assetList.map(asset => {
    if (isGeneralMakeupAsset(asset)) {
      const position = sortedMakeupIds.indexOf(asset.id);
      // Position 0 (top) = order 5, position 5 (bottom) = order 0
      const order = Math.max(5 - position, 0);
      return {
        ...asset,
        meta: {
          ...asset.meta,
          order,
        },
      };
    }
    return asset;
  });
};

const useAssetManagerService = (
  setWearingAssets: (assets: AccoutrementAsset[]) => Promise<SetWearingAssetsResponse>,
  layeredClothingSlots: LayeredClothingSlot[],
) => {
  const { currentlyWornAssetsList, currentlyWornAssetsLookup } =
    useCurrentlyWearingAssetsStoreContext();

  const systemFeedback = useSystemFeedback();

  const wearAsset = useCallback(
    (assetToWear: AccoutrementAsset, useExtendedSlots = false) => {
      let currentAssetList = currentlyWornAssetsList;
      const assetTypeInfo = AvatarAccoutrementService.getAssetTypeById(assetToWear.assetType.id);

      const { assetTypesToUnequip } = assetTypeInfo || {};
      if (assetTypesToUnequip) {
        currentAssetList = AvatarAccoutrementService.removeAssetTypesFromAvatar(
          assetTypesToUnequip,
          currentAssetList,
        );
      }

      const currentAssets = AvatarAccoutrementService.buildMetaForAssets(
        currentAssetList,
        false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        layeredClothingSlots as AccoutrementAsset[],
      );

      // For general makeup assets, assign order 5 (top) initially
      let assetToWearWithMeta: AccoutrementAsset;
      if (isGeneralMakeupAsset(assetToWear)) {
        assetToWearWithMeta = {
          ...assetToWear,
          meta: {
            ...assetToWear.meta,
            order: 5,
          },
        };
      } else {
        assetToWearWithMeta = AvatarAccoutrementService.buildMetaForAsset(
          assetToWear,
          currentAssets,
          true,
        );
      }

      const filteredAssets = AvatarAccoutrementService.addAssetToAvatar(
        assetToWearWithMeta,
        currentAssets,
        false,
        useExtendedSlots,
      );
      const finalAssetList = AvatarAccoutrementService.insertAssetMetaIntoAssetList(
        assetToWearWithMeta,
        filteredAssets,
      );

      // Add makeup order meta to all general makeup assets - new asset gets order 5, others shift down
      const finalAssetListWithMakeupMeta = isGeneralMakeupAsset(assetToWear)
        ? addMakeupOrderMeta(finalAssetList, assetToWear.id)
        : finalAssetList;

      return setWearingAssets(finalAssetListWithMakeupMeta);
    },
    [currentlyWornAssetsList, setWearingAssets, layeredClothingSlots],
  );

  const removeAsset = useCallback(
    (assetToRemove: AccoutrementAsset) => {
      const filteredAssets = AvatarAccoutrementService.removeAssetFromAvatar(
        assetToRemove,
        currentlyWornAssetsList,
      );

      const newLayeredClothingSlots: LayeredClothingSlot[] = [];
      layeredClothingSlots.forEach(slot => {
        if (isEmptySlot(slot) || slot.id !== assetToRemove.id) {
          newLayeredClothingSlots.push(slot);
        }
      });

      const filteredAssetsWithMeta = AvatarAccoutrementService.buildMetaForAssets(
        filteredAssets,
        false,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        newLayeredClothingSlots as AccoutrementAsset[],
      );

      // Recalculate makeup order meta after removal (no new asset, just re-sort existing)
      const filteredAssetsWithMakeupMeta = addMakeupOrderMeta(filteredAssetsWithMeta);

      return setWearingAssets(filteredAssetsWithMakeupMeta);
    },
    [currentlyWornAssetsList, layeredClothingSlots, setWearingAssets],
  );

  const onLayeredClothingSlotClicked = (slot: LayeredClothingSlot) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    removeAsset(slot as AccoutrementAsset);
    avatarRefineItemRemovedEvent();
  };

  const isClassicHeadItemSelected = useCallback(
    (slot: ClassicHeadSlot) => {
      return !isEmptySlot(slot) && (currentlyWornAssetsLookup[slot.id] ?? false);
    },
    [currentlyWornAssetsLookup],
  );

  const onClassicHeadSlotClicked = useCallback(
    (item: ClassicHeadSlot) => {
      if (!isEmptySlot(item) && isClassicHeadItemSelected(item)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        removeAsset(item as AccoutrementAsset);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        wearAsset(item);
      }
    },
    [removeAsset, wearAsset, isClassicHeadItemSelected],
  );

  const onHeadShapeSlotClicked = useCallback(
    (headShape: string) => {
      // Find the currently equipped dynamic head (asset type 79)
      const dynamicHeadAsset = currentlyWornAssetsList.find(asset => asset.assetType.id === 79);

      if (!dynamicHeadAsset) {
        return;
      }

      // Create updated asset list with the dynamic head having the headShape in its meta
      const updatedAssetsList = currentlyWornAssetsList.map(asset => {
        if (asset.assetType.id === 79) {
          return {
            ...asset,
            meta: {
              ...asset.meta,
              headShape,
            },
          };
        }
        return asset;
      });

      setWearingAssets(updatedAssetsList).catch(() => {
        systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
      });
    },
    [currentlyWornAssetsList, setWearingAssets, systemFeedback],
  );

  const defaultClassicHeadSlotClicked = useCallback(() => {
    let currentAssetList = currentlyWornAssetsList;
    const { assetTypesToUnequip } = AvatarAccoutrementService.getAssetTypeById(17);
    assetTypesToUnequip.push(17);
    if (assetTypesToUnequip) {
      currentAssetList = AvatarAccoutrementService.removeAssetTypesFromAvatar(
        assetTypesToUnequip,
        currentAssetList,
      );
    }
    return setWearingAssets(currentAssetList);
  }, [currentlyWornAssetsList, setWearingAssets]);

  const removeLayeredClothing = useCallback(() => {
    const filteredAssets =
      AvatarAccoutrementService.removeLayeredClothingFromAvatar(currentlyWornAssetsList);
    return setWearingAssets(filteredAssets);
  }, [currentlyWornAssetsList, setWearingAssets]);

  return {
    setWearingAssets,
    removeAsset,
    wearAsset,
    onLayeredClothingSlotClicked,
    onClassicHeadSlotClicked,
    onHeadShapeSlotClicked,
    defaultClassicHeadSlotClicked,
    removeLayeredClothing,
    isClassicHeadItemSelected,
  };
};

export default useAssetManagerService;

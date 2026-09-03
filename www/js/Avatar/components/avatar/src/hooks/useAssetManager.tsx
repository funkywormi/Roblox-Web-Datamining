import { useCallback, useEffect, useRef, useState } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { ThumbnailTypes } from "@rbx/thumbnails";
import { ClassicHeadSlot, HatSlot, CategorySlot } from "../types";
import avatarConstants from "../constants/avatarConstants";
import AvatarAPIService from "../services/avatarAPIService";
import { getCurrentUserId } from "../utils/currentUser";
import getItemThumbnailAndLink from "../utils/assetManager.helpers";
import useLayeredClothingSlots from "./useLayeredClothingSlots";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import { AccoutrementAssetWithType } from "../types/accoutrementAsset.types";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { useAvatarPageContext } from "../contexts/AvatarPageContext";
import parseError from "../utils/parseErrorUtil";
import { getSlotConfig } from "../constants/slotConfigurations";
import { isAvatarEditingDisabledError } from "../utils/avatarEditingError.utils";
import { sendAXTracking, reportAXError, AXAnalyticsConstants } from "../utils/axAnalyticsService";

const useAssetManager = () => {
  const [avatarCallLimiterItemCardsDisabled, setAvatarCallLimiterItemCardsDisabled] =
    useState<boolean>(false);

  const systemFeedback = useSystemFeedback();

  const { loadAvatarDetails } = useAvatarPageContext();

  const { currentlyWornAssetsList, setCurrentlyWornAssets } =
    useCurrentlyWearingAssetsStoreContext();

  const [hatSlots, setHatSlots] = useState<HatSlot[]>([]);
  const [classicHeadSlots, setClassicHeadSlots] = useState<ClassicHeadSlot[]>([]);
  const [isDefaultClassicHeadSelected, setIsDefaultClassicHeadSelected] = useState<boolean>(false);
  const [selectedHeadShape, setSelectedHeadShape] = useState<string | null>(null);
  const [makeupSlots, setMakeupSlots] = useState<CategorySlot[]>([]);
  const [makeupItemCount, setMakeupItemCount] = useState<number>(0);
  const [eyebrowSlot, setEyebrowSlot] = useState<CategorySlot>({ empty: true });
  const [eyelashSlot, setEyelashSlot] = useState<CategorySlot>({ empty: true });

  const makeupSlotConfig = getSlotConfig("makeup");
  const eyebrowSlotConfig = getSlotConfig("eyebrow");
  const eyelashSlotConfig = getSlotConfig("eyelash");

  const updateMakeupSlots = useCallback(
    (assets: AccoutrementAsset[]) => {
      // Update general makeup slots (Eye Makeup, Face Makeup, Lip Makeup)
      // Sort by order descending (5 = top, 0 = bottom)
      if (makeupSlotConfig) {
        const filteredAssets = assets.filter(makeupSlotConfig.assetFilter).sort((a, b) => {
          const orderA = a.meta?.order ?? 0;
          const orderB = b.meta?.order ?? 0;
          return orderB - orderA;
        });

        const slots: CategorySlot[] = filteredAssets.map(asset => ({
          type: "Asset" as const,
          id: asset.id,
          name: asset.name,
          assetType: asset.assetType,
          currentVersionId: asset.currentVersionId,
          thumbnailType: "Asset",
          meta: asset.meta,
        }));

        setMakeupItemCount(slots.length);

        while (slots.length < makeupSlotConfig.maxSlots) {
          slots.push({ empty: true });
        }

        setMakeupSlots(slots);
      }

      // Update eyebrow slot (only 1 allowed)
      if (eyebrowSlotConfig) {
        const eyebrowAsset = assets.find(eyebrowSlotConfig.assetFilter);
        if (eyebrowAsset) {
          setEyebrowSlot({
            type: "Asset" as const,
            id: eyebrowAsset.id,
            name: eyebrowAsset.name,
            assetType: eyebrowAsset.assetType,
            currentVersionId: eyebrowAsset.currentVersionId,
            thumbnailType: "Asset",
          });
        } else {
          setEyebrowSlot({ empty: true });
        }
      }

      // Update eyelash slot (only 1 allowed)
      if (eyelashSlotConfig) {
        const eyelashAsset = assets.find(eyelashSlotConfig.assetFilter);
        if (eyelashAsset) {
          setEyelashSlot({
            type: "Asset" as const,
            id: eyelashAsset.id,
            name: eyelashAsset.name,
            assetType: eyelashAsset.assetType,
            currentVersionId: eyelashAsset.currentVersionId,
            thumbnailType: "Asset",
          });
        } else {
          setEyelashSlot({ empty: true });
        }
      }
    },
    [makeupSlotConfig, eyebrowSlotConfig, eyelashSlotConfig],
  );

  // Check if makeup slot can move up (higher order = up in UI)
  const showMakeupSlotUp = useCallback(
    (slot: CategorySlot): boolean => {
      if ("empty" in slot) return false;
      const index = makeupSlots.indexOf(slot);
      return index > 0;
    },
    [makeupSlots],
  );

  // Check if makeup slot can move down (lower order = down in UI)
  const showMakeupSlotDown = useCallback(
    (slot: CategorySlot): boolean => {
      if ("empty" in slot) return false;
      const index = makeupSlots.indexOf(slot);
      return index < makeupItemCount - 1;
    },
    [makeupSlots, makeupItemCount],
  );

  const updateHatSlots = useCallback((assets: AccoutrementAsset[]) => {
    const updatedHatSlots = [];

    const max = 3;
    let count = 0;
    assets.forEach(asset => {
      if (count >= max) {
        return;
      }
      if (asset.assetType.name === "Hat") {
        const slot: AccoutrementAssetWithType = {
          ...asset,
          type: ThumbnailTypes.assetThumbnail,
        };
        const updatedSlot = {
          ...slot,
          ...getItemThumbnailAndLink(slot as any),
        };
        count += 1;
        updatedHatSlots.push(updatedSlot);
      }
    });

    while (count < max) {
      count += 1;
      updatedHatSlots.push({ empty: true });
    }

    setHatSlots(updatedHatSlots);
  }, []);

  const setWearingAssetsFromIdsV2 = useCallback(
    (assets: AccoutrementAsset[], reloadAssetsAfterSuccess = false) => {
      const request = AvatarAPIService.setWearingAssetsV2(assets);
      sendAXTracking({
        itemName: AXAnalyticsConstants.AvatarEditorChangeAvatar,
      });

      setAvatarCallLimiterItemCardsDisabled(true);
      request
        .then(
          () => {
            // we reload assets after success in advanced view because we only know the asset IDs
            // we don't know anything else about the assets or their types
            if (reloadAssetsAfterSuccess) {
              loadAvatarDetails();
            }
          },
          () => {
            // $log.debug('Error with set-wearing-assets');
          },
        )
        .finally(() => {
          setAvatarCallLimiterItemCardsDisabled(false);
        });
      return request;
    },
    [loadAvatarDetails],
  );

  const setWearingAssets = useCallback(
    (assets: AccoutrementAsset[]) => {
      const previouslyWornAssets: AccoutrementAsset[] = [...currentlyWornAssetsList];

      setCurrentlyWornAssets(assets);

      const request = setWearingAssetsFromIdsV2(assets);
      request.then(
        () => {
          // x
        },
        e => {
          reportAXError({
            itemName: "SetWearingAssetsError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });

          if (isAvatarEditingDisabledError(e)) {
            systemFeedback.info(avatarConstants.page.avatarEditingDisabled);
          } else {
            systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
          }
          // Undo local selection back to what it was before
          setCurrentlyWornAssets(previouslyWornAssets);
        },
      );
      return request;
    },
    [currentlyWornAssetsList, setCurrentlyWornAssets, setWearingAssetsFromIdsV2, systemFeedback],
  );

  const setWearingAssetsForReorder = useCallback(
    (assets: AccoutrementAsset[]) => {
      setWearingAssets(assets).catch(() => {
        // Error handled in setWearingAssets
      });
    },
    [setWearingAssets],
  );

  // Move makeup slot up or down by swapping orders
  const onMakeupSlotMove = useCallback(
    (slot: CategorySlot, isUp: boolean): void => {
      if ("empty" in slot) return;

      const slotAsset = currentlyWornAssetsList.find(asset => asset.id === slot.id);
      if (!slotAsset) return;

      const currentOrder = slotAsset.meta?.order ?? 0;
      // Up = higher order, Down = lower order
      const targetOrder = isUp ? currentOrder + 1 : currentOrder - 1;

      // Find the asset to swap with
      const swapAsset = currentlyWornAssetsList.find(
        asset => makeupSlotConfig?.assetFilter(asset) && asset.meta?.order === targetOrder,
      );

      if (!swapAsset) return;

      // Swap orders
      const reorderedAssets = currentlyWornAssetsList.map(asset => {
        if (asset.id === slotAsset.id) {
          return { ...asset, meta: { ...asset.meta, order: targetOrder } };
        }
        if (asset.id === swapAsset.id) {
          return { ...asset, meta: { ...asset.meta, order: currentOrder } };
        }
        return asset;
      });

      setWearingAssetsForReorder(reorderedAssets);
    },
    [currentlyWornAssetsList, makeupSlotConfig, setWearingAssetsForReorder],
  );

  const onMakeupSlotUp = useCallback(
    (slot: CategorySlot): void => {
      if (!showMakeupSlotUp(slot)) return;
      onMakeupSlotMove(slot, true);
    },
    [onMakeupSlotMove, showMakeupSlotUp],
  );

  const onMakeupSlotDown = useCallback(
    (slot: CategorySlot): void => {
      if (!showMakeupSlotDown(slot)) return;
      onMakeupSlotMove(slot, false);
    },
    [onMakeupSlotMove, showMakeupSlotDown],
  );

  const {
    layeredClothingSlots,
    layeredClothingItemCount,
    isLayeredClothingCategory,
    showLayeredClothingSlotUp,
    onLayeredClothingSlotUp,
    showLayeredClothingSlotDown,
    onLayeredClothingSlotDown,
    updateLayeredClothingSlots,
    constructLayeredClothingMetadata,
  } = useLayeredClothingSlots(currentlyWornAssetsList, setWearingAssets);

  const checkDefaultHeadEquipped = useCallback(() => {
    let defaultHeadEquipped = true;
    currentlyWornAssetsList.forEach(asset => {
      if (asset.assetType.id === 17 || asset.assetType.id === 79) {
        defaultHeadEquipped = false;
      }
    });
    setIsDefaultClassicHeadSelected(defaultHeadEquipped);
  }, [currentlyWornAssetsList]);

  const updateSelectedHeadShape = useCallback(() => {
    // Find the dynamic head asset (asset type 79) and check its meta for headShape
    const dynamicHeadAsset = currentlyWornAssetsList.find(asset => asset.assetType.id === 79);
    const headShape = dynamicHeadAsset?.meta?.headShape;
    if (headShape) {
      setSelectedHeadShape(headShape);
    } else {
      setSelectedHeadShape(null);
    }
  }, [currentlyWornAssetsList]);

  const isHeadShapeSelected = useCallback(
    (headShape: string) => {
      return selectedHeadShape === headShape;
    },
    [selectedHeadShape],
  );

  const { avatarTypeService } = useAvatarPageContext();

  const loadClassicHeads = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      // Check ownership for all classic heads
      const ownershipResults = await Promise.all(
        avatarConstants.classicHeads.map(head =>
          AvatarAPIService.getOwnership(userId, "asset", head.assetId),
        ),
      );

      // Filter to only owned classic heads
      const classicHeadAssets = [];
      for (let i = 0; i < ownershipResults.length; i++) {
        if (ownershipResults[i] === true) {
          classicHeadAssets.push(avatarConstants.classicHeads[i]!);
        }
      }

      if (classicHeadAssets.length > 0) {
        // Get item details for owned classic heads
        const itemDetailsResponse = await AvatarAPIService.postItemDetails(
          classicHeadAssets,
          "Asset",
        );
        const assetDetails = itemDetailsResponse.data;

        const newClassicHeadSlots: ClassicHeadSlot[] = [];
        assetDetails.forEach(asset => {
          const assetTypeName = avatarTypeService.getAssetTypeName(asset.assetType);
          newClassicHeadSlots.push({
            ...asset,
            thumbnailType: "Asset" as const,
            empty: false,
            assetType: {
              id: asset.assetType,
              name: assetTypeName || "Head",
            },
          });
        });

        setClassicHeadSlots(newClassicHeadSlots);
      } else {
        setClassicHeadSlots([]);
      }
    } catch (error) {
      reportAXError({
        itemName: "LoadClassicHeadsError",
        counterName: "AvatarEditorError",
        log: parseError(error),
      });
      setClassicHeadSlots([]);
    }
  }, [avatarTypeService]);

  const updateSelection = useCallback(() => {
    updateHatSlots(currentlyWornAssetsList);
    updateLayeredClothingSlots(currentlyWornAssetsList);
    updateMakeupSlots(currentlyWornAssetsList);
    checkDefaultHeadEquipped();
    updateSelectedHeadShape();
  }, [
    currentlyWornAssetsList,
    updateHatSlots,
    updateLayeredClothingSlots,
    updateMakeupSlots,
    checkDefaultHeadEquipped,
    updateSelectedHeadShape,
  ]);

  useEffect(() => {
    updateSelection();
  }, [updateSelection]);

  const hasLoadedClassicHeads = useRef(false);
  useEffect(() => {
    // Classic head ownership only needs to be checked once per page load.
    // Wait until avatarTypeService is ready so head type names resolve
    // correctly, and guard with a ref so the ownership checks fire exactly
    // once (avoids flooding the inventory API / getting flood-checked).
    if (hasLoadedClassicHeads.current || !avatarTypeService.isReady) {
      return;
    }
    hasLoadedClassicHeads.current = true;

    loadClassicHeads().catch(error => {
      reportAXError({
        itemName: "LoadClassicHeadsError",
        counterName: "AvatarEditorError",
        log: parseError(error),
      });
    });
  }, [loadClassicHeads, avatarTypeService.isReady]);

  return {
    hatSlots,
    classicHeadSlots,
    layeredClothingSlots,
    updateLayeredClothingSlots,
    layeredClothingItemCount,
    isLayeredClothingCategory,
    showLayeredClothingSlotUp,
    onLayeredClothingSlotUp,
    showLayeredClothingSlotDown,
    onLayeredClothingSlotDown,
    isDefaultClassicHeadSelected,
    isHeadShapeSelected,
    constructLayeredClothingMetadata,
    setWearingAssets,
    avatarCallLimiterItemCardsDisabled,
    setAvatarCallLimiterItemCardsDisabled,
    setWearingAssetsFromIdsV2,
    makeupSlots,
    makeupItemCount,
    showMakeupSlotUp,
    onMakeupSlotUp,
    showMakeupSlotDown,
    onMakeupSlotDown,
    eyebrowSlot,
    eyelashSlot,
  };
};

export default useAssetManager;

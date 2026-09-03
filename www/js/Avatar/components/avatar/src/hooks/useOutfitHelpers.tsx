/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useState } from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { reportAXError } from "../utils/axAnalyticsService";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import AvatarAPIService, {
  AvatarResponseBase,
  getInvalidAssetIds,
} from "../services/avatarAPIService";
import { useAvatarPageContext } from "../contexts/AvatarPageContext";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import avatarConstants, {
  OUTFIT_COSTUME_MESSAGES,
  OUTFIT_SETTINGS,
} from "../constants/avatarConstants";
import { OutfitDetails, OutfitDetailsV3 } from "../types/outfitDetails.types";
import { avatarBodyPartIds } from "../constants/avatarAssetTypeNames";
import { useAssetManagerContext } from "../contexts/AssetManagerContext";
import { AvatarType } from "../constants/types";
import { sendOutfitClickEvent, sendOutfitWearEvent } from "../eventService";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import {
  CatalogAssetItem,
  CatalogItem,
  CatalogOutfitItem,
  isCatalogItemAsset,
  isCatalogItemOutfit,
} from "../avatar.types";
import parseError from "../utils/parseErrorUtil";
import { isAvatarEditingDisabledError } from "../utils/avatarEditingError.utils";
import { useAvatarTabsContext } from "../contexts/AvatarTabsContext";
import {
  trackAvatarEdit,
  AvatarEditorTrackingEvents,
  AXTrackingMetaData,
} from "../utils/axTracking";

const useOutfitHelpers = (
  forceRefreshThumbnail: () => void,
  translate: TranslateFunction,
  useExtendedAccessorySlots = false,
  switchToTwoDee?: () => void,
) => {
  const [isEquipEmotesModalOpen, setIsEquipEmotesModalOpen] = useState(false);
  const [emoteToEquip, setEmoteToEquip] = useState<CatalogItem>();
  const [currentOutfitSupportsHeadShapes, setCurrentOutfitSupportsHeadShapes] = useState(false);

  const openEmotesModal = useCallback(
    (selectedEmote?: CatalogItem) => {
      if (selectedEmote) {
        setEmoteToEquip(selectedEmote);
      }
      setIsEquipEmotesModalOpen(true);
    },
    [setEmoteToEquip, setIsEquipEmotesModalOpen],
  );

  const closeEmotesModal = useCallback(() => {
    setIsEquipEmotesModalOpen(false);
    setEmoteToEquip(undefined);
  }, [setEmoteToEquip, setIsEquipEmotesModalOpen]);

  const [isItemLimitedExceededDialogOpen, setIsItemLimitedExceededDialogOpen] = useState(false);
  const [bodyTypeWarningAssetToWear, setBodyTypeWarningAssetToWear] =
    useState<AccoutrementAsset | null>(null);

  const {
    currentlyWornAssetsList,
    currentlyWornAssetsLookup,
    equippedBackgroundId,
    setEquippedBackgroundId,
  } = useCurrentlyWearingAssetsStoreContext();

  const { loadAvatarDetails, avatarType, avatarTypeService, setAvatarType, catalogMetaData } =
    useAvatarPageContext();

  const {
    layeredClothingSlots,
    layeredClothingItemCount,
    setWearingAssets,
    setAvatarCallLimiterItemCardsDisabled,
    removeAsset,
    wearAsset,
  } = useAssetManagerContext();

  const systemFeedback = useSystemFeedback();

  const { selectedTab, selectedSubcategory, selectedCategoryRow } = useAvatarTabsContext();

  // Builds rich tracking metadata for an item interaction, including the
  // currently selected category and the item's position in the card list.
  const buildItemTrackingMetaData = useCallback(
    (item: CatalogItem): AXTrackingMetaData => ({
      category: selectedSubcategory?.name ?? selectedCategoryRow?.title ?? selectedTab?.name,
      position: item.count,
      itemId: item.id,
      itemType: item.type,
      assetTypeId: isCatalogItemAsset(item) ? item.assetType?.id : undefined,
      assetTypeName: isCatalogItemAsset(item) ? item.assetType?.name : undefined,
      outfitType: isCatalogItemOutfit(item) ? item.outfitType : undefined,
    }),
    [selectedSubcategory, selectedCategoryRow, selectedTab],
  );

  // Check if any currently worn dynamic head asset has supportsHeadShapes property
  // This runs whenever currentlyWornAssetsList changes (after equip/unequip)
  useEffect(() => {
    if (currentlyWornAssetsList.length > 0) {
      // Check specifically for dynamic head assets (type 79) with supportsHeadShapes
      const dynamicHeadSupportsHeadShapes = currentlyWornAssetsList.some(
        asset => asset.assetType?.id === 79 && asset.supportsHeadShapes === true,
      );
      setCurrentOutfitSupportsHeadShapes(dynamicHeadSupportsHeadShapes);
    } else {
      setCurrentOutfitSupportsHeadShapes(false);
    }
  }, [currentlyWornAssetsList]);

  const wearPackageAsset = useCallback(
    (item: CatalogAssetItem) => {
      AvatarAPIService.wearAsset(item.id).then(
        data => {
          forceRefreshThumbnail();
          loadAvatarDetails();

          const response = data;

          const invalidAssetsCount = getInvalidAssetIds(response).length;
          if (invalidAssetsCount) {
            const message = translate("Message.MissingItemsFromOutfit", {
              number: invalidAssetsCount,
            });

            reportAXError({
              itemName: "WearPackageAssetError",
              counterName: "AvatarEditorError",
              log: JSON.stringify({ message: "HasInvalidAssets" }),
            });

            systemFeedback.error(message);
          }
        },
        e => {
          reportAXError({
            itemName: "WearPackageAssetError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });
          if (isAvatarEditingDisabledError(e)) {
            systemFeedback.info(avatarConstants.page.avatarEditingDisabled);
          } else {
            systemFeedback.error(avatarConstants.packages.errorWearingPackage);
          }
        },
      );
    },
    [loadAvatarDetails, forceRefreshThumbnail, systemFeedback, translate],
  );

  // Profile backgrounds are not part of the avatar definition; they are applied via the
  // consolidated UpdateAvatar (PATCH /v4/avatar) `backgroundRequestModel` config. Pass 0 to clear.
  const equipBackground = useCallback(
    (backgroundAssetId: number) => {
      // Optimistically reflect the selection so the grid updates immediately; the subsequent
      // reload reconciles with the server, and we revert on failure. 0 clears the background.
      const previousBackgroundId = equippedBackgroundId;
      setEquippedBackgroundId(backgroundAssetId || undefined);
      AvatarAPIService.equipBackground(backgroundAssetId).then(
        () => {
          forceRefreshThumbnail();
          loadAvatarDetails();
        },
        (e: unknown) => {
          setEquippedBackgroundId(previousBackgroundId);
          reportAXError({
            itemName: "EquipBackgroundError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });
          if (isAvatarEditingDisabledError(e)) {
            systemFeedback.info(avatarConstants.page.avatarEditingDisabled);
          } else {
            systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
          }
        },
      );
    },
    [
      equippedBackgroundId,
      setEquippedBackgroundId,
      loadAvatarDetails,
      forceRefreshThumbnail,
      systemFeedback,
    ],
  );

  function isOutfitFullyQualified(outfitDetails: OutfitDetails | OutfitDetailsV3) {
    const outfitBodyParts = avatarBodyPartIds.slice();
    outfitDetails.assets.forEach(element => {
      if (!element.assetType) {
        return;
      }
      const index = outfitBodyParts.indexOf(element.assetType.id);
      if (index >= 0) {
        outfitBodyParts.splice(index, 1);
      }
    });

    if (outfitBodyParts.length > 0) {
      // Not all body parts are in outfit, no fully qualified
      return false;
    }
    return true;
  }

  function shouldBodyColorsBeUpdatedForOutfit(outfitDetails: OutfitDetails | OutfitDetailsV3) {
    const outfitSettings = OUTFIT_SETTINGS[outfitDetails.outfitType];
    if (outfitSettings?.skipBodyColors) {
      return false;
    }
    return outfitDetails.isEditable;
  }

  const shouldBodyScaleBeUpdatedForOutfit = useCallback(
    (outfitDetails: OutfitDetails | OutfitDetailsV3) => {
      const outfitSettings = OUTFIT_SETTINGS[outfitDetails.outfitType];
      if (outfitSettings?.skipBodyScale) {
        return false;
      }

      if (outfitDetails.isEditable) {
        // Preset outfit
        return true;
      }

      return isOutfitFullyQualified(outfitDetails);
    },
    [],
  );

  const shouldAvatarTypeBeUpdatedForOutfit = useCallback(
    (outfitDetails: OutfitDetails | OutfitDetailsV3) => {
      return avatarType !== outfitDetails.playerAvatarType;
    },
    [avatarType],
  );

  // Only full "Avatar" outfits carry/apply a profile background; partial looks skip it.
  // `backgroundAssetId` is `undefined` only on the V3 read path, which cannot report a
  // background at all — there we leave the current one untouched. On V4, an outfit with no
  // background reports `0`, which equips as an explicit clear.
  const shouldBackgroundBeUpdatedForOutfit = useCallback(
    (outfitDetails: OutfitDetails | OutfitDetailsV3) => {
      const outfitSettings = OUTFIT_SETTINGS[outfitDetails.outfitType];
      if (outfitSettings?.skipBackground) {
        return false;
      }
      return outfitDetails.backgroundAssetId !== undefined;
    },
    [],
  );

  const setOutfitApiCalls = useCallback(
    async (assetList: AccoutrementAsset[], data: OutfitDetails | OutfitDetailsV3) => {
      const resultArray: AvatarResponseBase[] = [];
      setAvatarCallLimiterItemCardsDisabled(true);
      if (shouldBodyColorsBeUpdatedForOutfit(data)) {
        // Handle both v1 (bodyColors) and v3 (bodyColor3s) formats
        const bodyColorsToSet = "bodyColor3s" in data ? data.bodyColor3s : data.bodyColors;
        try {
          const setBodyColorsResult = await AvatarAPIService.setBodyColors(bodyColorsToSet);
          resultArray.push(setBodyColorsResult);
        } catch (err) {
          resultArray.push({ error: err, success: false });
        }
      } else {
        resultArray.push({ success: true });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (shouldBodyScaleBeUpdatedForOutfit(data)) {
        try {
          const setBodyScaleResult = await AvatarAPIService.setScales(data.scale);
          resultArray.push(setBodyScaleResult);
        } catch (err) {
          resultArray.push({ error: err, success: false });
        }
      } else {
        resultArray.push({ success: true });
      }

      if (shouldAvatarTypeBeUpdatedForOutfit(data)) {
        try {
          const newAvatarType = await AvatarAPIService.setAvatarType(
            data.playerAvatarType as AvatarType,
          );
          resultArray.push(newAvatarType);
        } catch (err) {
          resultArray.push({ error: err, success: false });
        }
      } else {
        resultArray.push({ success: true });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const assetWearingResult = await setWearingAssets(assetList);
      resultArray.push(assetWearingResult);

      if (shouldBackgroundBeUpdatedForOutfit(data)) {
        // `backgroundAssetId` is guaranteed defined here; `0` clears the background.
        const backgroundAssetId = data.backgroundAssetId!;
        try {
          const setBackgroundResult = await AvatarAPIService.equipBackground(backgroundAssetId);
          setEquippedBackgroundId(backgroundAssetId || undefined);
          resultArray.push(setBackgroundResult);
        } catch (err) {
          resultArray.push({ error: err, success: false });
        }
      }

      return resultArray;
    },
    [
      setAvatarCallLimiterItemCardsDisabled,
      setWearingAssets,
      setEquippedBackgroundId,
      shouldAvatarTypeBeUpdatedForOutfit,
      shouldBodyScaleBeUpdatedForOutfit,
      shouldBackgroundBeUpdatedForOutfit,
    ],
  );

  const wearOutfitUsingIds = useCallback(
    (outfit: CatalogOutfitItem) => {
      sendOutfitClickEvent(outfit.id, outfit.outfitType);
      AvatarAPIService.getOutfitDetailsV3(outfit.id).then(
        response => {
          const data = response;

          let assetList: AccoutrementAsset[] = [];
          const outfitAssetTypes: Record<number, number> = {};

          const outfitSettings = OUTFIT_SETTINGS[outfit.outfitType];

          if (outfit.outfitType === "Makeup") {
            // For Makeup looks, always start with current assets and only remove makeup-related assets
            assetList = currentlyWornAssetsList.slice();
          } else if (!data.isEditable && !isOutfitFullyQualified(data)) {
            assetList = currentlyWornAssetsList.slice();
          }

          if (outfitSettings?.assetTypesToUnequip) {
            assetList = AvatarAccoutrementService.removeAssetTypesFromAvatar(
              outfitSettings.assetTypesToUnequip,
              assetList,
            );
          }

          data.assets.forEach(element => {
            const outfitAssetTypeCount = outfitAssetTypes[element.assetType.id];
            if (!outfitAssetTypeCount) {
              outfitAssetTypes[element.assetType.id] = 1;
            } else {
              outfitAssetTypes[element.assetType.id] = outfitAssetTypeCount + 1;
            }
            // For Makeup looks, don't replace - we already removed makeup assets above
            // so just add the new ones
            const shouldReplaceAssetType =
              outfit.outfitType === "Makeup" ? false : outfitAssetTypes[element.assetType.id] === 1;
            assetList = AvatarAccoutrementService.addAssetToAvatar(
              element as AccoutrementAsset,
              assetList,
              shouldReplaceAssetType,
              true,
            );
            assetList = AvatarAccoutrementService.buildMetaForAssets(assetList, true);
          });

          if (outfit.outfitType === "DynamicHead") {
            assetList = assetList.map(asset => {
              if (asset.assetType.id === 79) {
                return {
                  ...asset,
                  meta: {
                    ...asset.meta,
                    staticFacialAnimation: false,
                  },
                };
              }
              return asset;
            });
          }

          setOutfitApiCalls(assetList, data).then(
            result => {
              let resultSuccess = true;
              let invalidAssetCount = 0;
              result.forEach(callResult => {
                if (!callResult) {
                  return;
                }
                // The wear step reports assets it could not apply. This lives under
                // `invalidAssetIds` (v2) or `invalidAssets` / `validation.invalidAssets`
                // (consolidated PATCH /v4/avatar); getInvalidAssetIds handles both so a
                // partial "missing items" outcome isn't misreported as WearOutfitError.
                invalidAssetCount += getInvalidAssetIds(callResult).length;
                resultSuccess = resultSuccess && !!callResult.success;
              });

              if (result[2]!.success) {
                setAvatarType(data.playerAvatarType as AvatarType);
              }
              sendOutfitWearEvent(outfit.id, resultSuccess);
              if (resultSuccess) {
                systemFeedback.success(OUTFIT_COSTUME_MESSAGES.successfulWear);
              } else if (invalidAssetCount > 0) {
                const count = invalidAssetCount.toString();
                const message = translate("Message.MissingItemsFromOutfit", { number: count });
                systemFeedback.error(message);
              } else {
                reportAXError({
                  itemName: "WearOutfitError",
                  counterName: "AvatarEditorError",
                  log: JSON.stringify({ message: "Unknown Error" }),
                });
                systemFeedback.error(OUTFIT_COSTUME_MESSAGES.errorWearingOutfit);
              }
            },
            e => {
              reportAXError({
                itemName: "WearOutfitError",
                counterName: "AvatarEditorError",
                log: parseError(e),
              });
              systemFeedback.error(OUTFIT_COSTUME_MESSAGES.errorWearingOutfit);
            },
          );
        },
        e => {
          reportAXError({
            itemName: "WearOutfitError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });
          systemFeedback.error(OUTFIT_COSTUME_MESSAGES.errorWearingOutfit);
        },
      );
    },
    [currentlyWornAssetsList, setAvatarType, setOutfitApiCalls, systemFeedback, translate],
  );

  const removeAssets = useCallback(
    (assetsToRemove: AccoutrementAsset[]) => {
      let filteredAssets = currentlyWornAssetsList;
      assetsToRemove.forEach(assetToRemove => {
        filteredAssets = AvatarAccoutrementService.removeAssetFromAvatar(
          assetToRemove,
          filteredAssets,
        );
        layeredClothingSlots.splice(layeredClothingSlots.indexOf(assetToRemove as any), 1);
      });

      const filteredAssetsWithMeta = AvatarAccoutrementService.buildMetaForAssets(
        filteredAssets,
        false,
        layeredClothingSlots as unknown as AccoutrementAsset[],
      );

      return setWearingAssets(filteredAssetsWithMeta);
    },
    [currentlyWornAssetsList, layeredClothingSlots, setWearingAssets],
  );

  const onItemClicked = useCallback(
    (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();

      if (isCatalogItemAsset(item)) {
        const accoutrementAsset = item as unknown as AccoutrementAsset;
        const emoteAssetType = avatarTypeService.getAssetTypeByName("Emote Animation");

        if (
          item.assetType !== null &&
          emoteAssetType !== null &&
          item.assetType.id === emoteAssetType.id
        ) {
          openEmotesModal(item);
          return;
        }

        if (item.assetType.name === "Package") {
          trackAvatarEdit(AvatarEditorTrackingEvents.Equip, buildItemTrackingMetaData(item));
          wearPackageAsset(item);
          return;
        }

        if (AvatarAccoutrementService.isProfileBackground(item.assetType.id)) {
          // Backgrounds aren't part of the avatar definition; equip/clear them through the
          // dedicated UpdateAvatar background config rather than the worn-assets list. Selection
          // is derived from the equipped background id, so toggle off when it already matches.
          if (item.id === equippedBackgroundId) {
            // Backgrounds don't go through wearAsset/removeAsset, so emit the edit event here
            // (mirroring the asset path) to keep them in the edit funnel analytics.
            trackAvatarEdit(AvatarEditorTrackingEvents.Unequip, buildItemTrackingMetaData(item));
            equipBackground(0);
          } else {
            trackAvatarEdit(AvatarEditorTrackingEvents.Equip, buildItemTrackingMetaData(item));
            equipBackground(item.id);
            // Backgrounds only render in the 2D thumbnail; force 2D so the newly
            // equipped background is actually visible in the preview.
            switchToTwoDee?.();
          }
          return;
        }

        if (!item.selected) {
          if (
            item.assetType.id &&
            AvatarAccoutrementService.isLayeredClothing(item.assetType.id) &&
            layeredClothingItemCount > AvatarAccoutrementService.maxNumberOfLayeredClothingItems
          ) {
            setIsItemLimitedExceededDialogOpen(true);
          } else if (
            avatarType === "R6" &&
            AvatarAccoutrementService.isLayeredClothing(item.assetType.id, true)
          ) {
            setBodyTypeWarningAssetToWear(accoutrementAsset);
          } else {
            item.selected = true;
            trackAvatarEdit(AvatarEditorTrackingEvents.Equip, buildItemTrackingMetaData(item));
            wearAsset(accoutrementAsset, useExtendedAccessorySlots);
          }
        } else {
          if (
            catalogMetaData?.isDynamicHeadsEnabled &&
            AvatarAccoutrementService.getAssetTypeById(item.assetType.id).blockUnequip
          ) {
            return;
          }
          item.selected = false;
          trackAvatarEdit(AvatarEditorTrackingEvents.Unequip, buildItemTrackingMetaData(item));
          removeAsset(accoutrementAsset);
        }
      }

      if (isCatalogItemOutfit(item)) {
        if (!item.selected) {
          trackAvatarEdit(AvatarEditorTrackingEvents.Equip, buildItemTrackingMetaData(item));
          wearOutfitUsingIds(item);
        } else {
          item.selected = false;
          trackAvatarEdit(AvatarEditorTrackingEvents.Unequip, buildItemTrackingMetaData(item));
          removeAssets(item.assets as AccoutrementAsset[]);
        }
      }
    },
    [
      avatarType,
      avatarTypeService,
      buildItemTrackingMetaData,
      catalogMetaData?.isDynamicHeadsEnabled,
      layeredClothingItemCount,
      removeAsset,
      removeAssets,
      useExtendedAccessorySlots,
      wearAsset,
      wearOutfitUsingIds,
      wearPackageAsset,
      openEmotesModal,
      equipBackground,
      equippedBackgroundId,
      switchToTwoDee,
    ],
  );

  const checkOutfitEquipped = useCallback(
    (item: CatalogItem) => {
      let contained = true;
      if (!isCatalogItemAsset(item)) {
        const outfitSettings = OUTFIT_SETTINGS[item.outfitType];
        if (item.assets && outfitSettings?.showSelectedOutfit) {
          item.assets.forEach(asset => {
            contained = contained && currentlyWornAssetsLookup[asset.id]!;
          });
          return contained;
        }
      } else if (AvatarAccoutrementService.isProfileBackground(item.assetType.id)) {
        // Backgrounds aren't tracked in the worn-assets list; selection comes from the
        // equipped background id returned by the V4 read path.
        return item.id === equippedBackgroundId;
      }

      return currentlyWornAssetsLookup[item.id]!;
    },
    [currentlyWornAssetsLookup, equippedBackgroundId],
  );

  const isItemSelected = useCallback(
    (item: CatalogItem): boolean => {
      return checkOutfitEquipped(item);
    },
    [checkOutfitEquipped],
  );

  return {
    onItemClicked,
    isItemSelected,
    emoteToEquip,
    openEmotesModal,
    closeEmotesModal,
    isEquipEmotesModalOpen,
    isItemLimitedExceededDialogOpen,
    setIsItemLimitedExceededDialogOpen,
    bodyTypeWarningAssetToWear,
    setBodyTypeWarningAssetToWear,
    currentOutfitSupportsHeadShapes,
  };
};

export default useOutfitHelpers;

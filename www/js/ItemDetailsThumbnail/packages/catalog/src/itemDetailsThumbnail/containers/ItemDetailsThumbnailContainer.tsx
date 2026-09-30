import React, { useState, useCallback, useRef, useEffect } from "react";
import { localStorageService } from "core-roblox-utilities";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { AxiosResponse } from "core-utilities";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import { ItemCardUtils, ItemCardRestrictions, ItemStatus } from "react-style-guide";
import {
  AvatarAccoutrementService,
  AccoutrementAsset,
  ItemDetailsHydrationService,
  TItemDetailRequestEntry,
  TDetailEntry,
} from "@rbx/legacy-webapp-types/Roblox";
import translationConfig from "../translation.config";
import ItemDetailsThumbnailView from "../components/ItemDetailsThumbnailView";
import ThumbnailUI from "../components/ThumbnailUI";
import ItemDetailsThumbnailService, {
  TAssetDetailsResult,
  TAssetDetailsEntry,
  TBundleDetailsEntry,
  TBundleItem,
  TAvatarResultV2,
  TAvatarRenderAsset,
  TAvatarRules,
  TColor,
} from "../services/itemDetailsThumbnailService";
import {
  mode3DLocalStorage,
  profileBackgroundAssetTypeId,
  makeupAssetTypes,
  makeupTopOrder,
} from "../constants/itemDetailsThumbnailConstants";
import eventStreamConstants, { eventType } from "../constants/eventStreamConstants";
import {
  experimentationService,
  TLCSortExperiementValues,
} from "../services/experimentationService";
import experimentationConstants from "../constants/experimentConstants";

type TItemDetailsThumbnailContainerProps = {
  targetId: number;
  isBundle: boolean;
  isAnimationBundle: boolean;
  showMode3D: boolean;
  showTryOn: boolean;
};

export const ItemDetailsThumbnailContainer = ({
  targetId,
  isBundle,
  isAnimationBundle,
  showMode3D,
  showTryOn,
  translate,
}: TItemDetailsThumbnailContainerProps & WithTranslationsProps): JSX.Element | null => {
  const [detailsLoaded, setDetailsLoaded] = useState<boolean>(false);
  const [typeId, setTypeId] = useState<number | undefined>(undefined);
  const [mode3DEnabled, setMode3DEnabled] = useState<boolean>(
    showMode3D && !!localStorageService.getLocalStorage(mode3DLocalStorage),
  );
  const [modePlayEnabled, setModePlayEnabled] = useState<boolean>(false);
  const modePlayEnabledRef = useRef<boolean>(modePlayEnabled);
  const [tryOnEnabled, setTryOnEnabled] = useState<boolean>(false);
  const [isAnimation, setIsAnimation] = useState<boolean>(false);
  const [isUserOutfit, setIsUserOutfit] = useState<boolean>(false);
  const [parsedTargetId, setParsedTargetId] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<TAssetDetailsEntry>();
  const [bundleAssets, setBundleAssets] = useState<Array<TAssetDetailsEntry>>();
  const [itemRestrictions, setitemRestrictions] = useState<ItemCardRestrictions>();
  const [itemStatuses, setitemStatuses] = useState<Array<ItemStatus>>();
  const [avatar, setAvatar] = useState<TAvatarResultV2>();
  const [avatarAssets, setAvatarAssets] = useState<Array<AccoutrementAsset>>();
  const [avatarTryOnAssets, setAvatarTryOnAssets] = useState<Array<TAvatarRenderAsset>>();
  const [avatarTryOnLoaded, setAvatarTryOnLoaded] = useState<boolean>(false);
  const [avatarTryOnErrored, setAvatarTryOnErrored] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [bundleAnimationPlayed, setBundleAnimationPlayed] = useState<boolean>(false);
  const [bundleAnimations, setBundleAnimations] = useState<Array<TAssetDetailsEntry>>();
  const [bundleAnimationPosition, setBundleAnimationPosition] = useState<number>(0);
  const [tryOnForItem, setTryOnForItem] = useState<boolean>(showTryOn);
  const bundleAnimationPositionRef = useRef<number>(bundleAnimationPosition);

  const [lcSortEnabled, setLcSortEnabled] = useState<boolean>(false);

  const bundleIdRegex = /\/bundles\/([0-9]+)/;

  const getAvatar = useCallback(async () => {
    return ItemDetailsThumbnailService.getAvatar();
  }, []);

  const getAvatarRules = useCallback(async () => {
    return ItemDetailsThumbnailService.getAvatarRules();
  }, []);

  const getAssetDetails = useCallback(async () => {
    return ItemDetailsHydrationService.getItemDetails(
      [{ id: targetId, itemType: "asset" }],
      undefined,
      true,
    );
  }, [targetId]);

  const getAssetDetailsArray = useCallback(async (targetIds: Array<number>) => {
    const items = new Array<TItemDetailRequestEntry>();
    targetIds.map(item =>
      items.push({
        itemType: "asset",
        id: item,
      }),
    );
    return ItemDetailsHydrationService.getItemDetails(items);
  }, []);

  const getBundleDetails = useCallback(async () => {
    return ItemDetailsThumbnailService.getBundleDetails(targetId);
  }, [targetId]);

  const getLCSortExperiment = useCallback(() => {
    experimentationService
      .getABTestEnrollment(
        experimentationConstants.defaultProjectId,
        experimentationConstants.layerNames.avatarExperience,
        experimentationConstants.parameterNames.layeredClothingSort,
      )
      .then((response: AxiosResponse<TLCSortExperiementValues>) => {
        setLcSortEnabled(response.data.lcSortEnabled);
      })
      .catch(() => {
        console.warn("Could not get lcSort experiment values");
      });
  }, []);

  const stopBundleAnimationTimer = () => {
    clearTimeout(timeoutRef.current);
  };

  const startBundleAnimationTimer = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      const match = bundleIdRegex.exec(window.location.pathname);
      if (!match || (match[1] !== undefined && match[1] !== targetId.toString())) {
        stopBundleAnimationTimer();
        return;
      }
      if (modePlayEnabledRef.current) {
        if (bundleAnimations !== undefined) {
          const nextPositionIndex =
            (bundleAnimationPositionRef.current + 1) % bundleAnimations.length;
          setBundleAnimationPosition(nextPositionIndex);
          setCurrentItem(bundleAnimations[nextPositionIndex]);
          setParsedTargetId(bundleAnimations[nextPositionIndex]!.id);
          bundleAnimationPositionRef.current = nextPositionIndex;
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        startBundleAnimationTimer();
      }
    }, 2000);
  }, [bundleAnimations]);

  const onModeButtonClick = (currentlyEnabledMode: boolean) => {
    setMode3DEnabled(!currentlyEnabledMode);
    localStorageService.setLocalStorage(mode3DLocalStorage, !currentlyEnabledMode);
  };
  const onTryOnButtonClick = (currentlyEnabledMode: boolean) => {
    setTryOnEnabled(!currentlyEnabledMode);
    if (!currentlyEnabledMode && typeId) {
      const tryOnParams = eventStreamConstants.tryOn({
        wearAssetId: targetId,
        wearAssetTypeId: typeId,
        avatarChangeType: eventType.tryOn,
      });
      sendEvent(...tryOnParams);
    }
  };
  const onPlayButtonClick = (currentlyEnabledMode: boolean) => {
    if (!currentlyEnabledMode) {
      setModePlayEnabled(true);
      modePlayEnabledRef.current = true;
      startBundleAnimationTimer();
    } else {
      setModePlayEnabled(false);
      modePlayEnabledRef.current = false;
      if (timeoutRef.current) {
        stopBundleAnimationTimer();
      }
    }
  };
  const onBundleAnimationClick = (buttonPosition: number) => {
    stopBundleAnimationTimer();
    if (bundleAnimations !== undefined) {
      setBundleAnimationPosition(buttonPosition);
      setCurrentItem(bundleAnimations[buttonPosition]);
      setParsedTargetId(bundleAnimations[buttonPosition]!.id);
      setModePlayEnabled(false);
      modePlayEnabledRef.current = false;
      bundleAnimationPositionRef.current = buttonPosition;
    }
  };

  const getItemDetailsForThumbnail = useCallback(() => {
    if (tryOnForItem) {
      getAvatar()
        .then((response: AxiosResponse<TAvatarResultV2>) => {
          setAvatarAssets(response.data.assets);
          setAvatar(response.data);
        })
        .catch(() => {
          console.warn("Could not load Avatar Details");
          setAvatarTryOnErrored(true);
        });
    } else {
      setAvatarTryOnLoaded(true);
    }

    if (isBundle) {
      let hasUserOutfit = false;
      getBundleDetails()
        .then((response: AxiosResponse<Array<TBundleDetailsEntry>>) => {
          setTryOnForItem(true);
          const parsedBundleIds = new Array<number>();
          if (response.data[0]!.itemRestrictions) {
            setitemRestrictions(
              ItemCardUtils.mapItemRestrictionIcons(response.data[0]!.itemRestrictions, "bundle"),
            );
          }
          let bundleIdLoaded = false;
          response.data[0]!.items.forEach((item: TBundleItem) => {
            if (item.type === "UserOutfit" && !hasUserOutfit) {
              setParsedTargetId(item.id);
              setIsUserOutfit(true);
              hasUserOutfit = true;
              bundleIdLoaded = true;
            } else if (item.type === "Asset") {
              parsedBundleIds.push(item.id);
              if (isAnimationBundle) {
                bundleIdLoaded = true;
              }
            }
          });
          if (parsedBundleIds.length > 0 && !bundleIdLoaded) {
            setParsedTargetId(parsedBundleIds[0]!);
          }
          setIsAnimation(isAnimationBundle);
          const bundleAssetArray = new Array<TAssetDetailsEntry>();
          if ((isAnimationBundle || tryOnForItem) && parsedBundleIds.length > 0) {
            getAssetDetailsArray(parsedBundleIds)
              .then((bundleAssetsResponse: TDetailEntry[]) => {
                bundleAssetsResponse.forEach(asset => {
                  bundleAssetArray.push(asset);
                });
                setBundleAnimations(bundleAssetsResponse);
                setCurrentItem(bundleAssetsResponse[bundleAnimationPosition]);
                if (!hasUserOutfit) {
                  setParsedTargetId(bundleAssetsResponse[bundleAnimationPosition].id);
                }
                setBundleAssets(bundleAssetArray);
                setDetailsLoaded(true);
              })
              .catch(() => {
                console.warn("Could not load bundle details");
              });
          } else {
            setDetailsLoaded(true);
          }
        })
        .catch(() => {
          setDetailsLoaded(false);
        });
    } else {
      getAssetDetails()
        .then((response: TDetailEntry[]) => {
          const asset = response[0];
          setitemRestrictions(
            ItemCardUtils.mapItemRestrictionIcons(asset.itemRestrictions, asset.itemType),
          );
          setitemStatuses(ItemCardUtils.mapItemStatusIconsAndLabels(asset.itemStatus));
          setParsedTargetId(targetId);
          setTypeId(asset.assetType);
          setIsAnimation(
            AvatarAccoutrementService.isAnimation(
              AvatarAccoutrementService.getAssetTypeNameById(asset.assetType),
            ),
          );
          setDetailsLoaded(true);
          setCurrentItem(asset);
        })
        .catch(() => {
          setDetailsLoaded(false);
        });
    }
  }, [
    tryOnForItem,
    isBundle,
    getAvatar,
    getAvatarRules,
    getBundleDetails,
    isAnimationBundle,
    getAssetDetailsArray,
    getAssetDetails,
    targetId,
  ]);

  useEffect(() => {
    getItemDetailsForThumbnail();
    getLCSortExperiment();
  }, [getItemDetailsForThumbnail, getLCSortExperiment]);

  useEffect(() => {
    if (isAnimation) {
      setMode3DEnabled(true);
    }
  }, [isAnimation]);

  useEffect(() => {
    const setTryonDetails = () => {
      if (
        !(currentItem !== undefined || bundleAssets !== undefined) ||
        avatarAssets === undefined
      ) {
        return;
      }
      let avatarAssetList = avatarAssets;
      const processedAssetIds = new Set<number>();
      if (isBundle && bundleAssets !== undefined) {
        // Count how many assets of each type the bundle carries so we can detect when a
        // type appears multiple times and is eligible to have its wearing limit overridden.
        const bundleAssetTypeCounts: Record<number, number> = {};
        bundleAssets.forEach(asset => {
          bundleAssetTypeCounts[asset.assetType] =
            (bundleAssetTypeCounts[asset.assetType] || 0) + 1;
        });

        // A type is eligible for an override when the bundle carries more than one of it
        // and it is a rigid accessory type (accessories support stacking; body
        // parts/clothing/animations do not).
        const overrideEligibleTypes = new Set<number>();
        Object.keys(bundleAssetTypeCounts).forEach(assetTypeKey => {
          const assetTypeId = Number(assetTypeKey);
          if (
            bundleAssetTypeCounts[assetTypeId]! > 1 &&
            AvatarAccoutrementService.isAccessoryType(
              AvatarAccoutrementService.getAssetTypeNameById(assetTypeId),
            )
          ) {
            overrideEligibleTypes.add(assetTypeId);
          }
        });

        // The wearing-limit override must be applied to every addAssetToAvatar call in the
        // loop. Each call re-filters the whole accumulated list, so a single later call
        // with the limit enforced would drop the extra accessories we already added.
        const allowMoreThanMaxPerAsset = overrideEligibleTypes.size > 0;

        // Tracks override-eligible types we've already unequipped the user's assets for, so
        // a second bundle asset of that type doesn't clear the sibling we just added.
        const clearedOverrideTypes = new Set<number>();

        bundleAssets.forEach(asset => {
          if (processedAssetIds.has(asset.id)) {
            return;
          }
          processedAssetIds.add(asset.id);

          // Skip asset types the client avatar rules don't recognize yet (new
          // asset types) — placing them would dereference an undefined assetType.
          if (AvatarAccoutrementService.getAssetTypeById(asset.assetType) === undefined) {
            return;
          }

          const assetTypesToUnequip = AvatarAccoutrementService.getAssetTypeById(
            asset.assetType,
          )?.assetTypesToUnequip;
          if (assetTypesToUnequip) {
            avatarAssetList = AvatarAccoutrementService.removeAssetTypesFromAvatar(
              assetTypesToUnequip,
              avatarAssetList,
            );
          }

          // For override-eligible types, unequip the user's current assets of the type only
          // on the first occurrence; keep clearing (replacing) for every other type.
          const isOverrideType = overrideEligibleTypes.has(asset.assetType);
          const clearAssetsOfSameType =
            !isOverrideType || !clearedOverrideTypes.has(asset.assetType);
          if (isOverrideType) {
            clearedOverrideTypes.add(asset.assetType);
          }

          avatarAssetList = AvatarAccoutrementService.addAssetToAvatar(
            ItemDetailsThumbnailService.convertAssetDetailsToAsset(asset),
            avatarAssetList,
            clearAssetsOfSameType,
            allowMoreThanMaxPerAsset,
          );
        });
      } else if (currentItem !== undefined) {
        // A newly introduced asset type may not yet be known to the client avatar
        // rules (getAssetTypeById returns undefined). We can't place it on the
        // avatar, so fall back to the item thumbnail instead of crashing.
        if (AvatarAccoutrementService.getAssetTypeById(currentItem.assetType) === undefined) {
          setAvatarTryOnErrored(true);
          return;
        }

        const assetTypesToUnequip = AvatarAccoutrementService.getAssetTypeById(
          currentItem.assetType,
        )?.assetTypesToUnequip;
        if (assetTypesToUnequip) {
          avatarAssetList = AvatarAccoutrementService.removeAssetTypesFromAvatar(
            assetTypesToUnequip,
            avatarAssetList,
          );
        }

        const isMakeupAsset =
          currentItem.assetType === makeupAssetTypes.faceMakeup ||
          currentItem.assetType === makeupAssetTypes.lipMakeup ||
          currentItem.assetType === makeupAssetTypes.eyeMakeup;

        if (lcSortEnabled) {
          const currentItemWithMeta = AvatarAccoutrementService.buildMetaForAsset(
            ItemDetailsThumbnailService.convertAssetDetailsToAsset(currentItem),
            avatarAssetList,
            true,
          );
          if (isMakeupAsset) {
            currentItemWithMeta.meta = { ...currentItemWithMeta.meta, order: makeupTopOrder };
          }
          avatarAssetList = AvatarAccoutrementService.insertAssetMetaIntoAssetList(
            currentItemWithMeta,
            AvatarAccoutrementService.addAssetToAvatar(
              currentItemWithMeta,
              avatarAssetList,
              true,
              false,
            ),
          );
        } else {
          const convertedAsset =
            ItemDetailsThumbnailService.convertAssetDetailsToAsset(currentItem);
          if (isMakeupAsset) {
            convertedAsset.meta = { ...convertedAsset.meta, order: makeupTopOrder };
          }
          avatarAssetList = AvatarAccoutrementService.addAssetToAvatar(
            convertedAsset,
            avatarAssetList,
            true,
            false,
          );
        }
      }
      const avatarRenderAssetList = new Array<TAvatarRenderAsset>();
      const renderAssetIds = new Set<number>();
      avatarAssetList.forEach((asset: AccoutrementAsset) => {
        if (renderAssetIds.has(asset.id)) {
          return;
        }
        renderAssetIds.add(asset.id);
        avatarRenderAssetList.push(
          ItemDetailsThumbnailService.convertAssetToAvatarRenderAsset(asset),
        );
      });
      setAvatarTryOnAssets(avatarRenderAssetList);
      setAvatarTryOnLoaded(true);
    };

    if (
      isBundle &&
      isAnimation &&
      bundleAnimationPlayed === false &&
      bundleAnimations !== undefined
    ) {
      setModePlayEnabled(true);
      modePlayEnabledRef.current = true;
      startBundleAnimationTimer();
      setBundleAnimationPlayed(true);
    }

    const shouldBuildTryOn =
      tryOnForItem &&
      avatarAssets !== undefined &&
      ((!isBundle && currentItem !== undefined) || (isBundle && bundleAssets)) &&
      avatarTryOnAssets === undefined &&
      !avatarTryOnErrored;
    if (shouldBuildTryOn) {
      setTryonDetails();
    }
  }, [
    avatarAssets,
    avatarTryOnAssets,
    avatarTryOnErrored,
    bundleAnimationPlayed,
    bundleAnimations,
    bundleAssets,
    currentItem,
    getItemDetailsForThumbnail,
    isAnimation,
    isBundle,
    tryOnForItem,
    startBundleAnimationTimer,
    lcSortEnabled,
  ]);

  if (detailsLoaded === false || (avatarTryOnLoaded === false && avatarTryOnErrored === false)) {
    return (
      <div className="item-details-thumbnail-container">
        <div className="thumbnail-loading shimmer" />
      </div>
    );
  }

  // Profile backgrounds are not rendered on a 3D avatar, so the 3D thumbnail
  // view is never offered for them. This uses a local id constant rather than
  // AvatarAccoutrementService.isProfileBackground because that helper may not
  // exist in the deployed avatar-rules bundle yet, and calling a missing
  // function would crash the whole thumbnail.
  const isProfileBackground = currentItem?.assetType === profileBackgroundAssetTypeId;
  const is3DDisabledForAssetType = isProfileBackground;

  // Pass backgroundId to the render endpoint when trying on a background
  const backgroundId = isProfileBackground ? currentItem?.id : undefined;

  return (
    <div className="item-details-thumbnail-container">
      <div className="thumbnail-holder" key={tryOnEnabled ? "tryon" : "item"}>
        <ItemDetailsThumbnailView
          targetId={targetId}
          altTargetId={parsedTargetId}
          isBundle={isBundle}
          isLook={false}
          isAnimation={isAnimation}
          isUserOutfit={isUserOutfit}
          mode3DEnabled={(mode3DEnabled || (isBundle && isAnimation)) && !is3DDisabledForAssetType}
          tryOnEnabled={tryOnEnabled && !avatarTryOnErrored}
          avatar={avatar}
          avatarTryOnAssets={avatarTryOnAssets}
          tryOnKey={targetId}
          backgroundId={backgroundId}
        />
      </div>
      <ThumbnailUI
        onModeButtonClick={onModeButtonClick}
        onPlayButtonClick={onPlayButtonClick}
        onTryOnButtonClick={onTryOnButtonClick}
        onBundleAnimationClick={onBundleAnimationClick}
        isBundle={isBundle}
        isAnimation={isAnimation}
        showMode3D={showMode3D && !is3DDisabledForAssetType}
        mode3DEnabled={mode3DEnabled}
        modePlayEnabled={modePlayEnabled}
        showTryOn={showTryOn && tryOnForItem && !isAnimation}
        tryOnEnabled={tryOnEnabled && !avatarTryOnErrored}
        avatarDetailsLoaded={avatarAssets !== undefined && avatar !== undefined}
        itemRestrictions={itemRestrictions}
        itemStatuses={itemStatuses}
        bundleAnimations={bundleAnimations}
        currentItem={currentItem}
        translate={translate}
      />
    </div>
  );
};
export default withTranslations(ItemDetailsThumbnailContainer, translationConfig);

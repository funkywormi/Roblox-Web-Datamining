import React, { useEffect, useRef, useState, useCallback } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { mapItemRestrictionIcons } from "@rbx/www-common/components/itemCard";
import { reportAXError } from "../../../utils/axAnalyticsService";
import AvatarAccoutrementService from "../../../utils/avatarAccoutrementService";
import AvatarRecommendations, {
  RecommendationsData,
} from "../../../recommendations/AvatarRecommendations";
import { recommendationTypes } from "../../../constants/recommendationsConstants";
import AvatarAPIService from "../../../services/avatarAPIService";
import {
  UpdateOutfitDialog,
  DeleteOutfitDialog,
  RenameOutfitDialog,
  CreateOutfitDialog,
  ExpiredItemsDialog,
} from "../../dialogs";
import AvatarItems from "./avatarItems/AvatarItems";
import { useOutfitsMenu } from "../../../hooks";
import { useAvatarTabsContext } from "../../../contexts/AvatarTabsContext";
import { useAvatarPageContext } from "../../../contexts/AvatarPageContext";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import { useCurrentlyWearingAssetsStoreContext } from "../../../contexts/CurrentlyWearingAssetsStoreContext";
import {
  CatalogItem,
  CatalogOutfitItem,
  CatalogItemWithSelection,
  CatalogAssetItem,
  isCatalogItemAsset,
  Asset,
} from "../../../avatar.types";
import getItemThumbnailAndLink from "../../../utils/assetManager.helpers";
import parseError from "../../../utils/parseErrorUtil";

/**
 * Unified Avatar Items Content Component
 *
 * This component consolidates the functionality of RecentItemsContainer, OutfitsController,
 * and AssetsList into a single configurable component using the unified avatar-inventory API.
 * It automatically fetches data based on the current tab/subcategory's avatarInventoryRequest
 * configuration and provides a flexible interface to control all unique behaviors.
 *
 * Features:
 * - Unified avatar-inventory API for all data fetching
 * - Automatic data source detection from tab/subcategory configuration
 * - Configurable outfit management (create, update, delete, rename)
 * - Emotes modal integration
 * - Advanced accessories link
 * - Recommendations system
 * - Pagination with continuous loading
 * - Conditional action buttons
 * - Tab visibility control
 *
 * Data Source:
 * Uses avatarInventoryRequest from selectedSubcategory or selectedTab to determine:
 * - sortOption: How to sort items (e.g., 'recentAdded', 'recentEquipped', numerical values)
 * - itemCategories: Specific item types to fetch (e.g., [{ itemType: 'Asset', itemSubType: 8 }])
 * - category: Category-based filtering (e.g., 'accessory', 'clothing', 'bodyPart')
 * - subTypeBlacklist: Asset subtypes to exclude
 *
 * @example
 * // Recent items configuration
 * const recentConfig = {
 *   isActive: selectedTab?.name === 'Recent',
 *   tabId: 'recent',
 *   features: { outfitManagement: false, pagination: false }
 * };
 *
 * // Assets configuration with emotes and advanced features
 * const assetsConfig = {
 *   isActive: selectedTab?.tabType === 'Assets',
 *   tabId: 'clothing',
 *   features: { emotesModal: true, advancedAccessories: true, pagination: true },
 *   actionButtons: {
 *     equipEmotes: { show: selectedSubcategory?.name === 'Emote', onClick: openEmotesModal },
 *     advancedAccessories: { show: true, onClick: openAdvancedAccessories }
 *   }
 * };
 *
 * // Outfits configuration with full management
 * const outfitsConfig = {
 *   isActive: selectedTab?.name === 'Outfits',
 *   tabId: 'costumes',
 *   features: { outfitManagement: true, createOutfitButton: true, pagination: true },
 *   actionButtons: {
 *     createOutfit: { show: true, label: 'Create New Outfit', outfitType: 'Outfit' }
 *   }
 * };
 */
export type AvatarItemsContentConfig = {
  // Tab visibility configuration
  isActive: boolean;
  tabId: string;
  tabClassName?: string;
  // Feature toggles
  features: {
    outfitManagement?: boolean;
    createOutfitButton?: boolean;
    emotesModal?: boolean;
    advancedAccessories?: boolean;
    recommendations?: boolean;
    pagination?: boolean;
    continuousLoad?: boolean;
  };
  // Button configurations
  actionButtons?: {
    createOutfit?: {
      show: boolean;
      label: string;
      outfitType: "Outfit" | "Costume";
    };
    equipEmotes?: {
      show: boolean;
      onClick: () => void;
    };
    advancedAccessories?: {
      show: boolean;
      onClick: () => void;
    };
    advancedEditorToggle?: {
      show: boolean;
      isEnabled: boolean;
      onToggle: () => void;
    };
  };
  // Data source configuration - simplified to use avatar-inventory API
  dataSource?: {
    emptyMessage?: string;
  };
};

export type AvatarItemsContentProps = {
  config: AvatarItemsContentConfig;
  onItemClicked: (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => void;
  isItemSelected: (item: CatalogItem) => boolean;
};

function AvatarItemsContent({
  config,
  onItemClicked,
  isItemSelected,
}: AvatarItemsContentProps): JSX.Element {
  const { translate } = useTranslation();
  const { selectedTab, selectedSubcategory, selectedCategoryRow, showAdvancedAccessoriesLink } =
    useAvatarTabsContext();

  // Helper functions
  const getItemKey = useCallback((item: CatalogItem) => `${item.type}-${item.id}`, []);
  const getMinNewItemsThreshold = useCallback(
    (totalItems: number) => Math.min(5, Math.floor(totalItems * 0.2)),
    [],
  );
  const { enableContinuousLoad, pageLoaded } = useAvatarPageContext();
  const systemFeedback = useSystemFeedback();
  const { currentlyWornAssetsLookup } = useCurrentlyWearingAssetsStoreContext();

  // Avatar inventory state
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [canLoadNextPage, setCanLoadNextPage] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsData>();
  const [categories] = useState<Record<string, number[]>>(
    AvatarAccoutrementService.getCategories(),
  );
  // Persistent deduplication dictionary - tracks all items we've seen across all API calls
  // Using useRef for synchronous updates to avoid React state async issues
  const seenItemsDictRef = useRef<Set<string>>(new Set());

  // Auto-pagination safety counter to prevent infinite loops
  const [autoPaginationCount, setAutoPaginationCount] = useState(0);
  const MAX_AUTO_PAGINATION = 3;

  // Request sequence tracking to detect race conditions
  const requestSequenceRef = useRef(0);

  // Outfit management hooks
  const {
    activeItem,
    onItemMenuButtonClicked,
    openOutfitMenu,
    closeOutfitMenu,
    outfitToUpdate,
    closeUpdateOutfitDialog,
    outfitToDelete,
    closeDeleteOutfitDialog,
    outfitToRename,
    closeRenameOutfitDialog,
    createOutfitIsOpen,
    setCreateOutfitIsOpen,
  } = useOutfitsMenu();

  // Expired items dialog state
  const [expiredItemsDialogOpen, setExpiredItemsDialogOpen] = useState(false);
  const [selectedExpiredItem, setSelectedExpiredItem] = useState<CatalogOutfitItem | null>(null);
  const [selectedExpiredAsset, setSelectedExpiredAsset] = useState<Asset | null>(null);

  const handleExpiredAssetsClick = useCallback((item: CatalogOutfitItem) => {
    setSelectedExpiredItem(item);
    setSelectedExpiredAsset(null);
    setExpiredItemsDialogOpen(true);
  }, []);

  // Wrap onItemClicked to intercept expired asset clicks
  const handleItemClicked = useCallback(
    (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => {
      // Check if this is an expired asset by checking expirationTime
      const isExpired =
        isCatalogItemAsset(item) &&
        item.expirationTime &&
        new Date(item.expirationTime).getTime() < Date.now();

      if (isExpired) {
        event.preventDefault();
        // Convert CatalogAssetItem to Asset for the dialog
        const expiredAsset: Asset = {
          id: item.id,
          name: item.name,
          assetType: item.assetType,
          currentVersionId: 0,
        };
        setSelectedExpiredAsset(expiredAsset);
        setSelectedExpiredItem(null);
        setExpiredItemsDialogOpen(true);
        return;
      }
      // Otherwise, use the original handler
      onItemClicked(item, event);
    },
    [onItemClicked],
  );

  // Get avatar inventory request parameters from current tab/subcategory/categoryRow
  const getInventoryRequest = useCallback(() => {
    const subcategory = selectedSubcategory;
    const categoryRow = selectedCategoryRow;
    const tab = selectedTab;

    // Priority order: subcategory > categoryRow > tab
    const inventoryRequest =
      subcategory?.avatarInventoryRequest ||
      categoryRow?.avatarInventoryRequest ||
      tab?.avatarInventoryRequest;

    if (!inventoryRequest) {
      return null;
    }

    return inventoryRequest;
  }, [selectedTab, selectedSubcategory, selectedCategoryRow]);

  // Update outfit list item functions (for outfit management)
  const updateOutfitInDataList = useCallback(
    (updatedOutfit: CatalogOutfitItem) => {
      setItems(prevItems => {
        const index = prevItems.findIndex(item => item.id === updatedOutfit.id);
        if (index === -1) {
          return prevItems;
        }
        const newItems = [...prevItems];
        const updatedOutfitWithSelection: CatalogItemWithSelection = {
          ...updatedOutfit,
          type: "Outfit",
          itemType: "Bundle",
          selected: isItemSelected(updatedOutfit),
        };
        newItems[index] = updatedOutfitWithSelection;
        return newItems;
      });
    },
    [isItemSelected],
  );

  const updateOutfitNameInDataList = useCallback((outfitId: number, newName: string) => {
    setItems(prevItems => {
      const index = prevItems.findIndex(item => item.id === outfitId);
      if (index === -1) {
        return prevItems;
      }
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index]!,
        name: newName,
      };
      return newItems;
    });
  }, []);

  const deleteOutfitFromDataList = useCallback((outfitId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== outfitId));
  }, []);

  // Create ref for loadAvatarInventory to avoid infinite loops
  const loadAvatarInventoryRef = useRef<((isLoadMore?: boolean) => void) | null>(null);

  // Load avatar inventory items
  const loadAvatarInventory = useCallback(
    (isLoadMore = false) => {
      const inventoryRequest = getInventoryRequest();

      if (!inventoryRequest || !config.isActive || loading) {
        return;
      }

      let { itemCategories } = inventoryRequest;
      const { subTypeBlacklist, category, sortOption, availabilityStatus } = inventoryRequest;

      // Convert category to itemCategories if needed
      if (!itemCategories && category) {
        itemCategories = categories[category]
          ?.filter(type => !subTypeBlacklist?.includes(type))
          .map(type => ({
            itemType: "Asset",
            itemSubType: type,
          }));
      }

      if (!isLoadMore) {
        setItems([]);
        setPageToken(undefined);
        // Reset deduplication dictionary immediately to ensure it's clear before API call
        seenItemsDictRef.current = new Set(); // Synchronous reset
        setAutoPaginationCount(0);
      }
      setLoading(true);

      // Track this request to detect race conditions
      requestSequenceRef.current += 1;
      const currentRequestId = requestSequenceRef.current;

      AvatarAPIService.getAvatarInventory(
        sortOption,
        itemCategories,
        isLoadMore ? pageToken : undefined,
        availabilityStatus,
      ).then(
        response => {
          // Check for race condition - ignore stale responses
          if (currentRequestId !== requestSequenceRef.current) {
            setLoading(false); // Important: Clear loading state even for stale requests
            return;
          }

          const result = response;
          const newAssets: CatalogItem[] = [];
          const assetIds: { assetId: number }[] = [];
          const assetPositions: Record<number, number> = {};

          // Process each inventory item
          for (let i = 0; i < result.avatarInventoryItems.length; i++) {
            const returnedItem = result.avatarInventoryItems[i]!;
            const itemIndex = isLoadMore ? items.length + i : i;

            if (returnedItem.itemCategory.itemType === 1) {
              // Asset item
              const assetItem: Omit<CatalogAssetItem, "thumbnail" | "thumbnailType" | "link"> = {
                assetType: { id: returnedItem.itemCategory.itemSubType },
                itemType: "Asset",
                count: itemIndex,
                id: returnedItem.itemId,
                name: returnedItem.itemName,
                type: "Asset",
                expirationTime: returnedItem.expirationTime,
                availabilityStatus: returnedItem.availabilityStatus,
              };
              const catalogItem = {
                ...assetItem,
                ...getItemThumbnailAndLink<CatalogAssetItem>(assetItem),
              } as CatalogAssetItem;

              newAssets.push(catalogItem);
              assetIds.push({ assetId: catalogItem.id });
              assetPositions[catalogItem.id] = itemIndex;
            } else {
              // Outfit item
              const linkedEntityId = returnedItem.outfitDetail?.linkedEntityId ?? undefined;
              const linkedEntityType = returnedItem.outfitDetail?.linkedEntityType ?? undefined;
              const outfitItem: Omit<
                CatalogOutfitItem,
                "thumbnail" | "thumbnailType" | "link" | "outfitType" | "assets"
              > = {
                itemType: "Bundle",
                count: itemIndex,
                id: returnedItem.itemId,
                isEditable: true, // Default, will be updated from outfit details
                name: returnedItem.itemName,
                type: "Outfit",
                selected: false,
                linkedEntityId,
                linkedEntityType,
                availabilityStatus: returnedItem.availabilityStatus,
              };
              const catalogItem = {
                ...outfitItem,
                ...getItemThumbnailAndLink<CatalogOutfitItem>(outfitItem),
              } as CatalogOutfitItem;

              newAssets.push(catalogItem);
            }
          }

          // Comprehensive deduplication logic - MOVED BEFORE any setItems calls
          // This ensures ALL items go through deduplication
          let finalAssets = newAssets;
          // Always enable deduplication (removed the ENABLE_DEDUPLICATION constant)
          {
            // Filter out duplicates using the persistent dictionary AND within this batch
            const batchSeenKeys = new Set<string>();
            const deduplicatedAssets = newAssets.filter(newItem => {
              const itemKey = getItemKey(newItem);
              // Check against persistent dictionary (across all previous API calls)
              if (seenItemsDictRef.current.has(itemKey)) {
                return false;
              }

              // Check against current batch (within this single API response)
              if (batchSeenKeys.has(itemKey)) {
                return false;
              }

              // Add to batch tracker for subsequent items in this batch
              batchSeenKeys.add(itemKey);
              return true;
            });

            // Update the persistent dictionary with new unique items
            if (deduplicatedAssets.length > 0) {
              deduplicatedAssets.forEach(item => {
                seenItemsDictRef.current.add(getItemKey(item));
              });
            }

            finalAssets = deduplicatedAssets;

            if (isLoadMore) {
              // Reset auto-pagination counter if we got enough new items (user-triggered pagination worked)
              const minThreshold = getMinNewItemsThreshold(newAssets.length);
              if (deduplicatedAssets.length >= minThreshold) {
                setAutoPaginationCount(0);
              }

              // Auto-continue pagination if we got very few new items due to deduplication
              if (
                deduplicatedAssets.length < minThreshold &&
                result.nextPageToken &&
                autoPaginationCount < MAX_AUTO_PAGINATION
              ) {
                setAutoPaginationCount(prev => prev + 1);
                // Defer the next load to avoid stack overflow
                setTimeout(() => {
                  loadAvatarInventoryRef.current?.(true);
                }, 100);
              }
            }
          }

          // Update items list and build correct position mapping
          let finalAssetPositions: Record<number, number> = {};
          let finalOutfitPositions: Record<number, number> = {};
          let fullItemsList: CatalogItem[] = [];

          setItems(prevItems => {
            fullItemsList = isLoadMore ? [...prevItems, ...finalAssets] : finalAssets;

            // Build position mapping for the COMPLETE list (existing + new items)
            finalAssetPositions = {};
            finalOutfitPositions = {};
            fullItemsList.forEach((item, index) => {
              if (item.type === "Asset") {
                finalAssetPositions[item.id] = index;
              } else if (item.type === "Outfit") {
                finalOutfitPositions[item.id] = index;
              }
            });

            return fullItemsList;
          });

          // Update pagination
          setPageToken(result.nextPageToken || undefined);
          setCanLoadNextPage(!!result.nextPageToken);

          // Set recommendations data
          if (!isLoadMore && finalAssets.length > 0) {
            const firstItem = finalAssets[0]!;
            // A configured bundleRecommendationType (on the subcategory or its category
            // row, e.g. shoes -> bundleTypeId 3) takes precedence and always drives a
            // bundle recommendation, even when the content itself is assets.
            const configuredBundleType =
              selectedSubcategory?.bundleRecommendationType ??
              selectedCategoryRow?.bundleRecommendationType;
            if (configuredBundleType != null) {
              setRecommendationsData({
                recommendationType: recommendationTypes.bundle,
                recommendationSubtype: configuredBundleType,
                hideRecommendations: !!result.nextPageToken,
              });
            } else if (isCatalogItemAsset(firstItem)) {
              // Asset recommendations
              const recData = {
                recommendationType: recommendationTypes.asset,
                recommendationSubtype: firstItem.assetType.id,
                hideRecommendations: !!result.nextPageToken, // Hide if there are more pages
              };
              setRecommendationsData(recData);
            } else if (firstItem.type === "Outfit") {
              // Outfit recommendations - default bundle type when none configured
              const recData = {
                recommendationType: recommendationTypes.bundle,
                recommendationSubtype: 1,
                hideRecommendations: !!result.nextPageToken, // Hide if there are more pages
              };
              setRecommendationsData(recData);
            }
          }

          // Update recommendations visibility based on pagination state
          if (result.nextPageToken) {
            // Has more pages - hide recommendations
            setRecommendationsData(prev => (prev ? { ...prev, hideRecommendations: true } : prev));
          } else {
            // No more pages - show recommendations
            setRecommendationsData(prev => (prev ? { ...prev, hideRecommendations: false } : prev));
          }

          // Process asset details for NEW assets only (only for items that survived deduplication in this batch)
          const finalAssetIds = finalAssets
            .filter(item => item.type === "Asset")
            .map(item => ({ assetId: item.id }));

          if (finalAssetIds.length > 0) {
            AvatarAPIService.postItemDetails(finalAssetIds, "Asset")
              .then(detailResponse => {
                // Batch all asset updates into a single state update
                setItems(prevItems => {
                  const newItems = [...prevItems];

                  detailResponse.data.forEach(inventoryItem => {
                    const itemRestrictions = mapItemRestrictionIcons(
                      inventoryItem.itemRestrictions,
                      "Asset",
                    );

                    const partialAsset = {
                      type: "Asset" as const,
                      name: inventoryItem.name,
                      id: inventoryItem.id,
                    };

                    const thumbnailAndLink = getItemThumbnailAndLink(partialAsset);
                    const position = finalAssetPositions[inventoryItem.id];
                    const existingItem = position !== undefined ? newItems[position] : undefined;

                    const assetTypeInfo = AvatarAccoutrementService.getAssetTypeById(
                      inventoryItem.assetType,
                    );
                    const updatedAsset: CatalogAssetItem = {
                      ...partialAsset,
                      thumbnail: thumbnailAndLink.thumbnail,
                      thumbnailType: "Asset" as const,
                      link: thumbnailAndLink.link || "",
                      itemType: "Asset" as const,
                      itemRestrictions,
                      assetType: {
                        id: inventoryItem.assetType,
                        name: assetTypeInfo?.name ?? "",
                      },
                      // Pass the asset type so selection logic that keys off it (e.g. profile
                      // backgrounds, which aren't in the worn-assets lookup) resolves correctly.
                      selected: isItemSelected({
                        id: inventoryItem.id,
                        type: "Asset",
                        assetType: {
                          id: inventoryItem.assetType,
                          name: assetTypeInfo?.name ?? "",
                        },
                      } as CatalogItem),
                      expirationTime: existingItem?.expirationTime,
                      // Carry the inventory-level availabilityStatus through the
                      // post-itemDetails update; catalog/itemDetails responses
                      // don't return it, but it drives the disabled tile.
                      availabilityStatus: existingItem?.availabilityStatus,
                    };

                    if (position !== undefined && newItems[position]) {
                      newItems[position] = updatedAsset;
                    }
                  });

                  return newItems;
                });
              })
              .catch(e => {
                reportAXError({
                  itemName: "PostItemDetailsError",
                  counterName: "AvatarEditorError",
                  log: parseError(e),
                });
              });
          }

          // Process outfit details for NEW outfits only (only for items that survived deduplication in this batch)
          const finalOutfits = finalAssets.filter(item => item.type === "Outfit");

          // Process each outfit individually but use position mapping for updates
          finalOutfits.forEach(catalogItem => {
            AvatarAPIService.getOutfitDetailsV3(catalogItem.id)
              .then(detailResponse => {
                const details = detailResponse;
                const supportsHeadShapes = details.assets.some(
                  asset => asset.supportsHeadShapes === true,
                );
                const expiredAssets = details.assets.filter(
                  asset => asset.availabilityStatus === "Expired",
                );
                const updatedItem = {
                  ...catalogItem,
                  expiredAssets,
                  assets: details.assets,
                  outfitType: details.outfitType,
                  isEditable: details.isEditable,
                  supportsHeadShapes,
                  backgroundAssetId: details.backgroundAssetId,
                  selected: false, // Default to false, will be recalculated below with assets
                };
                // Recalculate selection after assets are set so checkOutfitEquipped works correctly
                updatedItem.selected = isItemSelected(updatedItem);

                let itemRestrictions: string[] = [];
                if (
                  !details.isEditable &&
                  AvatarAccoutrementService.isDynamicHeadInAssetList(
                    details.assets as AccoutrementAsset[],
                  )
                ) {
                  itemRestrictions = ["Live"];
                }

                updatedItem.itemRestrictions = mapItemRestrictionIcons(itemRestrictions, "Outfit");

                setItems(prevItems => {
                  const newItems = [...prevItems];
                  const position = finalOutfitPositions[catalogItem.id];
                  if (position !== undefined && newItems[position]) {
                    newItems[position] = updatedItem;
                  }
                  return newItems;
                });
              })
              .catch(e => {
                reportAXError({
                  itemName: "GetOutfitDetailsError",
                  counterName: "AvatarEditorError",
                  log: parseError(e),
                });
              });
          });

          setLoading(false);
        },
        e => {
          reportAXError({
            itemName: "LoadAvatarInventoryError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });

          const defaultEmptyMessage =
            config.dataSource?.emptyMessage || translate("Message.FailedLoadAssets");
          systemFeedback.error(defaultEmptyMessage);
          setLoading(false);
        },
      );
    },
    [
      getInventoryRequest,
      config.isActive,
      config.dataSource?.emptyMessage,
      loading,
      pageToken,
      items,
      categories,
      isItemSelected,
      systemFeedback,
      translate,
      selectedSubcategory?.bundleRecommendationType,
      selectedCategoryRow?.bundleRecommendationType,
      autoPaginationCount,
      config.tabId,
    ],
  );

  // Load data when tab/subcategory changes
  useEffect(() => {
    if (pageLoaded && config.isActive) {
      loadAvatarInventoryRef.current?.(false);
    }
  }, [pageLoaded, config.isActive, selectedTab, selectedSubcategory, selectedCategoryRow]);

  // Update selection states when worn assets change
  useEffect(() => {
    setItems(prevItems => {
      return prevItems.map(item => ({
        ...item,
        selected: isItemSelected(item),
      }));
    });
  }, [currentlyWornAssetsLookup, isItemSelected]);

  // Update ref with latest function
  loadAvatarInventoryRef.current = loadAvatarInventory;

  // Continuous loading setup
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config.features.continuousLoad || !enableContinuousLoad || !canLoadNextPage) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry!.isIntersecting && !loading) {
          loadAvatarInventoryRef.current?.(true);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [config.features.continuousLoad, enableContinuousLoad, canLoadNextPage, loading]);

  return (
    <div
      className={classNames("tab-pane", config.tabClassName, {
        active: config.isActive,
      })}
      id={config.tabId}
    >
      {/* Action Buttons */}
      <div>
        {config.actionButtons?.createOutfit?.show && (
          <button
            type="button"
            className="btn-secondary-xs btn-float-right"
            onClick={() => {
              setCreateOutfitIsOpen(true);
            }}
          >
            {translate(config.actionButtons.createOutfit.label)}
          </button>
        )}

        {config.actionButtons?.equipEmotes?.show && (
          <button
            type="button"
            className="equip-emotes-button btn-secondary-xs btn-float-right"
            onClick={config.actionButtons.equipEmotes.onClick}
          >
            {translate("Heading.EquipEmotes")}
          </button>
        )}
      </div>

      {/* Outfit Management Dialogs */}
      {config.features.outfitManagement && (
        <React.Fragment>
          <UpdateOutfitDialog
            outfit={outfitToUpdate}
            handleClose={closeUpdateOutfitDialog}
            updateOutfitInDataList={updateOutfitInDataList}
          />
          <DeleteOutfitDialog
            outfit={outfitToDelete}
            closeDialog={closeDeleteOutfitDialog}
            deleteOutfitFromDataList={deleteOutfitFromDataList}
          />
          <RenameOutfitDialog
            outfit={outfitToRename}
            closeDialog={closeRenameOutfitDialog}
            updateOutfitNameInDataList={updateOutfitNameInDataList}
          />
          <CreateOutfitDialog
            closeDialog={() => {
              setCreateOutfitIsOpen(false);
            }}
            open={createOutfitIsOpen}
            refreshOutfits={() => loadAvatarInventoryRef.current?.(false)}
          />
        </React.Fragment>
      )}

      {/* Main Items Container */}
      <div id="avatar-items-container">
        <AvatarItems
          items={items}
          loading={loading}
          canLoadNextPage={canLoadNextPage}
          getNextPage={
            config.features.pagination ? () => loadAvatarInventoryRef.current?.(true) : undefined
          }
          emptyMessage={
            config.dataSource?.emptyMessage ||
            (selectedSubcategory?.emptyMessage && translate(selectedSubcategory.emptyMessage)) ||
            translate("Message.EmptyListForItem", {
              itemType: translate(
                selectedSubcategory?.fullLabel ||
                  selectedSubcategory?.label ||
                  selectedCategoryRow?.title ||
                  selectedTab?.label ||
                  "Label.Items",
              ),
            })
          }
          onItemClicked={handleItemClicked}
          activeItem={config.features.outfitManagement ? activeItem : undefined}
          onItemMenuButtonClicked={
            config.features.outfitManagement ? onItemMenuButtonClicked : undefined
          }
          openOutfitMenu={config.features.outfitManagement ? openOutfitMenu : undefined}
          closeOutfitMenu={config.features.outfitManagement ? closeOutfitMenu : undefined}
          onExpiredAssetsClick={handleExpiredAssetsClick}
        />

        {/* Continuous Load Trigger */}
        {config.features.continuousLoad && enableContinuousLoad && canLoadNextPage && (
          <div ref={loadMoreRef} style={{ height: "20px" }} />
        )}
      </div>

      {/* Advanced Accessories Link */}
      {config.actionButtons?.advancedAccessories?.show && showAdvancedAccessoriesLink && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            type="button"
            className="text-link advanced-link"
            onClick={config.actionButtons.advancedAccessories.onClick}
            style={{
              background: "none",
              border: "none",
              width: "auto",
              textAlign: "initial",
            }}
          >
            {translate("Action.Advanced")}
          </button>
        </div>
      )}

      {/* Recommendations */}
      {config.features.recommendations &&
        recommendationsData &&
        !recommendationsData.hideRecommendations && (
          <div style={{ marginTop: 8 }}>
            <AvatarRecommendations
              recommendationType={recommendationsData.recommendationType}
              recommendationSubtype={recommendationsData.recommendationSubtype}
              pageName="Avatar"
              showSeeAllButton
            />
          </div>
        )}

      {/* Expired Items Dialog */}
      <ExpiredItemsDialog
        isOpen={expiredItemsDialogOpen}
        closeDialog={() => {
          setExpiredItemsDialogOpen(false);
          setSelectedExpiredItem(null);
          setSelectedExpiredAsset(null);
        }}
        expiredAssets={
          selectedExpiredAsset ? [selectedExpiredAsset] : selectedExpiredItem?.expiredAssets || []
        }
        systemFeedbackService={systemFeedback}
      />
    </div>
  );
}

export default AvatarItemsContent;

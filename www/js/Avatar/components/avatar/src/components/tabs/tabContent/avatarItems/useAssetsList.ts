import { useCallback, useEffect, useState } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { mapItemRestrictionIcons } from "@rbx/www-common/components/itemCard";
import { reportAXError } from "../../../../utils/axAnalyticsService";
import AvatarAccoutrementService from "../../../../utils/avatarAccoutrementService";
import avatarConstants from "../../../../constants/avatarConstants";
import { recommendationTypes } from "../../../../constants/recommendationsConstants";
import { TGenericItemDetails, TAssetItemDetails } from "../../../../constants/types";
import { RecommendationsData } from "../../../../recommendations/AvatarRecommendations";
import AvatarAPIService from "../../../../services/avatarAPIService";
import useAvatarAssetsPager, { Asset } from "./useAvatarAssetsPager";
import { CatalogItem, CatalogItemWithSelection, CatalogAssetItem } from "../../../../avatar.types";
import getItemThumbnailAndLink from "../../../../utils/assetManager.helpers";
import { useSystemFeedback } from "../../../../contexts/SystemFeedbackContext";
import { useAvatarTabsContext } from "../../../../contexts/AvatarTabsContext";
import parseError from "../../../../utils/parseErrorUtil";

export type AvatarListParams = {
  isItemSelected: (item: CatalogItem) => boolean;
  translate: TranslateFunction;
};

function useAssetsList({ isItemSelected, translate }: AvatarListParams) {
  const { selectedTab, selectedSubcategory, selectedCategoryRow } = useAvatarTabsContext();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [emptyMessage, setEmptyMessage] = useState<string>("");

  const [recommendationsData, setRecommendationsData] = useState<RecommendationsData>();

  const isActiveTab = useCallback(() => {
    return selectedTab?.tabType === "Assets";
  }, [selectedTab]);

  const updateEmptyMessage = useCallback(() => {
    if (selectedSubcategory === null && selectedCategoryRow) {
      setEmptyMessage(
        translate("Message.EmptyListForItem", { itemType: translate(selectedCategoryRow.title) }),
      );
      return;
    }
    if (!selectedSubcategory) {
      return;
    }
    const type = selectedSubcategory.fullLabel || selectedSubcategory.label;
    setEmptyMessage(translate("Message.EmptyListForItem", { itemType: translate(type) }));
  }, [selectedSubcategory, selectedCategoryRow, translate]);

  const onLoadSuccess = useCallback(
    (fetchedItems: Asset[], hasNextPage: boolean, assetSubTypeForRecommendations: number) => {
      const assets: CatalogItemWithSelection[] = [];

      setRecommendationsData(prev => ({
        ...prev,
        recommendationType: recommendationTypes.asset,
        recommendationSubtype: assetSubTypeForRecommendations,
      }));

      if (fetchedItems.length > 0) {
        setEmptyMessage("");
      }

      AvatarAPIService.postItemDetails(fetchedItems, "Asset")
        .then(response => {
          setLoading(false);

          response.data.forEach((inventoryItem: TGenericItemDetails) => {
            const assetInventoryitem = inventoryItem as TAssetItemDetails;
            const itemRestrictions = mapItemRestrictionIcons(
              inventoryItem.itemRestrictions,
              "Asset",
            );

            const partialItem: Pick<CatalogAssetItem, "type" | "name" | "id"> = {
              type: "Asset",
              name: inventoryItem.name,
              id: inventoryItem.id,
            };

            const catalogItem: CatalogAssetItem = {
              ...partialItem,
              ...getItemThumbnailAndLink(partialItem),
              itemType: "Asset",
              itemRestrictions,
              assetType: {
                id: assetInventoryitem.assetType,
                name: AvatarAccoutrementService.getAssetTypeById(assetInventoryitem.assetType).name,
              },
            };

            const catalogItemWithSelection: CatalogItemWithSelection = {
              ...catalogItem,
              selected: isItemSelected(catalogItem),
            };

            assets.push(catalogItemWithSelection);
          });

          setItems(prevItems => [...prevItems, ...assets]);

          if (!hasNextPage) {
            setRecommendationsData(prev => {
              if (prev) {
                return {
                  ...prev,
                  hideRecommendations: false,
                };
              }
              return prev;
            });
          } else {
            setRecommendationsData(prev => {
              if (prev) {
                return {
                  ...prev,
                  hideRecommendations: true,
                };
              }
              return prev;
            });
          }

          updateEmptyMessage();
        })
        .catch(e => {
          console.error(e);
          const itemName = `PostItemDetailsError`;
          // Report the error
          // We need to specify container name as counters name so we can build the graphs on grafana
          reportAXError({
            itemName,
            counterName: "AssetsListError",
            log: parseError(e),
          });
        });
    },
    [isItemSelected, updateEmptyMessage],
  );

  const systemFeedback = useSystemFeedback();

  const loadError = useCallback(
    error => {
      reportAXError({
        itemName: "AssetPagerLoadError",
        counterName: "AvatarEditorError",
        log: parseError(error),
      });

      systemFeedback.error(avatarConstants.assets.couldNotLoadList);
    },
    [systemFeedback],
  );

  const assetPager = useAvatarAssetsPager({ onLoadSuccess, onLoadError: loadError });

  useEffect(() => {
    if (!isActiveTab()) {
      return;
    }

    setItems([]);
    setLoading(true);
    if (selectedSubcategory?.assetType) {
      const assetType = AvatarAccoutrementService.getAssetTypeByName(selectedSubcategory.assetType);
      if (assetType) {
        const newRequestedAssetTypes: number[] = [];
        let categoryAssets = "";
        if (selectedSubcategory.groupedAssetTypes) {
          selectedSubcategory.groupedAssetTypes.forEach(asset => {
            if (categoryAssets.length > 0) {
              categoryAssets += ",";
            }
            categoryAssets += AvatarAccoutrementService.getAssetTypeByName(asset).type;
            newRequestedAssetTypes.push(AvatarAccoutrementService.getAssetTypeByName(asset).id);
          });
        } else {
          categoryAssets = AvatarAccoutrementService.getAssetTypeById(assetType.id).type;

          newRequestedAssetTypes[0] = assetType.id;
        }

        updateEmptyMessage();

        assetPager.loadFirstPage(categoryAssets, assetType.id);
      }
    } else if (selectedCategoryRow) {
      let categoryAssets = "";
      const newRequestedAssetTypes: number[] = [];

      const addAssetType = (assetType: string) => {
        if (categoryAssets.length > 0) {
          categoryAssets += ",";
        }
        categoryAssets += AvatarAccoutrementService.getAssetTypeByName(assetType).type;
        newRequestedAssetTypes.push(AvatarAccoutrementService.getAssetTypeByName(assetType).id);
      };

      selectedCategoryRow?.subCategoryMenu.forEach(subcategory => {
        if (subcategory.groupedAssetTypes) {
          subcategory.groupedAssetTypes.forEach(addAssetType);
        } else if (subcategory.assetType) {
          addAssetType(subcategory.assetType);
        }
      });

      updateEmptyMessage();
      assetPager.loadFirstPage(categoryAssets, newRequestedAssetTypes[0]!);
    }
    // TODO: old, migrated code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryRow, selectedSubcategory]);

  const canLoadNextPage = useCallback(() => {
    if (selectedTab?.tabType !== "Assets") {
      return false;
    }

    if (!assetPager.canLoadNextPage()) {
      return false;
    }

    if (loading) {
      return false;
    }

    return true;
  }, [assetPager, loading, selectedTab?.tabType]);

  const getNextPage = () => {
    if (!canLoadNextPage()) return;
    setLoading(true);
    assetPager.fetchNextPage();
  };

  useEffect(() => {
    setItems(prevItems => {
      return prevItems.map(item => {
        return {
          ...item,
          selected: isItemSelected(item),
        };
      });
    });
  }, [isItemSelected]);

  return {
    items,
    loading: loading || assetPager.isLoading,
    canLoadNextPage,
    getNextPage,
    emptyMessage,
    recommendationsData,
  };
}

export default useAssetsList;

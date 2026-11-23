import { useEffect, useRef, useState } from "react";
import { window } from "@rbx/core-lib/browser";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import assetsConstants from "../constants/assetsConstants";
import inventoryConstants from "../constants/inventoryConstants";
import type { AssetItem, Category, CurrentData, PageResponse } from "../constants/types";
import AssetsExplorer from "../components/AssetsExplorer";
import useCursorPager, { isPagerNoOp } from "../hooks/useCursorPager";
import useDefaultCategory from "../hooks/useDefaultCategory";
import useHashRoute from "../hooks/useHashRoute";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import {
  getAssetToCategoryMappings,
  getAssetToSubcategoryMappings,
  getCatalogMetadata,
  type AssetToCategoryMappings,
  type CatalogMetadata,
} from "../services/assetsService";
import { createInventoryExperiments } from "../services/inventoryExperiments";
import {
  getBadges,
  getBundles,
  getBundlesWithBundleType,
  getCategories,
  getCreatorStoreAssets,
  getGamePasses,
  getInventoryItemsV2,
  getPlaces,
  getPrivateServers,
  getUser,
  type InventoryPagingParameters,
} from "../services/inventoryService";
import { buildCatalogUrl } from "../utils/catalogUrl";
import { resolveSelection } from "../utils/resolveSelection";
import type { HashRoute } from "../utils/hashRoute";
import { sendUserItemsPage } from "../utils/sendUserItemsPage";
import shuffle from "../utils/shuffle";
import { getUserIdFromUrl, isOwnPage } from "../utils/userInfo";
import PrivateServerStatusFilters, {
  type PrivateServerStatusFilter,
} from "./PrivateServerStatusFilters";

const PAGE_TYPE = "inventory";
export const RECOMMENDATIONS_RENDER_EVENT = "recommendations:render";
export const RECOMMENDATIONS_CONTAINER_ID = "item-recommendations-container";

type LoadedData = {
  displayName: string | undefined;
  assetToCategoryMappings: AssetToCategoryMappings;
  assetToSubcategoryMappings: AssetToCategoryMappings;
  categories: Category[];
  catalogMetadata: CatalogMetadata;
};

type InventoryItemsContext = {
  catalogMetadata: CatalogMetadata | undefined;
  category: Category | null;
  setRecommendationsType: (recommendationsType: number) => void;
};

export const getInventoryItems = (
  pagingParameters: InventoryPagingParameters,
  { catalogMetadata, category, setRecommendationsType }: InventoryItemsContext,
): Promise<PageResponse> => {
  if (pagingParameters.type === "Bundle") {
    if (catalogMetadata?.isDynamicHeadsEnabled) {
      setRecommendationsType(inventoryConstants.recommendationTypes.bundle);
      return getBundlesWithBundleType(pagingParameters);
    }
    return getBundles(pagingParameters);
  }
  setRecommendationsType(inventoryConstants.recommendationTypes.asset);

  if (category?.categoryType === assetsConstants.types.privateServers) {
    return getPrivateServers(pagingParameters);
  }

  if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.place) {
    return getPlaces(pagingParameters);
  }

  if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.badge) {
    // badges asset type
    return getBadges(pagingParameters);
  }

  if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.gamePass) {
    // game pass asset type
    return getGamePasses(pagingParameters);
  }
  if (assetsConstants.creatorStoreAssetTypeIds.includes(pagingParameters.assetTypeId)) {
    return getCreatorStoreAssets(pagingParameters);
  }
  return getInventoryItemsV2(pagingParameters);
};

export const isRecommendationAvailable = (recommendationsType: number, assetTypeId: number) =>
  recommendationsType >= 0 &&
  assetTypeId > 0 &&
  assetTypeId !== assetsConstants.assetTypeIds.bundle;

const getUserDisplayName = (userId: number | null) =>
  getUser(userId)
    .then(result => result.displayName)
    .catch(() => undefined);

const getCategoriesWithFallback = (userId: number | null) =>
  getCategories(userId)
    .then(result => result.categories)
    .catch(
      () =>
        // Fallback to hard-coded list if we fail to fetch categories
        assetsConstants.inventoryCategories,
    );

type InventoryPageProps = {
  canViewInventory: string | undefined;
};

const InventoryPage = ({ canViewInventory }: InventoryPageProps) => {
  const translate = useItemsTranslate();
  const [userId] = useState(getUserIdFromUrl);
  const [isOwnInventory] = useState(() => isOwnPage(userId));
  const [experiments] = useState(createInventoryExperiments);
  const [urls] = useState(() => ({
    absoluteLibraryUrl: getAbsoluteUrl("/develop/library"),
    absoluteCatalogUrl: getAbsoluteUrl("/catalog"),
  }));
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [showPrivateServerStatusFilters, setShowPrivateServerStatusFilters] = useState(false);
  const currentDataRef = useRef<CurrentData>({
    category: null,
    subcategory: null,
    assetTypeUrl: urls.absoluteCatalogUrl,
    AssetTypeId: 0,
    itemSection: undefined,
    templateVisible: true,
    inventoryUpdatesEnabled: false,
  });
  const [currentData, setCurrentDataState] = useState(currentDataRef.current);
  const recommendationsTypeRef = useRef(inventoryConstants.recommendationTypes.asset);
  const privateServerStatusRef = useRef<string | undefined>(undefined);
  const catalogMetadataRef = useRef<CatalogMetadata | undefined>(undefined);
  const defaultCategory = useDefaultCategory();
  const route = useHashRoute(defaultCategory);

  const updateCurrentData = (patch: Partial<CurrentData>) => {
    currentDataRef.current = { ...currentDataRef.current, ...patch };
    setCurrentDataState(currentDataRef.current);
  };

  // The recommendations island is a separate React root and only hears about subtype changes here.
  const dispatchRecommendationsRender = () => {
    window?.dispatchEvent(
      new CustomEvent(RECOMMENDATIONS_RENDER_EVENT, {
        detail: {
          recommendationType: recommendationsTypeRef.current,
          recommendationSubtype: currentDataRef.current.AssetTypeId,
          pageName: "Inventory",
          available: isRecommendationAvailable(
            recommendationsTypeRef.current,
            currentDataRef.current.AssetTypeId,
          ),
        },
      }),
    );
  };

  const pageLoaded = (items: AssetItem[]) => {
    // Only shuffle when viewing another user's inventory. The owner sees their
    // own inventory in its original order.
    setAssets(isOwnInventory ? items : shuffle(items));
    updateCurrentData({ templateVisible: true, itemsLoading: false, loadFailed: false });
    dispatchRecommendationsRender();
  };

  const pageLoadError = (e: unknown) => {
    if (isPagerNoOp(e)) {
      // User switched to another tab. Do nothing.
      return;
    }
    setAssets([]);
    updateCurrentData({ templateVisible: true, itemsLoading: false, loadFailed: true });
    dispatchRecommendationsRender();
    // This page does nothing with errors right now.
    console.error(e);
  };

  const { setPagingParametersAndLoadFirstPage, assetsPager } = useCursorPager<
    Omit<InventoryPagingParameters, "count">
  >(
    pagingParameters =>
      getInventoryItems(pagingParameters, {
        catalogMetadata: catalogMetadataRef.current,
        category: currentDataRef.current.category,
        setRecommendationsType: recommendationsType => {
          recommendationsTypeRef.current = recommendationsType;
        },
      }),
    pageLoaded,
    pageLoadError,
  );

  const loadFirstPage = () => {
    const { subcategory, inventoryUpdatesEnabled } = currentDataRef.current;
    if (!subcategory) {
      return;
    }
    setPagingParametersAndLoadFirstPage({
      cursor: "",
      userId,
      placeTab: subcategory.filter,
      assetTypeId: subcategory.id,
      sortOrder: "Desc",
      type: subcategory.type,
      inventoryUpdatesEnabled,
      privateServerStatus: privateServerStatusRef.current,
    })
      .then(pageLoaded)
      .catch(pageLoadError);
  };

  useEffect(() => {
    Promise.all([
      getUserDisplayName(userId),
      getAssetToCategoryMappings().catch(() => ({})),
      getAssetToSubcategoryMappings().catch(() => ({})),
      getCategoriesWithFallback(userId),
      getCatalogMetadata().catch(() => ({})),
      experiments.getInventoryUpdatesEnabled().catch(() => false),
    ])
      .then(
        ([
          displayName,
          assetToCategoryMappings,
          assetToSubcategoryMappings,
          categories,
          catalogMetadata,
          inventoryUpdatesEnabled,
        ]) => {
          catalogMetadataRef.current = catalogMetadata;
          updateCurrentData({ inventoryUpdatesEnabled });
          setLoadedData({
            displayName,
            assetToCategoryMappings,
            assetToSubcategoryMappings,
            categories,
            catalogMetadata,
          });
        },
      )
      .catch(() => undefined);
  }, [experiments, userId]);

  const updateForStateChange = (data: LoadedData | null, selectedRoute: HashRoute | null) => {
    updateCurrentData({ templateVisible: false });

    if (!data || !selectedRoute) {
      return;
    }
    const selection = resolveSelection(data.categories, selectedRoute, defaultCategory);
    if (!selection) {
      return;
    }
    const { category, subcategory } = selection;

    const isMyPrivateServers = subcategory.filter === assetsConstants.types.myPrivateServers;
    if (isMyPrivateServers) {
      experiments.logExposure();
    }

    const showFilters =
      Boolean(currentDataRef.current.inventoryUpdatesEnabled) && isMyPrivateServers;
    setShowPrivateServerStatusFilters(showFilters);
    // While the filters stay mounted they keep their selection, so the status has to survive too.
    const filterReset = showFilters ? {} : { categoryExtra: undefined };
    if (!showFilters) {
      privateServerStatusRef.current = undefined;
    }

    sendUserItemsPage({
      pageType: PAGE_TYPE,
      eventType: "show",
      component: "page",
      categoryName: category.name,
      subcategoryName: subcategory.name,
      isOwnPage: isOwnInventory,
      logExtras: JSON.stringify({
        category_type: category.categoryType,
        subcategory_filter: subcategory.filter,
      }),
    });

    const { assetTypeUrl, itemSection } = buildCatalogUrl({
      category,
      subcategory,
      ...urls,
      assetToCategoryMappings: data.assetToCategoryMappings,
      assetToSubcategoryMappings: data.assetToSubcategoryMappings,
      includeLibraryParams: true,
    });

    updateCurrentData({
      ...filterReset,
      category,
      subcategory,
      AssetTypeId: subcategory.id,
      assetTypeUrl: assetTypeUrl ?? currentDataRef.current.assetTypeUrl,
      itemSection,
    });

    loadFirstPage();
  };
  const updateForStateChangeRef = useRef(updateForStateChange);
  updateForStateChangeRef.current = updateForStateChange;

  useEffect(() => {
    updateForStateChangeRef.current(loadedData, route);
  }, [loadedData, route]);

  const onPrivateServerStatusChange = (filter: PrivateServerStatusFilter) => {
    updateCurrentData({ categoryExtra: filter.name });
    if (filter.status === privateServerStatusRef.current) {
      return;
    }
    privateServerStatusRef.current = filter.status;
    updateCurrentData({ itemsLoading: true });
    loadFirstPage();
  };

  const nameForTitle = loadedData?.displayName ?? String(userId);

  return (
    <div className="row page-content">
      {isOwnInventory && <h1>{translate("Heading.MyInventory")}</h1>}
      {!isOwnInventory && loadedData && (
        <h1>{translate("Heading.UserInventory", { username: nameForTitle })}</h1>
      )}
      {loadedData && (
        <AssetsExplorer
          pageType={PAGE_TYPE}
          assets={assets}
          assetsPager={assetsPager}
          categories={loadedData.categories}
          currentData={currentData}
          showCreatorName
          canViewInventory={canViewInventory}
          isOwnPage={isOwnInventory}
          catalogMetadata={loadedData.catalogMetadata}
          toolbar={
            showPrivateServerStatusFilters && (
              <PrivateServerStatusFilters
                currentData={currentData}
                pageType={PAGE_TYPE}
                isOwnPage={isOwnInventory}
                onChange={onPrivateServerStatusChange}
              />
            )
          }
        />
      )}
      <div
        id={RECOMMENDATIONS_CONTAINER_ID}
        data-recommendation-type={recommendationsTypeRef.current}
        data-recommendation-subtype={currentData.AssetTypeId}
        data-recommendation-available={String(
          isRecommendationAvailable(recommendationsTypeRef.current, currentData.AssetTypeId),
        )}
        data-page-name="Inventory"
      />
    </div>
  );
};

export default InventoryPage;

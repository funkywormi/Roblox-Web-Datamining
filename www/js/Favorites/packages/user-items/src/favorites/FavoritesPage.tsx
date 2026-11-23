import { useEffect, useRef, useState } from "react";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import assetsConstants from "../constants/assetsConstants";
import type { AssetItem, Category, CurrentData, PageResponse } from "../constants/types";
import AssetsExplorer from "../components/AssetsExplorer";
import useCursorPager, { isPagerNoOp } from "../hooks/useCursorPager";
import useDefaultCategory from "../hooks/useDefaultCategory";
import useHashRoute from "../hooks/useHashRoute";
import { useItemsTranslate } from "../hooks/useItemsTranslate";
import {
  getAssetToCategoryMappings,
  getAssetToSubcategoryMappings,
  type AssetToCategoryMappings,
} from "../services/assetsService";
import {
  getCategories,
  getFavoriteAssets,
  getFavoriteBundles,
  getFavoriteCreatorAssets,
  getFavoriteGames,
  getFavoriteLooks,
  getInventoryCreatorNamePolicy,
  getUser,
  type FavoritesPagingParameters,
} from "../services/favoritesService";
import { buildCatalogUrl } from "../utils/catalogUrl";
import { resolveSelection } from "../utils/resolveSelection";
import type { HashRoute } from "../utils/hashRoute";
import { sendUserItemsPage } from "../utils/sendUserItemsPage";
import shuffle from "../utils/shuffle";
import { getUserIdFromUrl, isOwnPage } from "../utils/userInfo";

const PAGE_TYPE = "favorites";

type LoadedData = {
  displayName: string | undefined;
  categories: Category[];
  assetToCategoryMappings: AssetToCategoryMappings;
  assetToSubcategoryMappings: AssetToCategoryMappings;
};

export const getFavoritesItems = (
  pagingParameters: FavoritesPagingParameters,
): Promise<PageResponse> => {
  if (pagingParameters.subtypeId === assetsConstants.assetTypeIds.avatar) {
    return getFavoriteLooks(pagingParameters);
  }
  if (pagingParameters.itemType.toLowerCase() === assetsConstants.itemTypes.bundle) {
    return getFavoriteBundles(pagingParameters);
  }

  if (pagingParameters.subtypeId === assetsConstants.assetTypeIds.place) {
    return getFavoriteGames(pagingParameters);
  }

  if (assetsConstants.creatorStoreAssetTypeIds.includes(pagingParameters.subtypeId)) {
    return getFavoriteCreatorAssets(pagingParameters);
  }

  // Default to assets
  return getFavoriteAssets(pagingParameters);
};

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
        assetsConstants.favoriteCategories,
    );

const initialCurrentData = (absoluteCatalogUrl: string): CurrentData => ({
  category: null,
  subcategory: null,
  assetTypeUrl: absoluteCatalogUrl,
  AssetTypeId: 0,
  itemSection: undefined,
  templateVisible: true,
});

type FavoritesPageProps = {
  canViewInventory: string | undefined;
};

const FavoritesPage = ({ canViewInventory }: FavoritesPageProps) => {
  const translate = useItemsTranslate();
  const [userId] = useState(getUserIdFromUrl);
  const [isOwnFavorites] = useState(() => isOwnPage(userId));
  const [urls] = useState(() => ({
    absoluteLibraryUrl: getAbsoluteUrl("/develop/library"),
    absoluteCatalogUrl: getAbsoluteUrl("/catalog"),
  }));
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [currentData, setCurrentData] = useState<CurrentData>(() =>
    initialCurrentData(urls.absoluteCatalogUrl),
  );
  const [showCreatorName, setShowCreatorName] = useState(false);
  const defaultCategory = useDefaultCategory();
  const route = useHashRoute(defaultCategory);
  const isOwnFavoritesRef = useRef(isOwnFavorites);

  const pageLoaded = (items: AssetItem[]) => {
    // Only shuffle when viewing another user's favorites. The profile owner
    // sees their own favorites in their original order.
    setAssets(isOwnFavoritesRef.current ? items : shuffle(items));
    setCurrentData(previous => ({ ...previous, templateVisible: true, loadFailed: false }));
  };

  const pageLoadError = (e: unknown) => {
    if (isPagerNoOp(e)) {
      // User switched to another tab. Do nothing.
      return;
    }
    setAssets([]);
    setCurrentData(previous => ({ ...previous, templateVisible: true, loadFailed: true }));
    // This page does nothing with errors right now.
    console.error(e);
  };

  const { setPagingParametersAndLoadFirstPage, assetsPager } = useCursorPager<
    Omit<FavoritesPagingParameters, "count">
  >(getFavoritesItems, pageLoaded, pageLoadError);

  useEffect(() => {
    Promise.all([
      getUserDisplayName(userId),
      getCategoriesWithFallback(userId),
      getAssetToCategoryMappings().catch(() => ({})),
      getAssetToSubcategoryMappings().catch(() => ({})),
    ])
      .then(([displayName, categories, assetToCategoryMappings, assetToSubcategoryMappings]) => {
        setLoadedData({
          displayName,
          categories,
          assetToCategoryMappings,
          assetToSubcategoryMappings,
        });
      })
      .catch(() => undefined);

    getInventoryCreatorNamePolicy().then(
      response => {
        setShowCreatorName(response.displayCreatorNameInFavorites);
      },
      (error: unknown) => {
        // eslint-disable-next-line no-console
        console.debug(error);
      },
    );
  }, [userId]);

  const updateForStateChange = (data: LoadedData, selectedRoute: HashRoute) => {
    const selection = resolveSelection(data.categories, selectedRoute, defaultCategory);
    if (!selection) {
      setCurrentData(previous => ({ ...previous, templateVisible: false }));
      return;
    }
    const { category, subcategory } = selection;

    sendUserItemsPage({
      pageType: PAGE_TYPE,
      eventType: "show",
      component: "page",
      categoryName: category.name,
      subcategoryName: subcategory.name,
      isOwnPage: isOwnFavoritesRef.current,
    });

    const { assetTypeUrl, itemSection } = buildCatalogUrl({
      category,
      subcategory,
      ...urls,
      assetToCategoryMappings: data.assetToCategoryMappings,
      assetToSubcategoryMappings: data.assetToSubcategoryMappings,
      includeLibraryParams: false,
    });

    setCurrentData(previous => ({
      ...previous,
      templateVisible: false,
      category,
      subcategory,
      AssetTypeId: subcategory.id,
      assetTypeUrl: assetTypeUrl ?? previous.assetTypeUrl,
      itemSection,
    }));

    setPagingParametersAndLoadFirstPage({
      cursor: "",
      userId,
      itemType: subcategory.type,
      subtypeId: subcategory.id,
    })
      .then(pageLoaded)
      .catch(pageLoadError);
  };
  const updateForStateChangeRef = useRef(updateForStateChange);
  updateForStateChangeRef.current = updateForStateChange;

  useEffect(() => {
    if (loadedData && route) {
      updateForStateChangeRef.current(loadedData, route);
    }
  }, [loadedData, route]);

  const nameForTitle = loadedData?.displayName ?? String(userId);

  return (
    <div className="row page-content">
      {isOwnFavorites && <h1>{translate("Heading.MyFavorites")}</h1>}
      {!isOwnFavorites && loadedData && (
        <h1>{translate("Heading.UserFavorites", { username: nameForTitle })}</h1>
      )}
      {loadedData && (
        <AssetsExplorer
          pageType={PAGE_TYPE}
          assets={assets}
          assetsPager={assetsPager}
          categories={loadedData.categories}
          currentData={currentData}
          showCreatorName={showCreatorName}
          canViewInventory={canViewInventory}
          isOwnPage={isOwnFavorites}
        />
      )}
    </div>
  );
};

export default FavoritesPage;

import assetsConstants from "../constants/assetsConstants";
import type { Category, ItemSection, PageType, Subcategory } from "../constants/types";

export const getInventoryEmptyMessageKey = (isOwnPage: boolean, pageType: PageType): string => {
  if (isOwnPage) {
    if (pageType === assetsConstants.favorites) {
      return "Message.YouHaveNoFavoritesCategory";
    }
    return "Message.YouHaveNoItemsCategory";
  }
  if (pageType === assetsConstants.favorites) {
    return "Message.UserHasNoFavoritesCategory";
  }
  return "Message.UserHasNoItemsCategory";
};

export const getInventoryNewItemsMessageKey = (
  isLibraryLinkEnabled: boolean,
  itemSection: ItemSection | undefined,
): { key: string; hasLink: boolean } | null => {
  if (itemSection === assetsConstants.library) {
    return isLibraryLinkEnabled
      ? { key: "Message.TryLibraryLink", hasLink: true }
      : { key: "Message.TryLibraryForItems", hasLink: false };
  }
  if (itemSection === assetsConstants.catalog) {
    return isLibraryLinkEnabled
      ? { key: "Message.TryMarketplaceLink", hasLink: true }
      : { key: "Message.TryMarketplaceForItems", hasLink: false };
  }
  return null;
};

export const getExploreMessageKey = (itemSection: ItemSection | undefined): string =>
  itemSection === "library"
    ? "Message.ExploreLibraryForItems"
    : "Message.ExploreMarketplaceForItems";

export const showMessageToFindNewItems = (
  pageType: PageType,
  category: Category | null,
  subCategory: Subcategory | null,
): boolean => {
  const { types } = assetsConstants;
  if (
    pageType === assetsConstants.favorites ||
    subCategory?.categoryType === types.badge ||
    subCategory?.categoryType === types.gamePass ||
    category?.categoryType === types.place
  ) {
    return false;
  }
  return true;
};

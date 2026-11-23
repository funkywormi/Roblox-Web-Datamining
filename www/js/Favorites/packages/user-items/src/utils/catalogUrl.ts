import assetsConstants from "../constants/assetsConstants";
import type { Category, ItemSection, Subcategory } from "../constants/types";
import { getItemSection } from "../mappers/assetMappers";
import type { AssetToCategoryMappings } from "../services/assetsService";

type ParamValue = string | number | null | undefined;

export const serializeParams = (params: Record<string, ParamValue>): string =>
  Object.keys(params)
    .sort()
    .flatMap(key => {
      const value = params[key];
      return value === null || value === undefined || value === ""
        ? []
        : [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
    })
    .join("&");

const withQuery = (url: string, params: Record<string, ParamValue>): string => {
  const query = serializeParams(params);
  return query ? `${url}?${query}` : url;
};

export type CatalogUrlInput = {
  category: Category;
  subcategory: Subcategory;
  absoluteLibraryUrl: string;
  absoluteCatalogUrl: string;
  assetToCategoryMappings: AssetToCategoryMappings;
  assetToSubcategoryMappings: AssetToCategoryMappings;
  includeLibraryParams: boolean;
};

export const buildCatalogUrl = ({
  category,
  subcategory,
  absoluteLibraryUrl,
  absoluteCatalogUrl,
  assetToCategoryMappings,
  assetToSubcategoryMappings,
  includeLibraryParams,
}: CatalogUrlInput): { assetTypeUrl: string | undefined; itemSection: ItemSection } => {
  const itemSection = getItemSection(category);
  const assetTypeId = subcategory.id;

  if (itemSection === assetsConstants.library) {
    return {
      assetTypeUrl: includeLibraryParams
        ? withQuery(absoluteLibraryUrl, {
            Category: assetToCategoryMappings[assetTypeId],
            CatalogContext: assetsConstants.currentCatalogContext,
          })
        : absoluteLibraryUrl,
      itemSection: "library",
    };
  }

  if (itemSection === assetsConstants.catalog) {
    const bundleMapping = assetsConstants.bundleMarketplaceCategoryMapping[assetTypeId];
    const urlParams =
      subcategory.type.toLowerCase() === assetsConstants.itemTypes.bundle
        ? {
            Category: bundleMapping?.category,
            Subcategory: bundleMapping?.subcategory,
          }
        : {
            Category: assetToCategoryMappings[assetTypeId],
            Subcategory: assetToSubcategoryMappings[subcategory.id],
          };
    const taxonomy = assetsConstants.assetTypeMarketplaceTaxonomy[assetTypeId];
    if (!urlParams.Category && !urlParams.Subcategory && taxonomy) {
      return {
        assetTypeUrl: withQuery(absoluteCatalogUrl, { taxonomy }),
        itemSection: "catalog",
      };
    }
    return {
      assetTypeUrl: withQuery(absoluteCatalogUrl, urlParams),
      itemSection: "catalog",
    };
  }

  return { assetTypeUrl: undefined, itemSection: null };
};

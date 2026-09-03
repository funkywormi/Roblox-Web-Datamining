import { TAvatarInventoryItem } from "../constants/types";

export type SubCategoryMenu = {
  name: string;
  label: string;
  fullLabel?: string;
  assetType?: string;
  visible?: boolean;
  bundleRecommendationType?: number;
  groupedAssetTypes?: string[];
  avatarInventoryRequest?: AvatarInventoryRequest;
  emptyMessage?: string;
  slotConfigId?: string;
};

export type CategoryRow = {
  title: string;
  name: string;
  subCategoryMenu: SubCategoryMenu[];
  showLayeredClothingSlots?: boolean;
  visible?: boolean;
  bundleRecommendationType?: number;
  avatarInventoryRequest: AvatarInventoryRequest;
  slotConfigId?: string;
};

export type AvatarInventoryRequest = {
  sortOption: string | number;
  category?: string;
  itemCategories?: TAvatarInventoryItem[];
  subTypeBlacklist?: number[];
  availabilityStatus?: number;
};

export type Tab = {
  label: string;
  labelShort?: string;
  name: string;
  tabType?: string;
  menuType?: string;
  visible?: boolean;
  subCategoryMenu?: SubCategoryMenu[];
  categoryRows?: CategoryRow[];
  noSubCategoryMenu?: boolean;
  avatarInventoryRequest: AvatarInventoryRequest;
  slotConfigId?: string;
};

export function getTabLabel(
  tab: Tab,
  translate: (resourceId: string, parameters?: Record<string, unknown>) => string,
): string {
  const label = translate(tab.label);
  const labelShort = tab.labelShort && translate(tab.labelShort);
  if (labelShort && label.length > 12) {
    return labelShort;
  }
  return label;
}

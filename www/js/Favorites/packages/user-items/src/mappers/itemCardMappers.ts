import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import { ItemCardUtils } from "@rbx/core-ui/legacy/react-style-guide";
import assetsConstants from "../constants/assetsConstants";
import type { AssetItem, LicenseBadge } from "../constants/types";

// Matches the catalog item card: first-party gets the high-contrast badge, third-party
// Foundation Neutral. Neutral's background is a translucent shift overlay.
const licenseBadges: Record<string, LicenseBadge | undefined> = {
  FirstParty: {
    labelKey: "Label.LicensingOfficial",
    className: "bg-system-contrast content-inverse-system-contrast",
  },
  ThirdParty: {
    labelKey: "Label.LicensingLicensed",
    className: "bg-shift-300 content-emphasis",
  },
};

export type CatalogItemDetail = {
  id: number;
  name: string;
  itemType?: string;
  creatorType?: string;
  creatorTargetId?: number;
  creatorName?: string;
  price?: number;
  lowestPrice?: number;
  premiumPricing?: { premiumPriceInRobux: number };
  priceStatus?: string;
  itemRestrictions?: string[];
  license?: { licenseType?: string };
};

export const mapLicenseBadge = (
  license: { licenseType?: string } | undefined,
): LicenseBadge | undefined =>
  license?.licenseType ? licenseBadges[license.licenseType] : undefined;

export const mapItemRestrictionIcons = <T extends AssetItem>(item: T): T => {
  if (item.itemRestrictions) {
    return {
      ...item,
      ...ItemCardUtils.mapItemRestrictionIcons(item.itemRestrictions, item.itemType ?? ""),
    };
  }
  return item;
};

export const buildItemDetailsUrl = (
  item: { id: number; name: string },
  itemType?: string,
): string => {
  const { id, name } = item;
  if (itemType === "Bundle") {
    return getAbsoluteUrl(`/bundles/${id}/${formatSeoName(name)}`);
  }
  return getAbsoluteUrl(`/catalog/${id}/${formatSeoName(name)}`);
};

export const buildUserLink = (
  item: Pick<CatalogItemDetail, "creatorType" | "creatorTargetId">,
): string => {
  const { creatorType, creatorTargetId } = item;
  switch (creatorType) {
    case assetsConstants.userTypesString.group:
      return getAbsoluteUrl(`/groups/${String(creatorTargetId)}`);
    case assetsConstants.userTypesString.user:
    case undefined:
    default:
      return getAbsoluteUrl(`/users/${String(creatorTargetId)}/profile`);
  }
};

export const mapCatalogDetailsToInventoryItemCard = (
  item: AssetItem,
  itemDetail: CatalogItemDetail,
): AssetItem => {
  const itemType = item.itemType ?? "";
  const { itemRestrictionIcon } = itemDetail.itemRestrictions
    ? ItemCardUtils.mapItemRestrictionIcons(itemDetail.itemRestrictions, itemDetail.itemType ?? "")
    : { itemRestrictionIcon: undefined };
  return {
    AssetRestrictionIcon: {
      cssTag: "",
    },
    itemRestrictionIcon,
    Creator: {
      CreatorProfileLink: buildUserLink(itemDetail),
      nameForDisplay: itemDetail.creatorName,
    },
    Item: {
      Name: itemDetail.name,
      AbsoluteUrl: buildItemDetailsUrl(itemDetail, itemType),
    },
    Product: {
      SerialNumber: item.serialNumber,
      IsFree: itemDetail.price === 0,
      PremiumPriceInRobux: itemDetail.premiumPricing
        ? itemDetail.premiumPricing.premiumPriceInRobux
        : undefined,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      PriceInRobux: itemDetail.lowestPrice ? itemDetail.lowestPrice : itemDetail.price,
    },
    UserItem: {},
    itemV2: {
      thumbnail: {
        type: itemType === "Bundle" ? "BundleThumbnail" : "Asset",
      },
      id: itemDetail.id,
      type: itemType.toLowerCase(),
    },
    priceStatus: itemDetail.priceStatus,
    licenseBadge: mapLicenseBadge(itemDetail.license),
    itemDetailsLoading: false,
  };
};

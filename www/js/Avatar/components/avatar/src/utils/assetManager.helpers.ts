import { ThumbnailTypes } from "@rbx/thumbnails";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { CatalogAssetItem, CatalogOutfitItem } from "../avatar.types";

const getSeoName = (assetName: string): string => {
  let seoName = assetName;
  if (typeof seoName !== "string") {
    seoName = "";
  }

  return (
    seoName
      .replace(/'/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, "") || "unnamed"
  );
};

const getCatalogItemUrl = (assetId: number, assetName: string): string => {
  return getAbsoluteUrl(`/catalog/${assetId}/${getSeoName(assetName)}`);
};

const getLookUrl = (lookId: string): string => {
  return getAbsoluteUrl(`/looks/${lookId}`);
};

function getItemThumbnailAndLink<T extends CatalogAssetItem | CatalogOutfitItem>(
  item: Pick<T, "type" | "name" | "id">,
): Pick<T, "thumbnail" | "thumbnailType" | "link"> {
  return {
    thumbnail: {
      Final: false,
      Url: "",
    },
    thumbnailType:
      item.type === "Asset" ? ThumbnailTypes.assetThumbnail : ThumbnailTypes.userOutfit,
    link: item.type === "Asset" ? getCatalogItemUrl(item.id, item.name) : undefined,
  } as Pick<T, "thumbnail" | "thumbnailType" | "link">;
}

const getExpirationTimeShorthand = (
  expirationTime: string,
  translate: TranslateFunction,
): string => {
  const expiration = new Date(expirationTime);
  const now = new Date();
  const diffTime = expiration.getTime() - now.getTime();

  // If the item has already expired (negative time), don't show a badge
  if (diffTime <= 0) {
    return "";
  }

  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    return translate("Label.DayAbbreviated", { days: diffDays });
  }
  if (diffHours >= 1) {
    return translate("Label.HourAbbreviated", { hours: diffHours });
  }
  return translate("Label.MinuteAbbreviated", { minutes: diffMinutes });
};

export { getCatalogItemUrl, getLookUrl, getExpirationTimeShorthand };
export default getItemThumbnailAndLink;

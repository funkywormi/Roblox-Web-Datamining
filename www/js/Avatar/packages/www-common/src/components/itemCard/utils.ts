import itemCardConstants from "./constants";
import type { ItemCardRestrictions, ItemStatus } from "./types";

/**
 * Local reimplementations of the two `@rbx/core-scripts/format/string` helpers the
 * card needs. www-common must not depend on core-scripts (it is .NET-only), so these
 * are copied verbatim to keep behavior identical across the .NET and Next targets.
 */
export const escapeHtml = (str: string): string =>
  str.replace(/[&<>"'\\/]/g, char => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "/":
        return "&#x2F;";
      default:
        return char;
    }
  });

export const formatSeoName = (name: string): string => {
  if (!name) {
    return "unnamed";
  }
  return (
    name
      .replace(/'/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, "") || "unnamed"
  );
};

export const checkIfBundle = (itemType: string): boolean =>
  itemType.toLowerCase().includes(itemCardConstants.itemTypes.bundle);

/**
 * Relative item URL (e.g. `/catalog/123/some-name`). Relative paths keep the card
 * environment-agnostic — no `@rbx/environment-urls` dependency — matching the
 * `@rbx/avatar-common` `<Link url={/catalog/${id}}>` precedent.
 */
export const getItemLink = (itemId: number, itemName: string, itemType: string): string => {
  const urlType = checkIfBundle(itemType)
    ? itemCardConstants.urlConfigs.bundleRootUrlTemplate
    : itemCardConstants.urlConfigs.assetRootUrlTemplate;
  return `/${urlType}/${itemId}/${formatSeoName(itemName)}`;
};

export const getProfileLink = (
  creatorId: number,
  creatorType: string,
  creatorName: string,
): string => {
  if (creatorType === "Group") {
    return `/groups/${creatorId}/${formatSeoName(creatorName)}`;
  }
  return `/users/${creatorId}/profile`;
};

export const mapItemRestrictionIcons = (
  itemRestrictions: string[] | undefined,
  itemType: string,
): ItemCardRestrictions => {
  const itemCardRestrictions: ItemCardRestrictions = {
    isLimited: false,
    isRthro: false,
    isThirteenPlus: false,
    isLimitedUnique: false,
    isDynamicHead: false,
    isCollectible: false,
    itemRestrictionIcon: "",
  };
  if (itemRestrictions) {
    const { itemRestrictionTypes, itemRestrictionIcons } = itemCardConstants;
    if (checkIfBundle(itemType)) {
      itemCardRestrictions.isLimited = itemRestrictions.includes(itemRestrictionTypes.limited);
      itemCardRestrictions.isRthro = itemRestrictions.includes(itemRestrictionTypes.rthro);
      itemCardRestrictions.isDynamicHead = itemRestrictions.includes(
        itemRestrictionTypes.dynamicHead,
      );
      itemCardRestrictions.isCollectible = itemRestrictions.includes(
        itemRestrictionTypes.collectible,
      );
      itemCardRestrictions.isLimitedUnique = itemRestrictions.includes(
        itemRestrictionTypes.limitedUnique,
      );
      if (itemCardRestrictions.isLimited) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.limited;
      } else if (itemCardRestrictions.isRthro) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.rthroLabel;
      } else if (itemCardRestrictions.isCollectible) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.collectible;
      } else if (itemCardRestrictions.isLimitedUnique) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.limitedUnique;
      } else if (itemCardRestrictions.isDynamicHead) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.dynamicHead;
      }
    } else {
      itemCardRestrictions.isThirteenPlus = itemRestrictions.includes(
        itemRestrictionTypes.thirteenPlus,
      );
      itemCardRestrictions.isLimitedUnique = itemRestrictions.includes(
        itemRestrictionTypes.limitedUnique,
      );
      itemCardRestrictions.isDynamicHead = itemRestrictions.includes(
        itemRestrictionTypes.dynamicHead,
      );
      itemCardRestrictions.isLimited = itemRestrictions.includes(itemRestrictionTypes.limited);
      itemCardRestrictions.isCollectible = itemRestrictions.includes(
        itemRestrictionTypes.collectible,
      );
      if (itemCardRestrictions.isLimitedUnique) {
        itemCardRestrictions.itemRestrictionIcon = itemCardRestrictions.isThirteenPlus
          ? itemRestrictionIcons.thirteenPlusLimitedUnique
          : itemRestrictionIcons.limitedUnique;
      } else if (itemCardRestrictions.isLimited) {
        itemCardRestrictions.itemRestrictionIcon = itemCardRestrictions.isThirteenPlus
          ? itemRestrictionIcons.thirteenPlusLimited
          : itemRestrictionIcons.limited;
      } else if (itemCardRestrictions.isThirteenPlus) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.thirteenPlus;
      } else if (itemCardRestrictions.isCollectible) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.collectible;
      } else if (itemCardRestrictions.isDynamicHead) {
        itemCardRestrictions.itemRestrictionIcon = itemRestrictionIcons.dynamicHead;
      }
    }
  }
  return itemCardRestrictions;
};

export const mapItemStatusIconsAndLabels = (itemStatuses: string[] | undefined): ItemStatus[] => {
  const itemStatusIconsAndLabels: ItemStatus[] = [];
  if (itemStatuses) {
    const { itemStatusClasses, itemStatusIcons, itemStatusLabels, itemStatusTypes } =
      itemCardConstants;
    if (itemStatuses.includes(itemStatusTypes.SaleTimer)) {
      itemStatusIconsAndLabels.push({
        isIcon: true,
        type: itemStatusTypes.SaleTimer,
        iconName: itemStatusIcons.SaleTimer,
        class: "",
        label: "",
      });
    }
    if (itemStatuses.includes(itemStatusTypes.IsFae)) {
      itemStatusIconsAndLabels.push({
        isIcon: true,
        type: itemStatusTypes.IsFae,
        iconName: itemStatusIcons.IsFae,
        class: "",
        label: "",
        isFae: true,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.New)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.New,
        class: itemStatusClasses.New,
        label: itemStatusLabels.New,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.Sale)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.Sale,
        class: itemStatusClasses.Sale,
        label: itemStatusLabels.Sale,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.XboxExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.XboxExclusive,
        class: itemStatusClasses.XboxExclusive,
        label: itemStatusLabels.XboxExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.AmazonExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.AmazonExclusive,
        class: itemStatusClasses.AmazonExclusive,
        label: itemStatusLabels.AmazonExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.GooglePlayExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.GooglePlayExclusive,
        class: itemStatusClasses.GooglePlayExclusive,
        label: itemStatusLabels.GooglePlayExclusive,
      });
    }
    if (itemStatuses.includes(itemStatusTypes.IosExclusive)) {
      itemStatusIconsAndLabels.push({
        isIcon: false,
        type: itemStatusTypes.IosExclusive,
        class: itemStatusClasses.IosExclusive,
        label: itemStatusLabels.IosExclusive,
      });
    }
  }
  return itemStatusIconsAndLabels;
};

import { CatalogItem, ItemLicenseType } from "../avatar.types";

/**
 * Translation keys for the licensing badge shown over an item card thumbnail.
 * Sourced from the `Feature.Avatar` namespace. The badge uses Foundation's
 * `Neutral` variant as-is, including its translucent background.
 */
const LICENSE_TYPE_LABELS: Record<ItemLicenseType, string> = {
  FirstParty: "Label.LicensingOfficial",
  ThirdParty: "Label.LicensingLicensed",
};

/**
 * Returns the translation key for an item's licensing badge, or undefined when
 * the item carries no license block (the common case) or the API sends a
 * licenseType this client doesn't know about yet.
 */
export function getLicenseBadgeLabelKey(item: Pick<CatalogItem, "license">): string | undefined {
  const licenseType = item.license?.licenseType;
  return licenseType ? LICENSE_TYPE_LABELS[licenseType] : undefined;
}

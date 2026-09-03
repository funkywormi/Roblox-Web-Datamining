import parseRbxAssetId from './parseRbxAssetId';

/**
 * Maps PascalCase API icon names (e.g. TagSparkle) to Foundation icon classes.
 *
 * IMPORTANT: the class names below MUST be written as literal strings. The catalog
 * Tailwind build only generates an icon's `--svg` rule when it sees the class as a
 * literal in scanned source. A dynamically built `icon-regular-${name}` string gets
 * purged, leaving the `.icon` base (background-color: currentColor) with no mask —
 * which renders as a solid colored box instead of the icon.
 *
 * To support a new offer icon, add its literal class here.
 */
const MARKETPLACE_OFFER_ICON_CLASS_BY_NAME: Record<string, string> = {
  Tag: 'icon-regular-tag',
  TagArrowUp: 'icon-regular-tag-arrow-up',
  TagSparkle: 'icon-regular-tag-sparkle',
  TagSparkleArrowUp: 'icon-regular-tag-sparkle-arrow-up',
  TagFilled: 'icon-filled-tag',
  TagArrowUpFilled: 'icon-filled-tag-arrow-up',
  TagSparkleFilled: 'icon-filled-tag-sparkle',
  TagSparkleArrowUpFilled: 'icon-filled-tag-sparkle-arrow-up'
};

export function marketplaceOfferIconToFoundationName(icon?: string): string | undefined {
  if (!icon?.trim()) {
    return undefined;
  }

  const trimmed = icon.trim();

  if (parseRbxAssetId(trimmed)) {
    return undefined;
  }

  return MARKETPLACE_OFFER_ICON_CLASS_BY_NAME[trimmed];
}

/**
 * Like {@link marketplaceOfferIconToFoundationName}, but returns the filled
 * variant of the icon (e.g. `icon-filled-tag-sparkle`). Used by the banner,
 * which renders the filled style regardless of the variant the API sends.
 *
 * The resulting `icon-filled-*` strings are guaranteed to exist as literals in
 * MARKETPLACE_OFFER_ICON_CLASS_BY_NAME above, so Tailwind keeps their rules.
 */
export function marketplaceOfferIconToFilledFoundationName(icon?: string): string | undefined {
  const regular = marketplaceOfferIconToFoundationName(icon);
  if (!regular) {
    return undefined;
  }

  return regular.replace('icon-regular-', 'icon-filled-');
}

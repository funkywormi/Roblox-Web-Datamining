import type {
  TDetailEntry,
  TTimedOption,
} from "@rbx/catalog/itemDetailsHydrationService/constants/itemDetailsHydrationConstants";
import AvatarAPIService from "./avatarAPIService";

/**
 * Next-safe replacement for `ItemDetailsHydrationService.getItemDetails` (not SSR-safe). Reuses the
 * dual-target `AvatarAPIService.postItemDetails` and re-applies only the `timedOptions` shaping the
 * dialog needs; the old cache/retry/collectible paths are dropped since the dialog never uses them.
 */

// Prepend a synthetic permanent (`days: 0`) option at the item's price, selected unless the API
// already selected a timed one. Mirrors `getTimedOptions` in `@rbx/catalog`.
const withPermanentTimedOption = (item: TDetailEntry): TTimedOption[] | undefined => {
  const { timedOptions, discountInformation } = item;
  if (timedOptions == null || timedOptions.length === 0) {
    return undefined;
  }
  const hasSelectedTimedOption = timedOptions.some(option => option.selected);
  const permanentOption: TTimedOption = {
    days: 0,
    price: item.price ?? 0,
    selected: !hasSelectedTimedOption,
  };
  if (discountInformation) {
    permanentOption.discountInformation = discountInformation;
  }
  return [permanentOption, ...timedOptions];
};

/**
 * Fetches catalog item details for the given asset ids with `timedOptions` shaped as the dialog
 * expects (permanent option prepended). Asset ids only — the dialog is `itemType: "Asset"`.
 */
export const getExpiredItemDetails = async (assetIds: number[]): Promise<TDetailEntry[]> => {
  const response = await AvatarAPIService.postItemDetails(
    assetIds.map(id => ({ assetId: id })),
    "Asset",
  );
  // Same endpoint payload, but the dialog reads the fuller `TDetailEntry` shape (incl.
  // `timedOptions`) than `postItemDetails` types — re-type at this boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- same endpoint payload, narrower avatar view
  const entries = response.data as unknown as TDetailEntry[];
  return entries.map(entry => ({ ...entry, timedOptions: withPermanentTimedOption(entry) }));
};

export default getExpiredItemDetails;

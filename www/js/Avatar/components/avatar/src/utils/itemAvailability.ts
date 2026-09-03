import { AvatarItemAvailabilityStatus, CatalogItem } from "../avatar.types";

/**
 * Returns true when an inventory item should render as a disabled, non-clickable
 * placeholder in the Avatar Editor grid.
 *
 * This is the predicate the Recent / Makeup / Avatars→Purchased tiles share for
 * outfits whose linked Look or Bundle is no longer wearable (suppressed look,
 * moderated bundle, etc.) and surfaces from `/v1/avatar-inventory` as
 * `availabilityStatus = "Unavailable"` or `"PendingReview"`.
 *
 * `Expired` is intentionally excluded: expired entitlements have their own
 * dialog flow handled elsewhere in {@link AvatarItemsContent}.
 */
export function isItemAvailabilityBlocked(
  status: AvatarItemAvailabilityStatus | undefined,
): boolean {
  return status === "Unavailable" || status === "PendingReview";
}

/**
 * Convenience overload that operates directly on a catalog item.
 */
export function isCatalogItemUnavailable(item: Pick<CatalogItem, "availabilityStatus">): boolean {
  return isItemAvailabilityBlocked(item.availabilityStatus);
}

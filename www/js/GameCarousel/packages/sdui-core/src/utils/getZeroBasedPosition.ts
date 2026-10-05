/**
 * SDUI position fields (`collectionPosition`, `itemPosition`) are 1-based to
 * match Lua. Legacy web event params (`sortPos`, `position`) are 0-based.
 * Converts between the two, collapsing unset/invalid values to `-1`.
 *
 */
export const getZeroBasedPosition = (position: number | undefined): number =>
  position !== undefined && position > 0 ? position - 1 : -1;

import { TResaleRecord } from "../constants/types";

// Mixed types compare by `typeof` name first, so numbers sort ahead of null, and null ahead of
// undefined. Row order is this comparator's, never the endpoint's.
const compareValues = (a: unknown, b: unknown): number => {
  const typeA = typeof a;
  const typeB = typeof b;
  if (typeA !== typeB) {
    return typeA < typeB ? -1 : 1;
  }
  if (a === b) {
    return 0;
  }
  return (a as never) < (b as never) ? -1 : 1;
};

export const orderResaleRecords = (resaleRecords: TResaleRecord[]): TResaleRecord[] =>
  [...resaleRecords].sort(
    (a, b) => compareValues(a.price, b.price) || compareValues(a.userAssetId, b.userAssetId),
  );

export default orderResaleRecords;

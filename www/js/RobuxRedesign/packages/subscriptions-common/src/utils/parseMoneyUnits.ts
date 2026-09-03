/**
 * Normalizes price units from API payloads that may send numbers or numeric strings.
 */
export function parseMoneyUnits(value: number | string | undefined): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

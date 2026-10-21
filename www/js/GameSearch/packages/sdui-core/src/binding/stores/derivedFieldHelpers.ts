const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

/**
 * Format an SDUI hydration timestamp as a locale date (e.g. "Feb 18, 2026").
 *
 * Accepts the two shapes the wire format emits:
 * - JSON ISO 8601 string ("2026-02-18T08:47:39.272Z")
 * - Protobuf `Timestamp` (`{ seconds, nanos }`) — `seconds` may be a
 *   number or numeric string; both `seconds` and `Seconds` are accepted.
 *
 * Returns `undefined` when the input is missing, malformed, or epoch
 * (epoch is treated as "no timestamp" — no real hydration record has it).
 */
export function hydrationTimestampToLocalDateString(timestampValue: unknown): string | undefined {
  if (!timestampValue) return undefined;

  if (typeof timestampValue === "string") {
    const parsedDate = new Date(timestampValue);
    return Number.isNaN(parsedDate.getTime())
      ? undefined
      : parsedDate.toLocaleDateString(undefined, DATE_FORMAT);
  }

  if (typeof timestampValue !== "object") return undefined;

  const protoTimestamp = timestampValue as { seconds?: unknown; Seconds?: unknown };
  const epochSeconds = Number(protoTimestamp.seconds ?? protoTimestamp.Seconds);
  if (!epochSeconds || Number.isNaN(epochSeconds)) return undefined;

  return new Date(epochSeconds * 1000).toLocaleDateString(undefined, DATE_FORMAT);
}

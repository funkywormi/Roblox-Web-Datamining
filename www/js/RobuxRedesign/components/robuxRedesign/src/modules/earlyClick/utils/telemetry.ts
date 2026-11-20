// Naming for what the early-click system reports (observability counter and payments-flow event).

export type EarlyClickOutcome =
  /** The held tap was replayed as a normal click. */
  | "replayed"
  /** A redirect tap waited so long the browser no longer treats it as a user gesture; not replayed. */
  | "activationLost"
  /** A redirect row never got its URL, so the held tap was dropped (the user sees the redirect error dialog). */
  | "gaveUp"
  /** The capture script's own timeout fired before React could resolve the tap. */
  | "expired"
  /** The page was hidden (tab switch, app backgrounded, navigation) while the tap was held. */
  | "abandoned"
  /** The user tapped a control the script will not hold, so the queued tap was discarded. */
  | "dropped"
  /** The user tapped a different row, so this tap was replaced by that one. */
  | "replaced";

/**
 * Every held tap is reported as `held` when React first sees it, then exactly once with how it
 * ended. A `held` without an outcome is a tap whose page died before it could even report leaving.
 */
export type EarlyClickStep = "held" | EarlyClickOutcome;

export type EarlyClickKind = "product" | "subscription";

/** What the held tap was waiting for: React to hydrate, or (redirect rows) the auth ticket URL. */
export type EarlyClickWaitingFor = "hydration" | "redirectUrl";

const WAIT_BUCKETS = [
  { maxMs: 1000, label: "0-1s" },
  { maxMs: 2000, label: "1-2s" },
  { maxMs: 5000, label: "2-5s" },
  { maxMs: 10000, label: "5-10s" },
] as const;

export type EarlyClickWaitBucket = (typeof WAIT_BUCKETS)[number]["label"] | "10s+";

export const getEarlyClickWaitBucket = (waitMs: number): EarlyClickWaitBucket =>
  WAIT_BUCKETS.find(({ maxMs }) => waitMs <= maxMs)?.label ?? "10s+";

export type EarlyClickTapCountBucket = "1" | "2" | "3" | "4+";

export const getEarlyClickTapCountBucket = (taps: number): EarlyClickTapCountBucket => {
  if (taps <= 1) {
    return "1";
  }
  if (taps === 2) {
    return "2";
  }
  return taps === 3 ? "3" : "4+";
};

/** Splits a key built by `robuxProductEarlyClickKey` / `subscriptionEarlyClickKey`. */
export const parseEarlyClickKey = (key: string): { kind: EarlyClickKind; productId: string } => {
  const separator = key.indexOf(":");
  if (separator === -1) {
    return { kind: "product", productId: key };
  }
  const kind = key.slice(0, separator) === "subscription" ? "subscription" : "product";
  const rawId = key.slice(separator + 1);
  // `robuxProductEarlyClickKey` appends `|scope` so two sections can hold the same product apart.
  const scopeSeparator = kind === "product" ? rawId.lastIndexOf("|") : -1;
  return {
    kind,
    productId: scopeSeparator === -1 ? rawId : rawId.slice(0, scopeSeparator),
  };
};

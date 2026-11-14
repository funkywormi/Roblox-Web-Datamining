import { format } from "../intl";

/** Trailing parenthetical, in ASCII or fullwidth parens. */
const TRAILING_PARENTHETICAL = /\s*[(\uFF08]([^)\uFF09]*)[)\uFF09]\s*$/u;

/** True when every month/day token from the badge date appears in the parenthetical. */
function parentheticalContainsFormattedDate(inner: string, formattedDate: string): boolean {
  const haystack = inner.toLocaleLowerCase();
  const parts = formattedDate
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(part => part.length > 0);

  if (parts.length === 0) {
    return false;
  }

  return parts.every(part => {
    if (/^\d+$/u.test(part)) {
      return new RegExp(`(?:^|\\D)${part}(?:\\D|$)`, "u").test(haystack);
    }

    return haystack.includes(part);
  });
}

/**
 * Cart-pricing often appends a localized "(ends …)" to `localizedDescription`
 * while also returning `expirationTimeUtc`. When the clock badge will render,
 * strip that trailing parenthetical only if it contains the formatted badge
 * date. Discount qualifiers such as "(up to 30 Robux)" or "(hasta 30)" stay,
 * and a suffix that is not in parentheses stays too: dropping offer terms is
 * worse than showing the date twice.
 */
export function stripInlineOfferExpiration(
  localizedDescription: string,
  formattedDate: string | null | undefined,
): string {
  if (!formattedDate?.trim()) {
    return localizedDescription.trim();
  }

  const match = TRAILING_PARENTHETICAL.exec(localizedDescription);
  const inner = match?.[1];
  if (
    match === null ||
    inner === undefined ||
    !parentheticalContainsFormattedDate(inner, formattedDate)
  ) {
    return localizedDescription.trim();
  }

  return localizedDescription.slice(0, match.index).trim();
}

/** Cart-pricing end dates are exclusive cutoffs on the Pacific calendar day. */
const OFFER_EXPIRATION_TIME_ZONE = "America/Los_Angeles";

/**
 * Formats a cart-pricing `expirationTimeUtc` for the offer badge (e.g. "Dec 9").
 * Uses `@rbx/www-common/intl` so month names follow the page locale, and
 * America/Los_Angeles so the day matches the API copy in every browser timezone.
 *
 * Cart-pricing's timestamp is an exclusive Pacific cutoff (e.g.
 * `2026-11-24T08:00:00Z` for copy that says "ends Nov 23"), so we format the
 * last inclusive Pacific instant to match that calendar day.
 *
 * Returns null when the timestamp is missing, invalid, or already past.
 */
export function formatOfferExpirationDate(expirationTimeUtc: string | undefined): string | null {
  if (!expirationTimeUtc?.trim()) {
    return null;
  }

  const expiration = new Date(expirationTimeUtc);
  if (Number.isNaN(expiration.getTime()) || expiration.getTime() <= Date.now()) {
    return null;
  }

  // Last moment the offer is still valid in Pacific time.
  const lastInclusivePacific = new Date(expiration.getTime() - 1);
  const formatted = format.dateTime(lastInclusivePacific, {
    month: "short",
    day: "numeric",
    timeZone: OFFER_EXPIRATION_TIME_ZONE,
  });

  return formatted.trim() ? formatted : null;
}

/**
 * Offer copy for the checkbox. The inline date stays when the badge will not
 * render (missing, invalid, or past timestamp), so the user still sees an end date.
 */
export function descriptionWithoutInlineExpiration(
  localizedDescription: string,
  expirationTimeUtc: string | undefined,
): string {
  const formattedDate = formatOfferExpirationDate(expirationTimeUtc);
  if (!formattedDate) {
    return localizedDescription;
  }

  return stripInlineOfferExpiration(localizedDescription, formattedDate);
}

/** Builds the badge label, e.g. "Ends Dec 9". */
export function formatOfferExpirationLabel(
  expirationTimeUtc: string | undefined,
  endsLabel: (date: string) => string,
): string | null {
  const date = formatOfferExpirationDate(expirationTimeUtc);
  return date ? endsLabel(date) : null;
}

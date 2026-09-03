/*
 * Self-contained persistence for the marketplace offer ids a user selected in the
 * Robux upsell modal. The canonical upsell cookie parser lives in the shared
 * `core-scripts` package and cannot be extended with new fields here, so we keep
 * `offerIds` in sessionStorage keyed by the same `upsellUuid` that ties the cookie
 * to the redirect. sessionStorage survives the same-tab redirect to the Buy Robux
 * page and back, and is scoped to this WebApp's read/write sites.
 */
const STORAGE_KEY_PREFIX = 'RBXUpsellOfferIds:';

function storageKey(upsellUuid: string): string {
  return `${STORAGE_KEY_PREFIX}${upsellUuid}`;
}

export function writeUpsellOfferIds(upsellUuid: string, offerIds: string[] | undefined): void {
  if (!upsellUuid || !offerIds?.length) {
    return;
  }
  try {
    window.sessionStorage.setItem(storageKey(upsellUuid), JSON.stringify(offerIds));
  } catch {
    // sessionStorage can be unavailable (private mode / quota); offers simply
    // won't persist and the auto-purchase falls back to no offers.
  }
}

export function readUpsellOfferIds(upsellUuid: string | undefined): string[] {
  if (!upsellUuid) {
    return [];
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(upsellUuid));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

export function clearUpsellOfferIds(upsellUuid: string | undefined): void {
  if (!upsellUuid) {
    return;
  }
  try {
    window.sessionStorage.removeItem(storageKey(upsellUuid));
  } catch {
    // ignore
  }
}

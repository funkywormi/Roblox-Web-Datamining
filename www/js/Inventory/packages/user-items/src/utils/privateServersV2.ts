// Loads the My Private Servers tab from private-servers-api-v2 in the v1 row shape the page renders.

export type PrivateServerV2 = {
  universeId: number;
  rootPlaceId: number;
  universeName: string;
  serverName: string;
  ownerUserId: number;
  ownerUsername: string;
  // priceInRobux is after discounts, so a server free through Plus reports 0.
  renewalPrice: { priceInRobux: number; discounts: { amount: number; source: string }[] } | null;
  status: "Active" | "Canceled" | "Expired";
  joinEnabled: boolean;
  expirationTime: string;
  hasPurchaseSchedule: boolean;
};

export type ListUserPrivateServersResponse = {
  privateServers: PrivateServerV2[];
  nextPageToken?: string | null;
};

// The subset of the v1 my-private-servers row that assetsService.translatePrivateServer reads.
export type PrivateServerV1Item = {
  name: string;
  placeId: number;
  universeId: number;
  universeName: string;
  ownerId: number;
  ownerName: string;
  priceInRobux?: number | null;
  isUnavailable?: boolean;
  isExpiring?: boolean;
  isInactive?: boolean;
  priceLine?: PrivateServerPriceLine | null;
};

// The card has room for one of these, in this priority order.
export type PrivateServerPriceLine =
  | { kind: "inactive" }
  | { kind: "expiring"; expirationTime: string }
  | { kind: "freeWithPlus" }
  | { kind: "price"; priceInRobux: number; originalPriceInRobux: number | null };

export type PrivateServersPage = {
  items: PrivateServerV1Item[];
  nextPageCursor: string | null;
};

// translatePrivateServer renders "Free" only for a null price and "Offsale" for any other missing price.
// v2 sends 0 for free servers and a null renewalPrice for servers no longer for sale.
const toV1Price = (renewalPrice: PrivateServerV2["renewalPrice"]): number | null | undefined => {
  if (!renewalPrice) {
    return undefined;
  }
  return renewalPrice.priceInRobux > 0 ? renewalPrice.priceInRobux : null;
};

const expiringWindowMs = 14 * 24 * 60 * 60 * 1000;

// Canceled servers stay joinable until they expire, so both badges apply to anything not yet Expired.
const getStatusBadges = (server: PrivateServerV2, now: number) => {
  if (server.status === "Expired") {
    return { isUnavailable: false, isExpiring: false };
  }
  const willRenew = server.status === "Active" && server.hasPurchaseSchedule;
  return {
    isUnavailable: !server.joinEnabled,
    isExpiring: !willRenew && Date.parse(server.expirationTime) - now <= expiringWindowMs,
  };
};

// Null leaves free and offsale servers on the existing price labels.
const getPriceLine = (
  server: PrivateServerV2,
  isExpiring: boolean,
): PrivateServerPriceLine | null => {
  if (server.status === "Expired") {
    return { kind: "inactive" };
  }
  const { renewalPrice } = server;
  const priceInRobux = renewalPrice?.priceInRobux ?? 0;
  // Plus is the only discount source, so any discount means Plus is lowering the price.
  const discountTotal =
    renewalPrice?.discounts.reduce((sum, discount) => sum + discount.amount, 0) ?? 0;
  // Free servers have no expiry.
  if (renewalPrice && priceInRobux + discountTotal <= 0) {
    return null;
  }
  if (isExpiring) {
    return { kind: "expiring", expirationTime: server.expirationTime };
  }
  if (!renewalPrice) {
    return null;
  }
  if (priceInRobux === 0) {
    return { kind: "freeWithPlus" };
  }
  return {
    kind: "price",
    priceInRobux,
    originalPriceInRobux: discountTotal > 0 ? priceInRobux + discountTotal : null,
  };
};

export const mapPrivateServerV2ToV1 = (
  server: PrivateServerV2,
  now: number = Date.now(),
): PrivateServerV1Item => {
  const statusBadges = getStatusBadges(server, now);
  return {
    name: server.serverName,
    placeId: server.rootPlaceId,
    universeId: server.universeId,
    universeName: server.universeName,
    ownerId: server.ownerUserId,
    ownerName: server.ownerUsername,
    priceInRobux: toV1Price(server.renewalPrice),
    isInactive: server.status === "Expired",
    ...statusBadges,
    priceLine: getPriceLine(server, statusBadges.isExpiring),
  };
};

export const loadMyPrivateServersPage = async (
  fetchV2: (pageToken: string) => PromiseLike<ListUserPrivateServersResponse>,
  pageToken: string,
): Promise<PrivateServersPage> => {
  const response = await fetchV2(pageToken);
  const now = Date.now();
  return {
    items: response.privateServers.map(server => mapPrivateServerV2ToV1(server, now)),
    // The pager keeps requesting pages while the cursor is a string, so the last page must return null.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    nextPageCursor: response.nextPageToken || null,
  };
};

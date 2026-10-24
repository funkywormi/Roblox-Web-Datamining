// Loads the My Private Servers tab from private-servers-api-v2, falling back to the v1 games API.
// v1 cursors are page numbers and v2 tokens are opaque, so v2 cursors carry a prefix and every
// later page of a paging session stays on the API that served its first page.

import { fireEvent } from 'roblox-event-tracker';

export const V2_CURSOR_PREFIX = 'v2:';

export type PrivateServerV2 = {
  universeId: number;
  rootPlaceId: number;
  universeName: string;
  serverName: string;
  ownerUserId: number;
  ownerUsername: string;
  renewalPrice: { priceInRobux: number } | null;
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
};

export type PrivateServersPage = {
  items: PrivateServerV1Item[];
  nextPageCursor: string | null;
};

// translatePrivateServer renders "Free" only for a null price and "Offsale" for any other missing price.
// v2 sends 0 for free servers and a null renewalPrice for servers no longer for sale.
const toV1Price = (renewalPrice: PrivateServerV2['renewalPrice']): number | null | undefined => {
  if (!renewalPrice) {
    return undefined;
  }
  return renewalPrice.priceInRobux > 0 ? renewalPrice.priceInRobux : null;
};

export const mapPrivateServerV2ToV1 = (server: PrivateServerV2): PrivateServerV1Item => {
  return {
    name: server.serverName,
    placeId: server.rootPlaceId,
    universeId: server.universeId,
    universeName: server.universeName,
    ownerId: server.ownerUserId,
    ownerName: server.ownerUsername,
    priceInRobux: toV1Price(server.renewalPrice)
  };
};

export const isV2Cursor = (cursor: unknown): cursor is string =>
  typeof cursor === 'string' && cursor.startsWith(V2_CURSOR_PREFIX);

// The pager keeps requesting pages while the cursor is a string, so the last page must return null.
export const toV2Cursor = (pageToken: string | null | undefined): string | null =>
  pageToken ? `${V2_CURSOR_PREFIX}${pageToken}` : null;

export const fromV2Cursor = (cursor: string): string => cursor.slice(V2_CURSOR_PREFIX.length);

const loadV2Page = async (
  fetchV2: (pageToken: string) => PromiseLike<ListUserPrivateServersResponse>,
  pageToken: string
): Promise<PrivateServersPage> => {
  const response = await fetchV2(pageToken);
  if (!response || !Array.isArray(response.privateServers)) {
    throw new Error('Malformed private-servers-api-v2 response');
  }
  return {
    items: response.privateServers.map(mapPrivateServerV2ToV1),
    nextPageCursor: toV2Cursor(response.nextPageToken)
  };
};

export const loadMyPrivateServersPage = async ({
  cursor,
  v2Enabled,
  fetchV1,
  fetchV2
}: {
  cursor: string;
  v2Enabled: boolean;
  fetchV1: (cursor: string) => PromiseLike<PrivateServersPage>;
  fetchV2: (pageToken: string) => PromiseLike<ListUserPrivateServersResponse>;
}): Promise<PrivateServersPage> => {
  if (isV2Cursor(cursor)) {
    // Never fall back mid-session: v1 can't resume from a v2 token, and restarting would duplicate rows.
    return loadV2Page(fetchV2, fromV2Cursor(cursor));
  }

  if (cursor === '' && v2Enabled) {
    try {
      return await loadV2Page(fetchV2, '');
    } catch {
      fireEvent('InventoryMyPrivateServersV2FellBack');
      return fetchV1('');
    }
  }

  return fetchV1(cursor);
};

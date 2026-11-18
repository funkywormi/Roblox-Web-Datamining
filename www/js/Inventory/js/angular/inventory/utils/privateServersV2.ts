// Loads the My Private Servers tab from private-servers-api-v2 in the v1 row shape the page renders.

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

export const loadMyPrivateServersPage = async (
  fetchV2: (pageToken: string) => PromiseLike<ListUserPrivateServersResponse>,
  pageToken: string
): Promise<PrivateServersPage> => {
  const response = await fetchV2(pageToken);
  return {
    items: response.privateServers.map(mapPrivateServerV2ToV1),
    // The pager keeps requesting pages while the cursor is a string, so the last page must return null.
    nextPageCursor: response.nextPageToken || null
  };
};

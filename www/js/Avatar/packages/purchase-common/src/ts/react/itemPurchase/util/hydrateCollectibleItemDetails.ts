import type { CollectibleItemDetails } from '../types/itemDetails';

// postItemDetails omits collectibleItemDetails, which downstream price/purchase code reads for
// collectible items. Fetch those details and re-attach them by matching collectibleItemId.
// `fetchCollectibleDetails` takes a list of collectibleItemIds and resolves to their details.
async function hydrateCollectibleItemDetails<
  T extends { collectibleItemId?: string; collectibleItemDetails?: CollectibleItemDetails }
>(items: T[], fetchCollectibleDetails: (ids: string[]) => Promise<CollectibleItemDetails[]>) {
  const collectibleItemIds = items
    .filter(item => item.collectibleItemId && item.collectibleItemDetails === undefined)
    .map(item => item.collectibleItemId as string);
  if (collectibleItemIds.length === 0) {
    return items;
  }
  const collectibleDetails = await fetchCollectibleDetails(collectibleItemIds);
  items.forEach(item => {
    if (item.collectibleItemId && item.collectibleItemDetails === undefined) {
      item.collectibleItemDetails = collectibleDetails.find(
        detail => detail.collectibleItemId === item.collectibleItemId
      );
    }
  });
  return items;
}

export default hydrateCollectibleItemDetails;

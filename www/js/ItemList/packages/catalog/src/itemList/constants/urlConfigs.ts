import environmentUrls from "@rbx/environment-urls";

export const urlConfigs = {
  assetRootUrlTemplate: "catalog",
  bundleRootUrlTemplate: "bundles",
  getItemOwnershipUrl: (userId: number, itemType: string, itemTargetId: number): string =>
    `${environmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemTargetId}/is-owned`,
};

export default urlConfigs;

import { EnvironmentUrls } from 'Roblox';

export const urlConfigs = {
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles',
  getItemOwnershipUrl: (userId: number, itemType: string, itemTargetId: number): string =>
    `${EnvironmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemTargetId}/is-owned`
};

export default urlConfigs;

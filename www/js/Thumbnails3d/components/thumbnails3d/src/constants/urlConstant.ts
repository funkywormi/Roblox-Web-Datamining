import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import environmentUrls from "@rbx/environment-urls";

const { thumbnailsApi } = environmentUrls;

export const getAvatarThumbnail3dJsonUrl = (userId: number) =>
  getAbsoluteUrl(`${thumbnailsApi}/v1/users/avatar-3d?userId=${userId}`);

export const getAnimationManifestJsonUrl = (assetId: number) =>
  getAbsoluteUrl(`${thumbnailsApi}/v1/asset-thumbnail-animated?assetId=${assetId}`);

export const getAssetJsonUrl = (assetId: number) =>
  getAbsoluteUrl(`${thumbnailsApi}/v1/assets-thumbnail-3d?assetId=${assetId}`);

export const getUserOutfitJsonUrl = (userOutfitId: number) =>
  getAbsoluteUrl(`${thumbnailsApi}/v1/users/outfit-3d?outfitId=${userOutfitId}`);

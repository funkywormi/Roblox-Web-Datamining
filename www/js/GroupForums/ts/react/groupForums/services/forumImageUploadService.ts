import assetUploadService from '../../shared/services/assetUploadService';
import forumsService from './forumsService';

const uploadImageAndGetAssetId = async (
  groupId: number,
  categoryId: string,
  file: File,
  signal?: AbortSignal
): Promise<number> => {
  const operation = await forumsService.uploadForumImage(groupId, categoryId, file, signal);
  return assetUploadService.completeOperationAndGetAssetId(operation, signal);
};

export default {
  uploadImageAndGetAssetId
};
